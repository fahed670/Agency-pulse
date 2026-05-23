import { useEffect, useState, FormEvent } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { useOutletContext, Link } from "react-router-dom";
import { format } from "date-fns";
import { Briefcase, ChevronRight, Plus } from "lucide-react";

export default function Workspaces() {
  const { user } = useOutletContext<any>();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "workspaces"), where("ownerId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setWorkspaces(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    // Enforce free tier 1 workspace limit
    const hasFree = workspaces.some(w => (!w.plan || w.plan === "free"));
    if (workspaces.length >= 1 && hasFree) {
      alert("Free tier limit reached: Maximum 1 workspace per user. Upgrade required.");
      return;
    }

    const apiKey = "ap_" + crypto.randomUUID().replace(/-/g, "");
    const source = localStorage.getItem("acquisition_source") || "direct";
    
    await addDoc(collection(db, "workspaces"), {
      name: newWorkspaceName,
      ownerId: user.uid,
      apiKey,
      plan: "free",
      metadata: { source },
      createdAt: new Date().toISOString()
    });
    setNewWorkspaceName("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Workspaces</h1>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8 max-w-xl">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Create New Workspace</h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. Acme Agency" 
            value={newWorkspaceName}
            onChange={e => setNewWorkspaceName(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map(ws => (
          <Link key={ws.id} to={`/workspaces/${ws.id}`} className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-100 p-2 rounded-md">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-900 truncate">{ws.name}</h3>
              </div>
              <div className="text-xs text-slate-500 mt-4 flex items-center justify-between">
                <span>Created {format(new Date(ws.createdAt), "MMM d, yyyy")}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
        {workspaces.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
            You don't have any workspaces yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
