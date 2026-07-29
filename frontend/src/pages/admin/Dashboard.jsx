import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { apiErr } from "@/lib/api";
import { Users, FileClock, CalendarDays, DollarSign, ArrowUpRight, AlertTriangle } from "lucide-react";
import Calendar from "@/components/admin/Calendar";
import Modal from "@/components/admin/Modal";
import { toast } from "sonner";

const money = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showReset, setShowReset] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [resetting, setResetting] = useState(false);

  const load = () => {
    api.get("/dashboard/stats").then((r) => setStats(r.data));
    api.get("/sessions").then((r) => setSessions(r.data));
  };
  useEffect(() => { load(); }, []);

  const doReset = async () => {
    setResetting(true);
    try {
      await api.post("/admin/reset-data", { confirm });
      toast.success("Portal reset — you now have a clean slate.");
      setShowReset(false); setConfirm(""); load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
    finally { setResetting(false); }
  };

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
          <p className="text-muted-foreground mt-1">Here's how CK Studio is moving today.</p>
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

      {/* Danger zone */}
      <div className="border border-red-200 bg-red-50/40 rounded-lg p-5 mt-8" data-testid="danger-zone">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Reset portal data</p>
              <p className="text-xs text-muted-foreground max-w-md mt-0.5">Permanently clears all clients, contracts, payments, sessions, leads and analytics — giving you a clean slate. Your login stays.</p>
            </div>
          </div>
          <button onClick={() => setShowReset(true)} data-testid="open-reset-btn"
            className="text-sm border border-destructive text-destructive px-4 py-2 rounded-md hover:bg-destructive hover:text-white transition-colors">Reset all data</button>
        </div>
      </div>

      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset all portal data?" testid="reset-modal">
        <p className="text-sm text-muted-foreground">
          This permanently deletes <span className="font-semibold text-foreground">every client, contract, payment, session, lead and analytics record</span>. Your admin login is kept. This cannot be undone.
        </p>
        <p className="text-sm mt-4 mb-1.5">Type <span className="font-mono font-semibold">RESET</span> to confirm:</p>
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} data-testid="reset-confirm-input"
          className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="RESET" />
        <div className="flex justify-end gap-3 pt-5">
          <button type="button" onClick={() => setShowReset(false)} className="px-4 py-2.5 rounded-md text-sm border border-border">Cancel</button>
          <button onClick={doReset} disabled={confirm !== "RESET" || resetting} data-testid="confirm-reset-btn"
            className="px-4 py-2.5 rounded-md text-sm bg-destructive text-destructive-foreground font-medium hover:opacity-90 disabled:opacity-50">{resetting ? "Resetting…" : "Reset everything"}</button>
        </div>
      </Modal>
    </div>
  );
}
