import express, { Request, Response, NextFunction, RequestHandler } from "express";
import path from "path";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, limit, deleteDoc, increment } from "firebase/firestore";
import fs from "fs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Retrying after ${delayMs}ms...`);
    await sleep(delayMs);
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

async function logEvent(workspaceId: string, requestId: string, type: string, message: string, meta: any = {}) {
  try {
    await addDoc(collection(db, "workspaces", workspaceId, "logs"), {
      request_id: requestId,
      type,
      message,
      meta,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Log writing error:", error);
  }
}

// -------------------------------------------------------------
// BILLING SERVICE ARCHITECTURE
// -------------------------------------------------------------
async function evaluatePlanLimits(workspaceId: string) {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  const snap = await getDoc(workspaceRef);
  if (!snap.exists()) throw new Error("Workspace not found");
  
  const data = snap.data();
  const plan = data.plan || "free";
  const status = data.subscription_status || "active"; // active, past_due, canceled
  
  const limits = plan === "pro" 
    ? { events: 50000, workflows: 50, alerts: -1, retentionDays: 30, slack: true }
    : { events: 1000, workflows: 3, alerts: 10, retentionDays: 7, slack: false };

  return { plan, limits, data, status };
}

async function checkAndIncrementUsage(workspaceId: string, metric: 'events' | 'alerts', maxAllowed: number): Promise<boolean> {
  if (maxAllowed === -1) return true; // unlimited
  
  const today = new Date().toISOString().split('T')[0];
  const usageRef = doc(db, "workspaces", workspaceId, "usage", today);
  
  try {
    const snap = await getDoc(usageRef);
    if (!snap.exists()) {
      await setDoc(usageRef, { events: 0, alerts: 0, date: today }, { merge: true });
    } else {
      const currentCount = snap.data()[metric] || 0;
      if (currentCount >= maxAllowed) return false;
    }
    
    // Atomic increment
    await updateDoc(usageRef, { [metric]: increment(1) });
    return true;
  } catch (e) {
    console.error("Usage tracking error", e);
    return false; // Fail safe on rate limiting
  }
}

async function calculateUsage(workspaceId: string) {
  const today = new Date().toISOString().split('T')[0];
  const usageRef = doc(db, "workspaces", workspaceId, "usage", today);
  const snap = await getDoc(usageRef);
  return snap.exists() ? snap.data() : { events: 0, alerts: 0, date: today };
}

// -------------------------------------------------------------
// ALERTING & ASYNC PROCESSING
// -------------------------------------------------------------
async function sendAlert(workspaceId: string, workflowId: string, message: string, requestId: string) {
  try {
    const { limits, data, status } = await evaluatePlanLimits(workspaceId);
    if (status !== 'active') return false;
    
    const allowed = await checkAndIncrementUsage(workspaceId, 'alerts', limits.alerts);
    if (!allowed) {
      await logEvent(workspaceId, requestId, 'quota_exceeded', 'Daily alerts limit reached', { metric: 'alerts' });
      return false;
    }

    const workflowSnap = await getDoc(doc(db, "workspaces", workspaceId, "workflows", workflowId));
    const workflowName = workflowSnap.exists() ? workflowSnap.data().name : "Unknown Workflow";

    await withRetry(() => addDoc(collection(db, "workspaces", workspaceId, "workflows", workflowId, "alerts"), {
      message,
      createdAt: new Date().toISOString(),
      read: false
    }));
    
    if (limits.slack && data.slackWebhookUrl) {
       await withRetry(() => fetch(data.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `🚨 *Agency Pulse Alert*\nWorkflow: ${workflowName}\nMessage: ${message}` })
      }).then(res => { if (!res.ok) throw new Error("Slack webhook failed"); return res; }));
    }
    
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_")) {
      await withRetry(() => resend.emails.send({
        from: 'alerts@agencypulse.com',
        to: 'user-email-placeholder@resend.dev',
        subject: `Alert: ${workflowName}`,
        html: `<p><strong>Agency Pulse Alert</strong></p><p>Workflow: ${workflowName}</p><p>${message}</p>`
      }));
    }
    
    await logEvent(workspaceId, requestId, 'alert_sent', message, { workflowId });
    return true;
  } catch (error: any) {
    console.error("Alert generation error:", error);
    await logEvent(workspaceId, requestId, 'system_error', `Failed to send alert: ${error.message}`);
    return false;
  }
}

