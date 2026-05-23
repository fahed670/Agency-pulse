import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, Outlet, useOutletContext } from 'react-router-dom';
import { CreditCard, CheckCircle2, Zap, AlertTriangle } from 'lucide-react';

export default function Billing() {
  const { workspaceId } = useParams();
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    async function fetchBilling() {
      try {
        const res = await fetch(`/api/billing/${workspaceId}`);
        const data = await res.json();
        if (data.success) {
          setBillingInfo(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchBilling();
  }, [workspaceId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading billing details...</div>;
  if (!billingInfo) return <div className="p-8 text-center text-red-500">Failed to load billing details.</div>;

  const { plan, limits, usage } = billingInfo;
  
  const eventsUsed = usage?.events || 0;
  const eventsLimit = limits.events;
  const eventsPercent = Math.min((eventsUsed / eventsLimit) * 100, 100);

  const handleUpgrade = async () => {
    const newPlan = plan === 'free' ? 'pro' : 'free';
    await updateDoc(doc(db, "workspaces", workspaceId!), { plan: newPlan });
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
           <CreditCard className="w-8 h-8 text-indigo-600" /> Billing & Usage
         </h1>
         <p className="text-slate-500">Manage your subscription, track usage limits, and unlock more power.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 border rounded-xl shadow-sm md:col-span-2">
           <h2 className="text-lg font-bold text-slate-900 mb-4">Current Usage (Today)</h2>
           
           <div className="mb-6">
             <div className="flex justify-between items-end mb-2">
               <span className="text-sm font-medium text-slate-700">Events Processed</span>
               <span className="text-sm text-slate-500">{eventsUsed} / {eventsLimit === -1 ? 'Unlimited' : eventsLimit}</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2.5">
               <div className={`h-2.5 rounded-full ${eventsPercent > 90 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${eventsPercent}%` }}></div>
             </div>
             {eventsPercent > 90 && (
               <div className="flex items-center gap-1 text-xs text-red-600 mt-2 font-medium">
                 <AlertTriangle className="w-3 h-3" /> Approaching free tier daily limit.
               </div>
             )}
           </div>

           <div>
             <div className="flex justify-between items-end mb-2">
               <span className="text-sm font-medium text-slate-700">Alerts Sent</span>
               <span className="text-sm text-slate-500">{usage?.alerts || 0} / {limits.alerts === -1 ? 'Unlimited' : limits.alerts}</span>
             </div>
           </div>
        </div>

        <div className="bg-slate-900 text-white p-6 border border-slate-800 rounded-xl shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Zap className="w-24 h-24" />
           </div>
           
           <div className="relative z-10">
             <div className="text-indigo-300 font-medium text-sm mb-1 uppercase tracking-wider">Current Plan</div>
             <h2 className="text-3xl font-bold mb-4 capitalize">{plan} Plan</h2>
             
             <ul className="space-y-3 mb-8">
               <li className="flex items-start gap-2 text-sm text-slate-300">
                 <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5" />
                 {limits.events === -1 ? 'Unlimited Events' : `${limits.events.toLocaleString()} Events / Day`}
               </li>
               <li className="flex items-start gap-2 text-sm text-slate-300">
                 <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5" />
                 {limits.workflows} Workflows
               </li>
               <li className="flex items-start gap-2 text-sm text-slate-300">
                 <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5" />
                 {limits.retentionDays} Days Log Retention
               </li>
               <li className="flex items-start gap-2 text-sm text-slate-300">
                 <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5" />
                 {limits.slack ? 'Slack Integrations' : 'Email Alerts Only'}
               </li>
             </ul>

             <button 
               onClick={handleUpgrade}
               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors"
             >
               {plan === 'free' ? 'Upgrade to PRO' : 'Downgrade to Free'}
             </button>
           </div>
        </div>
      </div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="flex-1">
           <h2 className="text-xl font-bold text-indigo-900 mb-2">Invite & Earn Free Usage</h2>
           <p className="text-indigo-700 text-sm mb-4 leading-relaxed">
             Love using Agency Pulse? Invite other agencies or colleagues. They get reliable monitoring, 
             and you get extended pro limits when they sign up!
           </p>
           <div className="bg-white border border-indigo-200 p-3 rounded-lg font-mono text-sm text-slate-800 flex items-center justify-between shadow-sm">
             <span>https://agencypulse.sh/login?ref=invite_{workspaceId}</span>
             <button 
               onClick={() => {
                 navigator.clipboard.writeText(`https://agencypulse.sh/login?ref=invite_${workspaceId}`);
                 alert("Referral link copied!");
               }}
               className="text-indigo-600 font-bold px-3 py-1 hover:bg-indigo-50 rounded"
             >
               Copy
             </button>
           </div>
        </div>
        <div className="shrink-0 text-center bg-white p-6 rounded-xl shadow-sm border border-indigo-100 min-w-[200px]">
           <div className="text-4xl font-extrabold text-indigo-600 mb-1">0</div>
           <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Invites</div>
        </div>
      </div>
    </div>
  );
}
