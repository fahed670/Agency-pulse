import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { Activity, AlertCircle, CheckCircle, Zap, ShieldAlert, ActivitySquare } from "lucide-react";
import { formatDistanceToNow, subHours } from "date-fns";

export default function Dashboard() {
  const { user } = useOutletContext<any>();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [usageMap, setUsageMap] = useState<Record<string, number>>({});
  
  // Compute total events24h derived from usageMap
  const events24h = Object.values(usageMap).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!user) return;
    
    const unsubWs = onSnapshot(query(collection(db, "workspaces"), where("ownerId", "==", user.uid)), async (wsSnap) => {
       const allWfs: any[] = [];
       const allAlerts: any[] = [];
       let currentEventsCount = 0;

       for (const wsDoc of wsSnap.docs) {
         // Get atomic events usage today
         const today = new Date().toISOString().split('T')[0];
         onSnapshot(doc(db, "workspaces", wsDoc.id, "usage", today), (usageSnap) => {
           if (usageSnap.exists()) {
              const usageEvents = usageSnap.data().events || 0;
              setUsageMap(prev => ({ ...prev, [wsDoc.id]: usageEvents }));
           }
         });

         onSnapshot(collection(db, "workspaces", wsDoc.id, "workflows"), (wfSnap) => {
           const workspaceWfs = wfSnap.docs.map(d => ({id: d.id, workspaceId: wsDoc.id, ...d.data()}));
           setWorkflows(prev => {
             const withoutCurrentWs = prev.filter(p => p.workspaceId !== wsDoc.id);
             return [...withoutCurrentWs, ...workspaceWfs];
           });

           workspaceWfs.forEach((wf: any) => {
             onSnapshot(collection(db, "workspaces", wsDoc.id, "workflows", wf.id, "alerts"), (alSnap) => {
               const wfAlerts = alSnap.docs.map(d => ({id: d.id, workflowName: wf.name, workspaceId: wsDoc.id, workflowId: wf.id, ...d.data()}));
               setAlerts(prev => {
                 const withoutCurrentWf = prev.filter(al => al.workflowId !== wf.id);
                 return [...withoutCurrentWf, ...wfAlerts].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
               });
             });
             
             // No longer fetching all 50k+ events locally to compute total events!
             // Instead, we will fetch the atomic counter.
           });
         });
       }
    });

    return unsubWs;
  }, [user]);

  const stats = {
    total: workflows.length,
    healthy: workflows.filter(w => w.status === "healthy").length,
    warning: workflows.filter(w => w.status === "warning").length,
    critical: workflows.filter(w => w.status === "critical").length,
    alerts24h: alerts.filter(a => new Date(a.createdAt) >= subHours(new Date(), 24)).length,
  };

  const PRODUCT_VALUE_STATEMENT = "We monitor your automations and alert you when they fail before you lose leads or revenue.";

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {workflows.length === 0 && (
         <div className="bg-indigo-600 rounded-xl overflow-hidden shadow-sm relative">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <Zap className="w-48 h-48" />
           </div>
           <div className="p-8 md:p-12 relative z-10 text-white">
             <span className="px-3 py-1 bg-indigo-500/50 text-indigo-100 text-xs font-bold rounded-full uppercase tracking-widest mb-6 inline-block">Welcome to Agency Pulse</span>
             <h1 className="text-3xl md:text-5xl font-bold mb-4">Never lose a lead silently again.</h1>
             <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
               {PRODUCT_VALUE_STATEMENT} Attach our webhook to your Zapier, Make, n8n, or custom pipeline in seconds.
             </p>
             <Link 
               to="/workspaces" 
               className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm"
             >
               Go to your Workspace to start
             </Link>
           </div>
         </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Workflows</p>
             <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <ActivitySquare className="w-10 h-10 text-indigo-100" />
        </div>
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Events (24h)</p>
             <p className="text-3xl font-bold text-slate-900">{events24h}</p>
          </div>
          <Zap className="w-10 h-10 text-amber-100" />
        </div>
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Alerts Triggered (24h)</p>
             <p className="text-3xl font-bold text-slate-900">{stats.alerts24h}</p>
          </div>
          <ShieldAlert className="w-10 h-10 text-red-100" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        {/* Left Column: Workflows */}
        <div className="flex-[2] flex flex-col gap-6">
          <header className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Live Automation Streams</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{stats.healthy} Healthy</span>
              {stats.warning > 0 && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{stats.warning} Warning</span>}
              {stats.critical > 0 && <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">{stats.critical} Critical</span>}
            </div>
          </header>

          <div className="grid gap-3">
            {workflows.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm border border-slate-200 rounded-xl bg-white shadow-sm">
                No workflows found. Go to Workspaces to create one.
              </div>
            ) : (
              workflows.map(wf => (
                <Link 
                  key={wf.id}
                  to={`/workspaces/${wf.workspaceId}/workflows/${wf.id}`} 
                  className={`group bg-white border ${wf.status === 'warning' ? 'border-l-4 border-l-amber-500' : wf.status === 'critical' ? 'border-l-4 border-l-red-500' : ''} border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                      <span className="text-slate-500 font-mono text-xs">{wf.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{wf.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">ID: {wf.id.substring(0,8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12 text-right">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Last Event</p>
                      <p className={`text-sm font-medium ${!wf.lastEventAt ? 'text-slate-400' : wf.status === 'critical' ? 'text-red-600' : wf.status === 'warning' ? 'text-amber-600' : ''}`}>
                        {wf.lastEventAt ? formatDistanceToNow(new Date(wf.lastEventAt), { addSuffix: true }) : "Never"}
                      </p>
                    </div>
                    <div className="w-24">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Status</p>
                      {wf.status === "healthy" ? (
                        <span className="flex items-center gap-1.5 justify-end text-green-600 text-sm font-bold">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div> Healthy
                        </span>
                      ) : wf.status === "warning" ? (
                        <span className="flex items-center gap-1.5 justify-end text-amber-600 text-sm font-bold">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div> Warning
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 justify-end text-red-600 text-sm font-bold">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div> Failing
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Alerts Feed */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm min-h-[400px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-tight">Alerts Feed (24h)</h2>
              <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-600">REAL-TIME</span>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-8">All systems normal.</div>
              ) : (
                alerts.slice(0, 10).map(al => (
                  <div key={al.id} className="flex gap-3 items-start group">
                    <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                    <div>
                      <p className="text-xs font-bold leading-tight group-hover:text-indigo-600 transition-colors">
                        <Link to={`/workspaces/${al.workspaceId}/workflows/${al.workflowId}`}>{al.message}</Link>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(al.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Workflow {al.workflowName}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