// Ensure payload has basic structure
function sanitizePayload(payload: any) {
  if (typeof payload !== 'object' || payload === null) return { raw: payload };
  return {
    status: typeof payload.status === 'string' ? payload.status : 'success',
    ...payload
  };
}

async function processWebhookAsync(workspaceId: string, workflowId: string, payloadString: string, payload: any, reqId: string) {
  try {
    const timeWindow = Math.floor(Date.now() / 60000); // 1-minute window
    const dedupHash = crypto.createHash('sha256').update(`${workspaceId}_${workflowId}_${payloadString}_${timeWindow}`).digest('hex');
    
    const eventRef = doc(db, "workspaces", workspaceId, "workflows", workflowId, "events", dedupHash);
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
       await logEvent(workspaceId, reqId, 'webhook_deduplicated', `Event ignored for ${workflowId} with hash ${dedupHash}`);
       return;
    }

    await setDoc(eventRef, {
      status: payload.status,
      payload: payloadString,
      receivedAt: new Date().toISOString()
    });

    await logEvent(workspaceId, reqId, 'webhook_processed', `Webhook processed for ${workflowId} with status ${payload.status}`);

    if (payload.status === "error") {
      await sendAlert(workspaceId, workflowId, `Webhook reported an error payload.`, reqId);
    }

    const workflowRef = doc(db, "workspaces", workspaceId, "workflows", workflowId);
    await updateDoc(workflowRef, {
      lastEventAt: new Date().toISOString(),
      status: payload.status === "error" ? "warning" : "healthy"
    });
  } catch (err: any) {
    await logEvent(workspaceId, reqId, 'system_error', `Async processing failed: ${err.message}`);
  }
}

