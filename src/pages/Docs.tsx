import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Book, Code, Terminal } from 'lucide-react';

export default function Docs() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Activity className="w-5 h-5" />
          </div>
          Agency Pulse Docs
        </div>
        <Link to="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Go to App
        </Link>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Developer Documentation</h1>
        <p className="text-lg text-slate-600 mb-12">Learn how to configure webhooks, trigger alerts, and integrate completely with any platform.</p>

        <section className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-500" /> Webhook API Reference
          </h2>
          <p className="text-slate-600 mb-6">
            Send HTTP POST requests to your workflow's webhook URL to log events and trigger rules.
          </p>
          
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm mb-6 overflow-x-auto">
            <div className="text-emerald-400 mb-1">POST</div>
            <div>https://your-domain.com/api/webhook/[workspace_id]/[workflow_id]?api_key=[your_api_key]</div>
          </div>

          <h3 className="font-bold text-lg mb-2">Request Body (JSON)</h3>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono text-sm mb-6">
            <pre>
{`{
  "status": "success" | "error",
  "metadata": {
    "leadId": "123",
    "source": "facebook_ads"
  }
}`}
            </pre>
          </div>
          <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm">
            <li><strong className="text-slate-900">status</strong> (required): Use "success" for routine pings, or "error" if your workflow caught an exception.</li>
            <li><strong className="text-slate-900">metadata</strong> (optional): Any extra JSON data you wish to log with the event.</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-500" /> HTTP Status Codes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm border-b">
                <tr>
                  <th className="py-3 px-4 font-medium">Code</th>
                  <th className="py-3 px-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                <tr><td className="py-3 px-4 font-mono font-medium text-emerald-600">200 OK</td><td className="py-3 px-4">Event ingested or deduplicated successfully.</td></tr>
                <tr><td className="py-3 px-4 font-mono font-medium text-red-600">401 Unauthorized</td><td className="py-3 px-4">Missing or invalid API key.</td></tr>
                <tr><td className="py-3 px-4 font-mono font-medium text-red-600">402 Payment Required</td><td className="py-3 px-4">Workspace subscription is inactive.</td></tr>
                <tr><td className="py-3 px-4 font-mono font-medium text-red-600">404 Not Found</td><td className="py-3 px-4">Workflow ID does not exist in this workspace.</td></tr>
                <tr><td className="py-3 px-4 font-mono font-medium text-amber-600">429 Too Many Requests</td><td className="py-3 px-4">Rate limited or daily plan limit exceeded.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
