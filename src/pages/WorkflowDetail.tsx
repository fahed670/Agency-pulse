import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, doc, onSnapshot, getDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronRight, Trash2, Webhook, Activity, ShieldAlert, Zap } from "lucide-react";

export default function WorkflowDetail() {
  const { workspaceId, workflowId } = useParams();
  const [workspace, setWorkspace] = useState<any>(null);
  const [workflow, setWorkflow] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!workspaceId || !workflowId) return;

    getDoc(doc(db, "workspaces", workspaceId)).then(s => {
      if (s.exists()) setWorkspace({id: s.id, ...s.data()});
    });

    const unsubWf = onSnapshot(doc(db, "workspaces", workspaceId, "workflows", workflowId), (s) => {
      if (s.exists()) setWorkflow({ id: s.id, ...s.data() });
    });

    const limitEventsQ = query(collection(db, "workspaces", workspaceId, "workflows", workflowId, "events"), orderBy("receivedAt", "desc"), limit(20));
    const unsubEvents = onSnapshot(limitEventsQ, (s) => {
      setEvents(s.docs.map(d => ({id: d.id, ...d.data()})));
    });

    const unsubRules = onSnapshot(collection(db, "workspaces", workspaceId, "workflows", workflowId, "rules"), (s) => {
      setRules(s.docs.map(d => ({id: d.id, ...d.data()})));
    });

    const unsubAlerts = onSnapshot(query(collection(db, "workspaces", workspaceId, "workflows", workflowId, "alerts"), orderBy("createdAt", "desc"), limit(10)), (s) => {
      setAlerts(s.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => { unsubWf(); unsubEvents(); unsubRules(); unsubAlerts(); }
  }, [workspaceId, workflowId]);

  if (!workspace || !workflow) return <div className="text-slate-500">Loading workflow...</div>;

  const isFreePlan = !workspace.plan || workspace.plan === "free";

  const webhookUrl = `${window.location.origin}/api/webhook/${workspaceId}/${workflow.id}?api_key=${workspace.apiKey || "YOUR_API_KEY"}`;

  const handleAddRule = async (type: string) => {
    if (isFreePlan && rules.length >= 2) {
      alert("Free tier limit reached: Maximum 2 rules per workflow. Upgrade required.");
      return;
    }

    if (isFreePlan && type !== "no_events") {
      alert(`The '${type}' rule is locked on the Free tier. Upgrade to PRO to enable advanced rules.`);
      return;
    }

    let value = "";
    if (type === "no_events") {
      value = prompt("Alert if no events received within X minutes:", "60") || "";
    } else if (type === "drop_percentage") {
      value = prompt("Alert if event volume drops by X percentage (e.g. 50):", "50") || "";
    } else if (type === "failure_rate") {
      value = prompt("Alert if error rate exceeds X percentage (e.g. 10):", "10") || "";
    }
    
    if (!value) return;

    await addDoc(collection(db, "workspaces", workspaceId!, "workflows", workflowId!, "rules"), {
      workflowId,
      type,
      thresholdValue: parseInt(value, 10),
      createdAt: new Date().toISOString()
    });
  };

  const handleTestWebhook = async (status: "success" | "error" = "success") => {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, message: "Test event from dashboard" })
      });
      if (res.ok) {
        alert("Test event sent successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to send test event: ${errorData.error}`);
      }
    } catch (e: any) {
      alert(`Error sending test event: ${e.message}`);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/workspaces" className="hover:text-slate-900 font-medium">Workspaces</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/workspaces/${workspaceId}`} className="hover:text-slate-900 font-medium">{workspace.name}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{workflow.name}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Zap className="text-amber-500 w-8 h-8" /> {workflow.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 border border-slate-200 rounded-xl">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <Webhook className="w-5 h-5 text-indigo-500" /> Webhook Integration URL
               </h2>
               <div className="flex gap-2">
                 <button onClick={() => handleTestWebhook("success")} className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded hover:bg-emerald-200 transition-colors">Test Success</button>
                 <button onClick={() => handleTestWebhook("error")} className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-200 transition-colors">Test Error</button>
               </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Add this Webhook URL to the end of your Zapier/Make automation to send an event on every successful run. 
              To record an error, send a JSON payload with <code className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded">{"{"}"status": "error"{"}"}</code>.
            </p>
            <div className="flex gap-2">
               <input 
                 readOnly 
                 value={webhookUrl} 
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-mono text-sm text-slate-700 outline-none"
               />
               <button 
                 onClick={() => { navigator.clipboard.writeText(webhookUrl); alert("Copied!"); }}
                 className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
               >
                 Copy
               </button>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-slate-500" /> Recent Events
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
               {events.length === 0 ? (
                 <div className="p-8 text-center text-slate-500 text-sm">Waiting for events... Make a POST request to test.</div>
               ) : (
                 <ul className="divide-y divide-slate-100">
                   {events.map((ev, i) => (
                     <li key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                       <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${ev.status === "error" ? "bg-red-500" : "bg-emerald-500"}`} />
                         <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                           {ev.id.slice(0, 8)}
                         </span>
                       </div>
                       <div className="text-sm text-slate-600">
                         {formatDistanceToNow(new Date(ev.receivedAt), { addSuffix: true })}
                       </div>
                     </li>
                   ))}
                 </ul>
               )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-6 border border-slate-200 rounded-xl">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-slate-700" /> Alerts History
                </h2>
             </div>
             {alerts.length === 0 ? (
               <div className="text-sm text-slate-500 text-center py-4">No alerts triggered yet.</div>
             ) : (
               <ul className="space-y-3">
                 {alerts.map(al => (
                   <li key={al.id} className="bg-red-50 text-red-900 p-3 rounded-lg text-sm border border-red-100">
                     <span className="font-semibold block mb-1">{al.message}</span>
                     <span className="text-xs text-red-700/80">{format(new Date(al.createdAt), "MMM d, h:mm a")}</span>
                   </li>
                 ))}
               </ul>
             )}
          </section>

          <section className="bg-white p-6 border border-slate-200 rounded-xl">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">Monitoring Rules</h2>
             </div>
             {rules.length === 0 ? (
               <div className="text-sm text-slate-500 text-center py-4">No rules configured.</div>
             ) : (
               <ul className="space-y-3 mb-4">
                 {rules.map(rule => (
                   <li key={rule.id} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-200 flex justify-between items-center">
                     <div>
                       <span className="font-medium text-slate-900 block">
                         {rule.type === "no_events" && "Silence Detection"}
                         {rule.type === "drop_percentage" && "Volume Drop Detection"}
                         {rule.type === "failure_rate" && "Failure Rate Detection"}
                       </span>
                       <span className="text-slate-500">
                         {rule.type === "no_events" && `Alert if no events for ${rule.thresholdValue || rule.thresholdMinutes}m`}
                         {rule.type === "drop_percentage" && `Alert if volume drops by ${rule.thresholdValue}%`}
                         {rule.type === "failure_rate" && `Alert if error rate > ${rule.thresholdValue}%`}
                       </span>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
             <div className="flex gap-2">
               <button 
                  onClick={() => handleAddRule("no_events")}
                  className="flex-1 bg-slate-100 text-slate-700 text-xs font-medium py-2 rounded-lg hover:bg-slate-200 transition-colors"
               >
                 + Silence
               </button>
               {isFreePlan ? (
                 <>
                   <button onClick={() => alert("Upgrade to PRO to unlock Volume Drop rules.")} className="flex-1 bg-amber-50 text-amber-700 text-xs font-medium py-2 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"><Zap className="w-3 h-3"/> Vol Drop</button>
                   <button onClick={() => alert("Upgrade to PRO to unlock Error Rate rules.")} className="flex-1 bg-amber-50 text-amber-700 text-xs font-medium py-2 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"><Zap className="w-3 h-3"/> Err Rate</button>
                 </>
               ) : (
                 <>
                   <button 
                      onClick={() => handleAddRule("drop_percentage")}
                      className="flex-1 bg-slate-100 text-slate-700 text-xs font-medium py-2 rounded-lg hover:bg-slate-200 transition-colors"
                   >
                     + Vol Drop
                   </button>
                   <button 
                      onClick={() => handleAddRule("failure_rate")}
                      className="flex-1 bg-slate-100 text-slate-700 text-xs font-medium py-2 rounded-lg hover:bg-slate-200 transition-colors"
                   >
                     + Err Rate
                   </button>
                 </>
               )}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