declare global {
  namespace Express {
    interface Request {
      reqId: string;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Request ID Middleware
  app.use((req, res, next) => {
    req.reqId = uuidv4();
    next();
  });

  // 4. Rate Limiting Layer
  const webhookLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per api_key per minute
    keyGenerator: (req) => {
      return (req.query.api_key as string) || 'anonymous';
    },
    handler: (req: any, res: any) => {
      res.status(429).json({
        success: false,
        error: { code: "RATE_LIMITED", message: "Too many requests, please try again later.", retry_after: 60 },
        request_id: req.reqId
      });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const webhookHandler: RequestHandler = async (req, res) => {
    try {
      const { workspaceId, workflowId } = req.params;
      const { api_key } = req.query;
      const rawPayload = req.body;
      const reqId = req.reqId;
      
      const { data: workspaceData, limits, status } = await evaluatePlanLimits(workspaceId);
      
      if (status !== 'active') {
         res.status(402).json({ success: false, error: { code: "PAYMENT_REQUIRED", message: "Subscription inactive" }, request_id: reqId });
         return;
      }

      // 3. Multi-Tenant Security Validation
      if (!workspaceData.apiKey || workspaceData.apiKey !== api_key) {
        await logEvent(workspaceId, reqId, 'auth_failed', `Unauthorized webhook attempt`);
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid API key" }, request_id: reqId });
        return;
      }

      // 1. & 2. Atomic Usage Tracking & Quotas
      const allowed = await checkAndIncrementUsage(workspaceId, 'events', limits.events);
      if (!allowed) {
        await logEvent(workspaceId, reqId, "quota_exceeded", "Daily event limit reached");
        res.status(429).json({
          success: false,
          error: {
            code: "LIMIT_EXCEEDED",
            message: "Free tier limit reached. Upgrade required.",
            upgrade_required: true,
            retry_after: 86400
          },
          request_id: reqId
        });
        return;
      }

      const workflowRef = doc(db, "workspaces", workspaceId, "workflows", workflowId);
      const workflowSnap = await getDoc(workflowRef);
      if (!workflowSnap.exists()) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Workflow not found" }, request_id: reqId });
        return;
      }

      // 15. Security Hardening - Sanitize
      const payload = sanitizePayload(rawPayload);
      const payloadString = JSON.stringify(payload);
      
      await logEvent(workspaceId, reqId, 'webhook_received', `Webhook received, queued for processing`);

      // Respond IMMEDIATELY (Load Validation)
      res.status(200).json({ success: true, data: { status: "queued" }, request_id: reqId });

      // Process asynchronously in background
      processWebhookAsync(workspaceId, workflowId, payloadString, payload, reqId).catch(err => {
        console.error("Async background error", err);
      });

    } catch (error: any) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Internal Server Error" }, request_id: req.reqId });
    }
  };

  // WEBHOOK Endpoint
  app.post("/api/webhook/:workspaceId/:workflowId", webhookLimiter, webhookHandler);
  
  // BILLING Endpoints
  app.get("/api/billing/:workspaceId", async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const limitsInfo = await evaluatePlanLimits(workspaceId);
      const usage = await calculateUsage(workspaceId);
      res.json({ success: true, data: { plan: limitsInfo.plan, limits: limitsInfo.limits, usage }, request_id: req.reqId });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message }, request_id: req.reqId });
    }
  });

  // 9. Global Deployment Readiness & 7. Production Rules Engine Hardening
  app.get("/api/cron/evaluate", async (req, res) => {
    const reqId = req.reqId;
    try {
      const workspacesSnapshot = await getDocs(collection(db, "workspaces"));
      let processedRules = 0;
      
      for (const workspaceDoc of workspacesSnapshot.docs) {
        const workspaceId = workspaceDoc.id;
        let limits;
        let status;
        try {
           const limitsResult = await evaluatePlanLimits(workspaceId);
           limits = limitsResult.limits;
           status = limitsResult.status;
        } catch(e) {
           continue; 
        }
        
        if (status !== 'active') continue;

        const workflowsSnapshot = await getDocs(collection(db, "workspaces", workspaceId, "workflows"));
        
        for (const workflowDoc of workflowsSnapshot.docs) {
          const workflowId = workflowDoc.id;
          const workflowData = workflowDoc.data();
          
          const rulesSnapshot = await getDocs(collection(db, "workspaces", workspaceId, "workflows", workflowId, "rules"));
          const eventsQ = query(collection(db, "workspaces", workspaceId, "workflows", workflowId, "events"), orderBy("receivedAt", "desc"), limit(100));
          const eventsSnap = await getDocs(eventsQ);
          const recentEvents = eventsSnap.docs.map(d => d.data());

          for (const ruleDoc of rulesSnapshot.docs) {
            processedRules++;
            const rule = ruleDoc.data();
            const threshold = rule.thresholdValue || rule.thresholdMinutes || 10;
            
            if (rule.type === "no_events") {
               const thresholdMs = threshold * 60000;
               const lastEventDt = workflowData.lastEventAt ? new Date(workflowData.lastEventAt).getTime() : 0;
               if (Date.now() - lastEventDt > thresholdMs && lastEventDt !== 0) {
                 await sendAlert(workspaceId, workflowId, `No events received for ${threshold} minutes.`, reqId);
                 await updateDoc(doc(db, "workspaces", workspaceId, "workflows", workflowId), { status: "critical" });
                 await logEvent(workspaceId, reqId, 'rule_triggered', `Silence detection rule triggered: ${threshold} mins`);
               }
            } else if (rule.type === "failure_rate") {
               if (recentEvents.length >= 10) {
                 const errors = recentEvents.filter(e => e.status === "error").length;
                 const failureRate = (errors / recentEvents.length) * 100;
                 if (failureRate >= threshold) {
                   await sendAlert(workspaceId, workflowId, `Failure rate reached ${failureRate}% (Threshold: ${threshold}%).`, reqId);
                   await updateDoc(doc(db, "workspaces", workflowId, "workflows", workflowId), { status: "critical" });
                   await logEvent(workspaceId, reqId, 'rule_triggered', `Failure rate rule triggered: ${failureRate}%`);
                 }
               }
            }
          }

          // Retention cleanup based on dynamic tier
          const retentionAgoDate = new Date(Date.now() - limits.retentionDays * 24 * 60 * 60 * 1000).toISOString();
          const oldEventsQ = query(collection(db, "workspaces", workspaceId, "workflows", workflowId, "events"), where("receivedAt", "<", retentionAgoDate), limit(100));
          const oldEventsSnap = await getDocs(oldEventsQ);
          for (const oldDoc of oldEventsSnap.docs) {
            await deleteDoc(oldDoc.ref);
          }
        }
      }
      res.json({ success: true, data: { processedRules }, request_id: reqId });
    } catch (e: any) {
      console.error("Cron Error", e);
      res.status(500).json({ success: false, error: { code: "CRON_FAILED", message: e.message }, request_id: reqId });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Self-ping to simulate serverless CRON when running locally
  setInterval(async () => {
    try {
      fetch(`http://localhost:${PORT}/api/cron/evaluate`).catch(() => {});
    } catch (e) {}
  }, 60 * 1000);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
