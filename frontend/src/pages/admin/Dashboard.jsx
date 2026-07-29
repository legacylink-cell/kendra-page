import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Users, FileClock, CalendarDays, DollarSign, ArrowUpRight } from "lucide-react";
import Calendar from "@/components/admin/Calendar";

const money = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data));
    api.get("/sessions").then((r) => setSessions(r.data));
  }, []);

  const cards = stats ? [
    { label: "Active Clients", value: stats.active_clients, sub: `${stats.total_clients} total`, icon: Users },
    { label: "Revenue · This Month", value: money(stats.revenue_month), sub: `${money(stats.revenue_total)} all-time`, icon: DollarSign },
    { label: "Pending Contracts", value: stats.pending_contracts, sub: "awaiting signature", icon: FileClock },
    { label: "Upcoming Sessions", value: stats.upcoming_sessions, sub: "scheduled ahead", icon: CalendarDays },
  ] : [];

  return (
    <div data-testid="dashboard-page">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Kendra</h1>
          <p className="text-muted-foreground mt-1">Here's how Coach K Studio is moving today.</p>
        </div>
        <Link to="/admin/clients" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90" data-testid="dash-manage-clients">
          Manage clients <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} data-testid={`stat-${c.label}`} className="bg-white border border-border rounded-lg p-5 hover:shadow-sm hover:-translate-y-[1px] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold mt-3">{c.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Training calendar</h2>
          <span className="text-xs text-muted-foreground">Clients locked in by date &amp; time</span>
        </div>
        <Calendar sessions={sessions} />
      </div>
    </div>
  );
}
