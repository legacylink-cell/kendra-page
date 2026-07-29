import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Mail, Phone, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();
  const load = () => api.get("/leads").then((r) => setLeads(r.data));
  useEffect(() => { load(); }, []);

  const convert = async (lead) => {
    await api.post("/clients", { name: lead.name, email: lead.email, phone: lead.phone, goals: lead.goal, status: "active" });
    const fd = new FormData(); fd.append("status", "converted");
    await api.put(`/leads/${lead.id}`, fd);
    toast.success(`${lead.name} added as a client`);
    navigate("/admin/clients");
  };
  const remove = async (id) => { await api.delete(`/leads/${id}`); load(); };

  return (
    <div data-testid="leads-page">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Leads</h1>
      <p className="text-muted-foreground mb-6">Enquiries from the Coach K Studio website.</p>

      <div className="space-y-3">
        {leads.map((l) => (
          <div key={l.id} data-testid={`lead-${l.id}`} className="bg-white border border-border rounded-lg p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{l.name}</p>
                  {l.status === "new" && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">New</span>}
                  {l.status === "converted" && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Converted</span>}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{l.email}</span>
                  {l.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{l.phone}</span>}
                  <span>{l.created_at?.slice(0, 10)}</span>
                </div>
                {l.goal && <p className="text-sm mt-2"><span className="text-muted-foreground">Goal:</span> {l.goal}</p>}
                {l.message && <p className="text-sm mt-1 text-muted-foreground">{l.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => convert(l)} data-testid={`convert-lead-${l.id}`} className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-2 rounded-md hover:opacity-90"><UserPlus className="h-4 w-4" /> Add as client</button>
                <button onClick={() => remove(l.id)} className="text-muted-foreground hover:text-destructive p-2"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {leads.length === 0 && <div className="bg-white border border-border rounded-lg p-12 text-center text-muted-foreground">No leads yet. Enquiries from your website contact form will appear here.</div>}
      </div>
    </div>
  );
}
