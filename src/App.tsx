import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Workspaces from "./pages/Workspaces";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import WorkflowDetail from "./pages/WorkflowDetail";
import Billing from "./pages/Billing";
import Integration from "./pages/Integration";
import Docs from "./pages/Docs";
import SEOLanding from "./pages/SEOLanding";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/integrations/:provider" element={<Integration />} />
        <Route path="/seo/:slug" element={<SEOLanding />} />
        <Route path="/docs" element={<Docs />} />
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/workspaces/:workspaceId" element={<WorkspaceDetail />} />
          <Route path="/workspaces/:workspaceId/billing" element={<Billing />} />
          <Route path="/workspaces/:workspaceId/workflows/:workflowId" element={<WorkflowDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
