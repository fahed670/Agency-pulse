import { useEffect, useState, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, doc, onSnapshot, getDoc, addDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { formatDistanceToNow } from "date-fns";
import { Plus, Settings, ChevronRight, Activity, AlertCircle, CheckCircle, Key, Link as LinkIcon, MessageSquare } from "lucide-react";

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState<any>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    
    getDoc(doc(db, "workspaces", workspaceId)).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWorkspace({ id: docSnap.id, ...data });
        setSlackWebhookUrl(data.slackWebhookUrl || "");
      }
    });

    const unsub = onSnapshot(collection(db, "workspaces", workspaceId, "workflows"), (snapshot) => {
      setWorkflows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsub;
  }, [workspaceId]);

  const isFreePlan = !workspace || !workspace.plan || workspace.plan === "free";

  const handleCreateTemplate = async (templateName: string) => {
    if (isFreePlan && workflows.length >= 3) {
      alert("Free tier limit reached: Maximum 3 workflows per workspace.");
      return;
    }
    const webhookId = uuidv4();
    const wfRef = await addDoc(collection(db, "workspaces", workspaceId!, "workflows"), {
      workspaceId,
      name: templateName,
      webhookId,
      status: "healthy",
      createdAt: new Date().toISOString()
    });
    // Add default rules
    await addDoc(collection(db, "workspaces", workspaceId!, "workflows", wfRef.id, "rules"), {
      type: "no_events",
      thresholdMinutes: 60,
      description: "Alert if no events received within 60 minutes",
      createdAt: new Date().toISOString()
    });
    alert(`Template "${templateName}" created successfully! Check it in your workflows list.`);
  };

  const handleCreateWorkflow = async (e: FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim() || !workspaceId) return;

    if (isFreePlan && workflows.length >= 3) {
      alert("Free tier limit reached: Maximum 3 workflows per workspace. Upgrade required.");
      return;
    }

    const webhookId = uuidv4();
    await addDoc(collection(db, "workspaces", workspaceId, "workflows"), {
      workspaceId,
      name: newWorkflowName,
      webhookId,
      status: "healthy",
      createdAt: new Date().toISOString()
    });
    setNewWorkflowName("");
    setIsCreating(false);
  };

  const saveSettings = async () => {
    if (!workspaceId) return;
    await updateDoc(doc(db, "workspaces", workspaceId), {
      slackWebhookUrl
    });
    alert("Settings saved!");
  };

  if (!workspace) return <div className="text-slate-500">Loading workspace...</div>;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/workspaces" className="hover:text-slate-900 font-medium">Workspaces</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{workspace.name}</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{workspace.name}</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-widest">{workspace.plan || "Free"} Plan</span>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3">
               <Key className="w-4 h-4 text-indigo-500" />
               <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">API KEY</div>
                  <code className="text-sm font-mono font-medium text-slate-900 select-all">{workspace.apiKey || "No API Key"}</code>
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/workspaces/${workspaceId}/billing`)}
            className="bg-white border border-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 shadow-sm"
          >
            Billing
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Workflow
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8 max-w-xl">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-emerald-500" /> Slack Alerts Integration
        </h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="https://hooks.slack.com/services/..."
            value={slackWebhookUrl}
            onChange={e => setSlackWebhookUrl(e.target.value)}
            disabled={isFreePlan}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
          />
          <button type="button" onClick={saveSettings} disabled={isFreePlan} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50">Save</button>
        </div>
        {isFreePlan ? (
           <p className="text-xs font-medium text-amber-600 mt-2">Slack integration is locked. Upgrade to PRO to enable Slack alerts.</p>
        ) : (
           <p className="text-xs text-slate-500 mt-2">Optional. If provided, critical alerts will be sent to this Slack channel.</p>
        )}
      </div>

      <div className="mb-6 flex justify-between items-end">
         <h2 className="text-xl font-bold text-slate-900">Workflows & Templates</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {["Marketing Lead Tracking", "Ads Campaign Monitoring", "CRM Automation Monitoring", "Website Form Tracking"].map((template) => (
          <button 
             key={template}
             onClick={() => handleCreateTemplate(template)}
             className="text-left bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-indigo-300 hover:ring-1 hover:ring-indigo-500 transition-all group"
          >
             <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 mb-1">{template}</div>
             <div className="text-xs text-slate-500">+ 1 Default Rule</div>
          </button>
        ))}
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8 max-w-xl">
          <form onSubmit={handleCreateWorkflow} className="flex gap-4">
            <input 
              type="text" 
              placeholder="Workflow Name (e.g. Lead Capture Zap)"
              autoFocus
              value={newWorkflowName}
              onChange={e => setNewWorkflowName(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">Save</button>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {workflows.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No workflows monitored yet. Create one to get your webhook URL.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Workflow</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Event</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {workflows.map(wf => (
                <tr key={wf.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <Link to={`/workspaces/${workspaceId}/workflows/${wf.id}`} className="hover:text-indigo-600 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-400" /> {wf.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                     <StatusBadge status={wf.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {wf.lastEventAt ? formatDistanceToNow(new Date(wf.lastEventAt), { addSuffix: true }) : "Never"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/workspaces/${workspaceId}/workflows/${wf.id}`} className="text-slate-400 hover:text-indigo-600 font-medium">
                       Manage <ChevronRight className="w-4 h-4 inline" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "healthy") return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle className="w-3.5 h-3.5"/> Healthy</span>;
  if (status === "warning") return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><AlertCircle className="w-3.5 h-3.5"/> Warning</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertCircle className="w-3.5 h-3.5"/> Critical</span>;
}
