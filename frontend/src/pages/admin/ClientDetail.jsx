import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api, { API, apiErr } from "@/lib/api";
import Modal, { Field, inputCls } from "@/components/admin/Modal";
import { toast } from "sonner";
import { ArrowLeft, FileText, Download, Upload, Plus, Trash2, Eye, Mail, Phone, Target, ShieldCheck } from "lucide-react";

const tabs = ["Overview", "Contracts & Waivers", "Payments"];

const contractStatus = { generated: "bg-amber-100 text-amber-800", signed: "bg-green-100 text-green-800" };

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState("Overview");
  const [showContract, setShowContract] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [cForm, setCForm] = useState({ package: "1:1 Personal Training", sessions: 12, rate: 0, session_length: "60 minutes", start_date: "", end_date: "", cancellation_hours: 24, include_media_release: true });
  const [pForm, setPForm] = useState({ amount: "", method: "Card", date: new Date().toISOString().slice(0, 10), note: "", status: "paid" });
  const [eForm, setEForm] = useState({});

  const load = useCallback(() => {
    api.get(`/clients/${id}`).then((r) => { setClient(r.data); setEForm(r.data); });
    api.get(`/clients/${id}/contracts`).then((r) => setContracts(r.data));
    api.get(`/clients/${id}/payments`).then((r) => setPayments(r.data));
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const genContract = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/clients/${id}/contracts`, { ...cForm, sessions: Number(cForm.sessions), rate: Number(cForm.rate), cancellation_hours: Number(cForm.cancellation_hours) });
      toast.success("Contract & waiver generated");
      setShowContract(false); load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
  };

  const blobDownload = async (url, filename, openTab = false) => {
    try {
      const res = await api.get(url, { responseType: "blob" });
      const blobUrl = URL.createObjectURL(res.data);
      if (openTab) { window.open(blobUrl, "_blank"); }
      else { const a = document.createElement("a"); a.href = blobUrl; a.download = filename; a.click(); }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
    } catch (err) { toast.error("Could not load document"); }
  };

  const uploadSigned = async (contractId, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/contracts/${contractId}/upload-signed`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Signed document uploaded");
      load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
  };

  const delContract = async (cid) => { await api.delete(`/contracts/${cid}`); load(); };

  const addPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/clients/${id}/payments`, { ...pForm, amount: Number(pForm.amount) });
      toast.success("Payment logged");
      setShowPayment(false); setPForm({ ...pForm, amount: "", note: "" }); load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
  };
  const delPayment = async (pid) => { await api.delete(`/payments/${pid}`); load(); };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clients/${id}`, { ...eForm, rate: Number(eForm.rate) || 0 });
      toast.success("Client updated");
      setShowEdit(false); load();
    } catch (err) { toast.error(apiErr(err.response?.data?.detail)); }
  };

  if (!client) return <div className="text-muted-foreground">Loading…</div>;
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <div data-testid="client-detail-page">
      <Link to="/admin/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5"><ArrowLeft className="h-4 w-4" /> All clients</Link>

      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold">{client.name.charAt(0)}</div>
            <div>
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                {client.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{client.email}</span>}
                {client.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{client.phone}</span>}
              </div>
            </div>
          </div>
          <button onClick={() => setShowEdit(true)} data-testid="edit-client-btn" className="text-sm border border-border px-4 py-2 rounded-md hover:bg-secondary">Edit</button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border mb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} data-testid={`tab-${t}`}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-border rounded-lg p-5"><p className="text-xs uppercase text-muted-foreground tracking-wide mb-2 flex items-center gap-2"><Target className="h-3.5 w-3.5" /> Goals</p><p className="text-sm">{client.goals || "—"}</p></div>
          <div className="bg-white border border-border rounded-lg p-5"><p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Program & Rate</p><p className="text-sm">{client.package || "—"}</p><p className="text-sm text-muted-foreground">${(client.rate || 0).toLocaleString()}</p></div>
          <div className="bg-white border border-border rounded-lg p-5"><p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Total paid</p><p className="text-2xl font-bold">${totalPaid.toLocaleString()}</p></div>
          <div className="bg-white border border-border rounded-lg p-5 md:col-span-3"><p className="text-xs uppercase text-muted-foreground tracking-wide mb-2 flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Medical notes</p><p className="text-sm">{client.medical_notes || "None recorded"}</p></div>
        </div>
      )}

      {tab === "Contracts & Waivers" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">Training agreement includes liability waiver, assumption of risk, PAR-Q & policies.</p>
            <button onClick={() => setShowContract(true)} data-testid="generate-contract-btn" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90"><Plus className="h-4 w-4" /> Generate contract</button>
          </div>
          <div className="space-y-3">
            {contracts.map((c) => (
              <div key={c.id} data-testid={`contract-${c.id}`} className="bg-white border border-border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{c.package} · {c.sessions} sessions</p>
                    <p className="text-xs text-muted-foreground">Created {c.created_at?.slice(0, 10)} · <span className={`px-2 py-0.5 rounded-full ${contractStatus[c.status]}`}>{c.status === "signed" ? "Signed & uploaded" : "Awaiting signature"}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => blobDownload(`/contracts/${c.id}/pdf`, `KPStudio_Agreement.pdf`)} data-testid={`download-contract-${c.id}`} className="inline-flex items-center gap-1.5 text-sm border border-border px-3 py-2 rounded-md hover:bg-secondary"><Download className="h-4 w-4" /> PDF</button>
                  <label className="inline-flex items-center gap-1.5 text-sm border border-border px-3 py-2 rounded-md hover:bg-secondary cursor-pointer" data-testid={`upload-contract-${c.id}`}>
                    <Upload className="h-4 w-4" /> Upload signed
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => uploadSigned(c.id, e.target.files[0])} />
                  </label>
                  {c.status === "signed" && <button onClick={() => blobDownload(`/contracts/${c.id}/signed`, "signed", true)} data-testid={`view-signed-${c.id}`} className="inline-flex items-center gap-1.5 text-sm border border-border px-3 py-2 rounded-md hover:bg-secondary"><Eye className="h-4 w-4" /> Signed</button>}
                  <button onClick={() => delContract(c.id)} className="text-muted-foreground hover:text-destructive p-2"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {contracts.length === 0 && <div className="bg-white border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">No contracts yet. Generate a training agreement with the built-in liability waiver.</div>}
          </div>
        </div>
      )}

      {tab === "Payments" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">Total logged: <span className="font-semibold text-foreground">${totalPaid.toLocaleString()}</span></p>
            <button onClick={() => setShowPayment(true)} data-testid="log-payment-btn" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90"><Plus className="h-4 w-4" /> Log payment</button>
          </div>
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Amount</th><th className="px-5 py-3 font-medium">Method</th><th className="px-5 py-3 font-medium">Note</th><th></th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} data-testid={`payment-${p.id}`} className="border-t border-border">
                    <td className="px-5 py-3">{p.date}</td>
                    <td className="px-5 py-3 font-medium">${p.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.method}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.note || "—"}</td>
                    <td className="px-5 py-3 text-right"><button onClick={() => delPayment(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No payments logged yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate contract modal */}
      <Modal open={showContract} onClose={() => setShowContract(false)} title="Generate contract & waiver" testid="contract-modal">
        <form onSubmit={genContract} className="space-y-4">
          <Field label="Program"><input className={inputCls} value={cForm.package} onChange={(e) => setCForm({ ...cForm, package: e.target.value })} data-testid="contract-package" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sessions"><input type="number" className={inputCls} value={cForm.sessions} onChange={(e) => setCForm({ ...cForm, sessions: e.target.value })} /></Field>
            <Field label="Total rate ($)"><input type="number" className={inputCls} value={cForm.rate} onChange={(e) => setCForm({ ...cForm, rate: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date"><input type="date" className={inputCls} value={cForm.start_date} onChange={(e) => setCForm({ ...cForm, start_date: e.target.value })} /></Field>
            <Field label="End date"><input type="date" className={inputCls} value={cForm.end_date} onChange={(e) => setCForm({ ...cForm, end_date: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Session length"><input className={inputCls} value={cForm.session_length} onChange={(e) => setCForm({ ...cForm, session_length: e.target.value })} /></Field>
            <Field label="Cancellation notice (hrs)"><input type="number" className={inputCls} value={cForm.cancellation_hours} onChange={(e) => setCForm({ ...cForm, cancellation_hours: e.target.value })} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cForm.include_media_release} onChange={(e) => setCForm({ ...cForm, include_media_release: e.target.checked })} /> Include photo/media release clause</label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowContract(false)} className="px-4 py-2.5 rounded-md text-sm border border-border">Cancel</button>
            <button type="submit" data-testid="save-contract-btn" className="px-4 py-2.5 rounded-md text-sm bg-primary text-primary-foreground font-medium hover:opacity-90">Generate</button>
          </div>
        </form>
      </Modal>

      {/* Payment modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Log a payment" testid="payment-modal">
        <form onSubmit={addPayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount ($)"><input type="number" step="0.01" required className={inputCls} value={pForm.amount} onChange={(e) => setPForm({ ...pForm, amount: e.target.value })} data-testid="payment-amount" /></Field>
            <Field label="Date"><input type="date" className={inputCls} value={pForm.date} onChange={(e) => setPForm({ ...pForm, date: e.target.value })} /></Field>
          </div>
          <Field label="Method"><select className={inputCls} value={pForm.method} onChange={(e) => setPForm({ ...pForm, method: e.target.value })}><option>Card</option><option>Cash</option><option>Bank transfer</option><option>Venmo</option><option>Other</option></select></Field>
          <Field label="Note"><input className={inputCls} value={pForm.note} onChange={(e) => setPForm({ ...pForm, note: e.target.value })} placeholder="e.g. 12-session package" /></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowPayment(false)} className="px-4 py-2.5 rounded-md text-sm border border-border">Cancel</button>
            <button type="submit" data-testid="save-payment-btn" className="px-4 py-2.5 rounded-md text-sm bg-primary text-primary-foreground font-medium hover:opacity-90">Log payment</button>
          </div>
        </form>
      </Modal>

      {/* Edit client modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit client" testid="edit-modal">
        <form onSubmit={saveEdit} className="space-y-4">
          <Field label="Full name"><input required className={inputCls} value={eForm.name || ""} onChange={(e) => setEForm({ ...eForm, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email"><input className={inputCls} value={eForm.email || ""} onChange={(e) => setEForm({ ...eForm, email: e.target.value })} /></Field>
            <Field label="Phone"><input className={inputCls} value={eForm.phone || ""} onChange={(e) => setEForm({ ...eForm, phone: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Program"><input className={inputCls} value={eForm.package || ""} onChange={(e) => setEForm({ ...eForm, package: e.target.value })} /></Field>
            <Field label="Rate ($)"><input type="number" className={inputCls} value={eForm.rate || 0} onChange={(e) => setEForm({ ...eForm, rate: e.target.value })} /></Field>
          </div>
          <Field label="Status"><select className={inputCls} value={eForm.status || "active"} onChange={(e) => setEForm({ ...eForm, status: e.target.value })}><option value="active">Active</option><option value="lead">Lead</option><option value="inactive">Inactive</option></select></Field>
          <Field label="Goals"><textarea rows={2} className={inputCls} value={eForm.goals || ""} onChange={(e) => setEForm({ ...eForm, goals: e.target.value })} /></Field>
          <Field label="Medical notes"><textarea rows={2} className={inputCls} value={eForm.medical_notes || ""} onChange={(e) => setEForm({ ...eForm, medical_notes: e.target.value })} /></Field>
          <Field label="Emergency contact"><input className={inputCls} value={eForm.emergency_contact || ""} onChange={(e) => setEForm({ ...eForm, emergency_contact: e.target.value })} /></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2.5 rounded-md text-sm border border-border">Cancel</button>
            <button type="submit" data-testid="save-edit-btn" className="px-4 py-2.5 rounded-md text-sm bg-primary text-primary-foreground font-medium hover:opacity-90">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
