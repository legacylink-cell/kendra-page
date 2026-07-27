import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErr } from "@/lib/api";
import Modal, { Field, inputCls } from "@/components/admin/Modal";
import { toast } from "sonner";
import { Plus, Search, ChevronRight } from "lucide-react";

const empty = { name: "", email: "", phone: "", goals: "", package: "", rate: 0, status: "active" };

const statusColor = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  lead: "bg-amber-100 text-amber-800",
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = () => api.get("/clients").then((r) => setClients(r.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/clients", { ...form, rate: Number(form.rate) || 0 });
      toast.success("Client added");
      setOpen(false); setForm(empty); load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || (c.email || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div data-testid="clients-page">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">{clients.length} total</p>
        </div>
        <button onClick={() => setOpen(true)} data-testid="add-client-btn"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Add client
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" data-testid="client-search"
          className={inputCls + " pl-9"} />
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">Contact</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Program</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} data-testid={`client-row-${c.id}`} onClick={() => navigate(`/admin/clients/${c.id}`)}
                className="border-t border-border hover:bg-secondary/40 cursor-pointer">
                <td className="px-5 py-4 font-medium">{c.name}</td>
                <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">{c.email || c.phone || "—"}</td>
                <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{c.package || "—"}</td>
                <td className="px-5 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[c.status] || statusColor.inactive}`}>{c.status}</span></td>
                <td className="px-5 py-4 text-right"><ChevronRight className="h-4 w-4 text-muted-foreground inline" /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No clients yet. Add your first client to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add new client" testid="add-client-modal">
        <form onSubmit={create} className="space-y-4">
          <Field label="Full name"><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="client-name-input" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="client-email-input" /></Field>
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="client-phone-input" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Program"><input className={inputCls} value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} placeholder="1:1 Training" /></Field>
            <Field label="Rate ($)"><input type="number" className={inputCls} value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} /></Field>
          </div>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} data-testid="client-status-input">
              <option value="active">Active</option><option value="lead">Lead</option><option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Goals"><textarea rows={3} className={inputCls} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} /></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-md text-sm border border-border">Cancel</button>
            <button type="submit" disabled={saving} data-testid="save-client-btn" className="px-4 py-2.5 rounded-md text-sm bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-60">{saving ? "Saving…" : "Add client"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
