import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Users, BarChart3, LogOut } from "lucide-react";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/insights", label: "Insights", icon: BarChart3 },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen bg-background text-foreground font-admin flex">
      <aside className="w-64 shrink-0 bg-white border-r border-border flex flex-col fixed h-screen" data-testid="admin-sidebar">
        <div className="px-6 py-7 border-b border-border">
          <div className="font-admin font-bold text-xl tracking-tight text-foreground">Coach K Studio</div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary mt-1">Trainer Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={doLogout} data-testid="logout-btn"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary w-full transition-colors">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
