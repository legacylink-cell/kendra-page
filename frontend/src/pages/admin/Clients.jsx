import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErr } from "@/lib/api";
import Modal, { Field, inputCls } from "@/components/admin/Modal";
import { toast } from "sonner";
import { Plus, Search, MoreVertical, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";

const empty = { name: "", email: "", phone: "", goals: "", package: "", rate: 0, status: "active" };

const statusColor = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  lead: "bg-amber-100 text-amber-800",
  archived: "bg-stone-200 text-stone-600",
};

const FILTERS = ["Active", "Lead", "Archived", "All"];

function RowMenu({ client, onEdit, onArchive, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const archived = client.status === "archived";
  return (
    <div className="relative inline-block text-left" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button data-testid={`client-menu-${client.id}`} onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-border rounded-md shadow-lg z-20 py-1 text-sm" data-testid={`client-menu-panel-${client.id}`}>
          <button onClick={() => { setOpen(false); onEdit(client); }} data-testid={`client-edit-${client.id}`}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left"><Pencil className="h-3.5 w-3.5" /> Edit</button>
          <button onClick={() => { setOpen(false); onArchive(client); }} data-testid={`client-archive-${client.id}`}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left">
            {archived ? <><ArchiveRestore className="h-3.5 w-3.5" /> Restore</> : <><Archive className="h-3.5 w-3.5" /> Archive</>}
          </button>
          <button onClick={() => { setOpen(false); onDelete(client); }} data-testid={`client-delete-${client.id}`}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-destructive text-left"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
        </div>
      )}
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("Active");
  const [editing, setEditing] = useState(null);
  const [eForm, setEForm] = useState(empty);
  const [toDelete, setToDelete] = useState(null);
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

  const openEdit = (c) => { setEditing(c); setEForm({ ...c }); };
  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/clients/${editing.id}`, { ...eForm, rate: Number(eForm.rate) || 0 });
      toast.success("Client updated");
      setEditing(null); load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  const toggleArchive = async (c) => {
    const next = c.status === "archived" ? "active" : "archived";
    try {
      await api.put(`/clients/${c.id}`, { ...c, status: next });
      toast.success(next === "archived" ? "Client archived" : "Client restored");
      load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/clients/${toDelete.id}`);
      toast.success("Client deleted");
      setToDelete(null); load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
  };

  const byFilter = clients.filter((c) => {
    if (filter === "All") return true;
    if (filter === "Archived") return c.status === "archived";
    return (c.status || "active") === filter.toLowerCase();
  });
  const filtered = byFilter.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || (c.email || "").toLowerCase().includes(q.toLowerCase()));

  const editForm = (state, setState) => (
    <div className="space-y-4">
      <Field label="Full name"><input required className={inputCls} value={state.name || ""} onChange={(e) => setState({ ...state, name: e.target.value })} data-testid="client-name-input" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email"><input type="email" className={inputCls} value={state.email || ""} onChange={(e) => setState({ ...state, email: e.target.value })} data-testid="client-email-input" /></Field>
        <Field label="Phone"><input className={inputCls} value={state.phone || ""} onChange={(e) => setState({ ...state, phone: e.target.value })} data-testid="client-phone-input" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Program"><input className={inputCls} value={state.package || ""} onChange={(e) => setState({ ...state, package: e.target.value })} placeholder="1:1 Training" /></Field>
        <Field label="Rate ($)"><input type="number" className={inputCls} value={state.rate || 0} onChange={(e) => setState({ ...state, rate: e.target.value })} /></Field>
      </div>
      <Field label="Status">
        <select className={inputCls} value={state.status || "active"} onChange={(e) => setState({ ...state, status: e.target.value })} data-testid="client-status-input">
          <option value="active">Active</option><option value="lead">Lead</option><option value="inactive">Inactive</option><option value="archived">Archived</option>
        </select>
      </Field>
      <Field label="Goals"><textarea rows={3} className={inputCls} value={state.goals || ""} onChange={(e) => setState({ ...state, goals: e.target.value })} /></Field>
    </div>
  );

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

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} data-testid={`client-filter-${f.toLowerCase()}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>{f}</button>
          ))}
        </div>
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" data-testid="client-search"
            className={inputCls + " pl-9"} />
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">Contact</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Program</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 w-10"></th>
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
                <td className="px-5 py-4 text-right">
                  <RowMenu client={c} onEdit={openEdit} onArchive={toggleArchive} onDelete={setToDelete} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No clients here yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add client */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add new client" testid="add-client-modal" dismissible={false}>
        <form onSubmit={create}>
          {editForm(form, setForm)}
          <div className="flex justify-end gap-3 pt-5">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-md text-sm border border-border">Cancel</button>
            <button type="submit" disabled={saving} data-testid="save-client-btn" className="px-4 py-2.5 rounded-md text-sm bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-60">{saving ? "Saving…" : "Add client"}</button>
          </div>
        </form>
      </Modal>

      {/* Edit client */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit client" testid="edit-client-modal" dismissible={false}>
        <form onSubmit={saveEdit}>
          {editForm(eForm, setEForm)}
          <div className="flex justify-end gap-3 pt-5">
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-md text-sm border border-border">Cancel</button>
            <button type="submit" disabled={saving} data-testid="save-edit-client-btn" className="px-4 py-2.5 rounded-md text-sm bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete client?" testid="delete-client-modal">
        <p className="text-sm text-muted-foreground">
          This permanently deletes <span className="font-semibold text-foreground">{toDelete?.name}</span> along with their contracts and payments. This can't be undone.
        </p>
        <div className="flex justify-end gap-3 pt-5">
          <button type="button" onClick={() => setToDelete(null)} className="px-4 py-2.5 rounded-md text-sm border border-border">Cancel</button>
          <button onClick={confirmDelete} data-testid="confirm-delete-client-btn" className="px-4 py-2.5 rounded-md text-sm bg-destructive text-destructive-foreground font-medium hover:opacity-90">Delete client</button>
        </div>
      </Modal>
    </div>
  );
}
