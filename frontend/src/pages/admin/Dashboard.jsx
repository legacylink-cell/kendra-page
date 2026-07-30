import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { apiErr } from "@/lib/api";
import { Users, FileClock, CalendarDays, DollarSign, ArrowUpRight } from "lucide-react";
import Calendar from "@/components/admin/Calendar";
import Modal, { Field, inputCls } from "@/components/admin/Modal";
import { toast } from "sonner";

const money = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [editS, setEditS] = useState(null);

  const load = () => {
    api.get("/dashboard/stats").then((r) => setStats(r.data));
    api.get("/sessions").then((r) => setSessions(r.data));
  };
  useEffect(() => { load(); }, []);

  const moveSession = async (id, date) => {
    try {
      await api.put(`/sessions/${id}`, { date });
      toast.success("Session rescheduled");
      load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
  };

  const openEdit = (s) => setEditS({ id: s.id, client_name: s.client_name, date: s.date, time: s.time || "", duration: s.duration || "60 min", note: s.note || "" });

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/sessions/${editS.id}`, { date: editS.date, time: editS.time, duration: editS.duration, note: editS.note });
      toast.success("Session updated");
      setEditS(null);
      load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Training calendar</h2>
          <span className="text-xs text-muted-foreground">Drag to reschedule · double-click to edit</span>
        </div>
        <Calendar sessions={sessions} onMove={moveSession} onEditSession={openEdit} />
      </div>

      <Modal open={!!editS} onClose={() => setEditS(null)} title={editS ? `Edit session — ${editS.client_name}` : "Edit session"} testid="cal-edit-session-modal" dismissible={false}>
        {editS && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date"><input type="date" required className={inputCls} value={editS.date} onChange={(e) => setEditS({ ...editS, date: e.target.value })} data-testid="cal-edit-date" /></Field>
              <Field label="Time"><input type="time" className={inputCls} value={editS.time} onChange={(e) => setEditS({ ...editS, time: e.target.value })} data-testid="cal-edit-time" /></Field>
            </div>
            <Field label="Duration"><select className={inputCls} value={editS.duration} onChange={(e) => setEditS({ ...editS, duration: e.target.value })}><option>30 min</option><option>45 min</option><option>60 min</option><option>90 min</option></select></Field>
            <Field label="Note"><input className={inputCls} value={editS.note} onChange={(e) => setEditS({ ...editS, note: e.target.value })} placeholder="e.g. Lower body focus" /></Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditS(null)} className="px-4 py-2.5 rounded-md text-sm border border-border">Cancel</button>
              <button type="submit" data-testid="cal-save-session-btn" className="px-4 py-2.5 rounded-md text-sm bg-primary text-primary-foreground font-medium hover:opacity-90">Save changes</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
