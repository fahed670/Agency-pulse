import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, ArrowRight, ServerCrash, MousePointerClick, Code } from 'lucide-react';

export default function SEOLanding() {
  const { slug } = useParams<{ slug: string }>();

  // In a real programmatic SEO app, these would come from a database or CMS.
  // We're stubbing out the main structures for demonstration.
  const seoData: Record<string, any> = {
    "monitor-zapier-workflows": {
      title: "Monitor Zapier Workflows",
      intent: "Zapier",
      problem: "When a Zap fails silently, you lose leads and revenue.",
      solution: "Attach our webhook to your Zap error paths and get alerted instantly on Slack or Email.",
    },
    "make-com-error-monitoring-tool": {
      title: "Make.com Error Monitoring Tool",
      intent: "Make.com",
      problem: "Make.com scenarios break, and you only find out when a client complains.",
      solution: "Catch failed paths automatically with an Agency Pulse HTTP module.",
    },
    "n8n-webhook-monitoring": {
      title: "n8n Webhook Monitoring",
      intent: "n8n",
      problem: "Self-hosted n8n nodes fail and your team is blind to the outage.",
      solution: "Ensure your n8n workflows are always running smoothly with dedicated webhook health checks.",
    },
    "detect-automation-failure-alerts": {
      title: "Detect Automation Failure Alerts",
      intent: "Any Platform",
      problem: "Complex operations run on fragile automations. Silent failures cost money.",
      solution: "Universal webhook monitoring. If it can send an HTTP request, we can monitor it.",
    }
  };

  const data = seoData[slug || ''] || seoData["detect-automation-failure-alerts"];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-slate-50 border-b border-slate-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Activity className="w-5 h-5" />
          </div>
          Agency Pulse
        </div>
        <Link to={`/login?ref=seo_${slug}`} className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
          Start for Free
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-sm tracking-wide mb-8">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          The standard for monitoring {data.intent}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight max-w-4xl mx-auto leading-tight">
          {data.title} Without Complex Engineering
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          <strong>The Problem:</strong> {data.problem} <br/><br/>
          <strong>The Fix:</strong> {data.solution}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
           <Link to={`/login?ref=seo_${slug}`} className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
             Create Free Monitoring Dashboard <ArrowRight className="w-5 h-5" />
           </Link>
           <Link to="/docs" className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
             <Code className="w-5 h-5" /> Read Documentation
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50">
             <div className="bg-white w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                <ServerCrash className="w-6 h-6 text-red-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-3">Stop Silent Failures</h3>
             <p className="text-slate-600 leading-relaxed">No more waiting for an angry client to tell you the leads stopped flowing. Know instantly.</p>
          </div>
          <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50">
             <div className="bg-white w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                <Zap className="w-6 h-6 text-amber-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Alerts</h3>
             <p className="text-slate-600 leading-relaxed">Route critical errors to a designated Slack channel or email address with 200ms latency.</p>
          </div>
          <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50">
             <div className="bg-white w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                <MousePointerClick className="w-6 h-6 text-indigo-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Code Required</h3>
             <p className="text-slate-600 leading-relaxed">Just copy our webhook URL and paste it into the error path of your existing workflow. Done.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
