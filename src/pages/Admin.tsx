import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Shield, Activity, Users, Zap } from 'lucide-react';

export default function Admin() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [totalAlerts, setTotalAlerts] = useState<number>(0);

  useEffect(() => {
    // This is a naive admin view. In real production, this needs server-side auth checking.
    const unsub = onSnapshot(collection(db, "workspaces"), async (snap) => {
      const wsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWorkspaces(wsData);

      // Aggregations
      let events = 0;
      let alerts = 0;
      const today = new Date().toISOString().split('T')[0];

      for (const w of wsData) {
        const usageSnap = await getDocs(collection(db, "workspaces", w.id, "usage"));
        usageSnap.forEach(u => {
           if (u.id === today) {
              events += (u.data().events || 0);
              alerts += (u.data().alerts || 0);
           }
        });
      }
      setTotalEvents(events);
      setTotalAlerts(alerts);
    });

    return unsub;
  }, []);

  const handleUpgrade = async (id: string, currentPlan: string) => {
    const newPlan = currentPlan === "pro" ? "free" : "pro";
    await updateDoc(doc(db, "workspaces", id), { plan: newPlan });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-8 border-b pb-6">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Control Plane</h1>
          <p className="text-slate-500">System overview and tenant management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 border rounded-xl shadow-sm">
          <div className="text-slate-500 mb-2 flex items-center gap-2">
             <Users className="w-4 h-4" /> Workspaces
          </div>
          <div className="text-3xl font-bold">{workspaces.length}</div>
        </div>
        <div className="bg-white p-6 border rounded-xl shadow-sm">
          <div className="text-slate-500 mb-2 flex items-center gap-2">
             <Activity className="w-4 h-4" /> Events Today
          </div>
          <div className="text-3xl font-bold">{totalEvents}</div>
        </div>
        <div className="bg-white p-6 border rounded-xl shadow-sm">
          <div className="text-slate-500 mb-2 flex items-center gap-2">
             <Zap className="w-4 h-4" /> Alerts Sent Today
          </div>
          <div className="text-3xl font-bold">{totalAlerts}</div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-sm font-medium border-b border-slate-200">
            <tr>
              <th className="py-4 px-6">Workspace</th>
              <th className="py-4 px-6">API Key</th>
              <th className="py-4 px-6">Plan</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workspaces.map(ws => (
              <tr key={ws.id} className="hover:bg-slate-50">
                <td className="py-4 px-6 font-medium text-slate-900">{ws.name}</td>
                <td className="py-4 px-6 text-slate-500 font-mono text-sm">{ws.apiKey}</td>
                <td className="py-4 px-6">
                   <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md ${ws.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                     {ws.plan || 'free'}
                   </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                     onClick={() => handleUpgrade(ws.id, ws.plan || "free")}
                     className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Toggle PRO
                  </button>
                </td>
              </tr>
            ))}
            {workspaces.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">No workspaces exist.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
