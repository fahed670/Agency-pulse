import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Zap, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function Integration() {
  const { provider } = useParams<{ provider: string }>();
  
  const contentMap: Record<string, any> = {
    zapier: {
      name: "Zapier",
      title: "Monitor your Zapier workflows instantly.",
      description: "Detect automation failures in Zapier before you lose leads or revenue. Set up a Webhook step in your Zaps to alert you on any error.",
      color: "bg-orange-50 text-orange-600",
      linkParams: "?ref=integration_zapier"
    },
    make: {
      name: "Make.com",
      title: "Error monitoring for Make scenarios.",
      description: "Catch failed Make.com scenarios automatically. Use the HTTP module to notify Agency Pulse on error paths.",
      color: "bg-purple-50 text-purple-600",
      linkParams: "?ref=integration_make"
    },
    n8n: {
      name: "n8n",
      title: "Reliable alerting for n8n workflows.",
      description: "Ensure your n8n workflows are always running smoothly. Send a quick HTTP Request step on error triggers.",
      color: "bg-rose-50 text-rose-600",
      linkParams: "?ref=integration_n8n"
    }
  };

  const data = contentMap[provider || ''] || {
    name: "Custom Webhook",
    title: "Monitor any automation tool via webhooks.",
    description: "Detect automation failures via simple HTTP webhooks. No matter what platform you use, stay alerted when things break.",
    color: "bg-indigo-50 text-indigo-600",
    linkParams: "?ref=integration_custom"
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Activity className="w-5 h-5" />
          </div>
          Agency Pulse
        </div>
        <Link to={`/login${data.linkParams}`} className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
          Start for Free
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center text-center px-4 pt-24 pb-20">
        <div className={`px-4 py-1.5 rounded-full font-bold text-sm tracking-wide mb-6 ${data.color}`}>
          Official {data.name} Integration
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 max-w-3xl mb-6 tracking-tight">
          {data.title}
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          {data.description} Stop relying on silent failures. Get alerts to Email or Slack immediately.
        </p>
        <Link to={`/login${data.linkParams}`} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2">
          Create Free Monitoring Workspace <ArrowRight className="w-5 h-5" />
        </Link>

        <div className="mt-24 max-w-4xl w-full text-left bg-white p-8 md:p-12 border border-slate-200 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" /> How to connect {data.name}
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0">1</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Create a Workspace</h3>
                <p className="text-slate-600 text-sm">Sign in to Agency Pulse to get your unique API key and monitoring Dashboard.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0">2</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Generate a Webhook URL</h3>
                <p className="text-slate-600 text-sm">Create a new Workflow inside your workspace. We will give you a specific webhook URL to send events to.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0">3</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Add POST step to {data.name}</h3>
                <p className="text-slate-600 text-sm">In {data.name}, add a Webhook/HTTP Request step at the end of your automation or on an Error handler path. Send a JSON payload with `{"{"} "status": "success" {"}"}` or `{"{"} "status": "error" {"}"}`.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
