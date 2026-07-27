import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Users, FileClock, Inbox, DollarSign, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const money = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get("/dashboard/stats").then((r) => setStats(r.data)); }, []);

  const cards = stats ? [
    { label: "Active Clients", value: stats.active_clients, sub: `${stats.total_clients} total`, icon: Users },
    { label: "Revenue · This Month", value: money(stats.revenue_month), sub: `${money(stats.revenue_total)} all-time`, icon: DollarSign },
    { label: "Pending Contracts", value: stats.pending_contracts, sub: "awaiting signature", icon: FileClock },
    { label: "New Leads", value: stats.new_leads, sub: "from website", icon: Inbox },
  ] : [];

  return (
    <div data-testid="dashboard-page">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Kendra</h1>
          <p className="text-muted-foreground mt-1">Here's how KP Studio is moving today.</p>
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
        <h2 className="font-semibold mb-6">Revenue trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE4" vertical={false} />
              <XAxis dataKey="month" stroke="#9c968f" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9c968f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={money} />
              <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 8, border: "1px solid #E5E0DA" }} />
              <Line type="monotone" dataKey="revenue" stroke="#C17D59" strokeWidth={2.5} dot={{ r: 4, fill: "#C17D59" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {(!stats?.trend || stats.trend.length === 0) && (
          <p className="text-center text-sm text-muted-foreground -mt-40 pb-40">Log payments to see revenue trends here.</p>
        )}
      </div>
    </div>
  );
}
