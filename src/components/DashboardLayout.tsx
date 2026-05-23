import { Mail, Bell, Settings, Briefcase, Activity, AlertCircle, CheckCircle, ShieldAlert, ChevronDown, Plus } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function DashboardLayout() {
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        navigate("/login");
      }
    });
    return unsub;
  }, [navigate]);

  if (!user) return <div className="h-screen w-full flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden w-full">
      <nav className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <div className="w-4 h-1 bg-white rounded-full"></div>
            </div>
            <span className="font-bold text-lg tracking-tight">AgencyPulse</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <nav className="flex items-center gap-1 text-sm font-medium text-slate-500">
            <NavItem to="/" label="Dashboard" active={location.pathname === "/"} />
            <NavItem to="/workspaces" label="Workspaces" active={location.pathname === "/workspaces" || location.pathname.startsWith("/workspaces/")} />
            <NavItem to="/docs" label="Docs" active={location.pathname === "/docs"} />
            <NavItem to="/admin" label="Admin" active={location.pathname === "/admin"} />
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/workspaces" className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-sm">
            + New Workspace
          </Link>
          <div className="group relative">
            <div className="w-8 h-8 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-3 border-b border-slate-100 truncate text-xs text-slate-500">{user.email}</div>
              <button onClick={() => signOut(auth)} className="w-full text-left p-3 text-sm text-red-600 hover:bg-slate-50 transition-colors rounded-b-lg">Log out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-auto">
        <div className="w-full max-w-[1280px] mx-auto p-8">
          <Outlet context={{ user }} />
        </div>
      </main>

      <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
        <div className="flex gap-6">
          <span>Systems Operational</span>
          <Link to="/integrations/zapier" className="hover:text-slate-600">Zapier App</Link>
          <Link to="/integrations/make" className="hover:text-slate-600">Make.com Plugin</Link>
        </div>
        <div>
          Agency Pulse SaaS Foundation
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, label, active }: any) {
  return (
    <Link 
       to={to} 
       className={`px-3 py-1.5 rounded-md transition-colors ${active ? "bg-slate-100 text-slate-900 font-bold" : "hover:text-slate-900 hover:bg-slate-50"}`}
    >
      {label}
    </Link>
  );
}
