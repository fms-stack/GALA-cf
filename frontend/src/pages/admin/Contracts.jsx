import { useEffect, useState } from "react";
import { api, formatApiError, API } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Download, FileText } from "@phosphor-icons/react";

const STATUS_LABEL = {
  draft: "Brouillon", juridique_review: "À valider", approved: "Validé",
  refused: "Refusé", sent: "Envoyé", signed: "Signé", archived: "Archivé",
};
const STATUS_COLOR = {
  draft: "bg-sable", juridique_review: "bg-brun text-ivoire",
  approved: "bg-sauge text-ivoire", refused: "bg-destructive text-destructive-foreground",
  sent: "bg-or text-noir", signed: "bg-noir text-ivoire", archived: "bg-sable/60",
};

const EMPTY = { template_id: "nda", assignment_id: "", person_id: "", deliverables: "", fee_amount: 0, start_date: "", end_date: "", notes: "" };

export default function Contracts() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [people, setPeople] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const [c, t, a, p] = await Promise.all([
      api.get("/contracts"),
      api.get("/contract-templates"),
      api.get("/assignments").catch(() => ({ data: [] })),
      api.get("/people").catch(() => ({ data: [] })),
    ]);
    setItems(c.data); setTemplates(t.data); setAssignments(a.data); setPeople(p.data);
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, fee_amount: Number(form.fee_amount) || 0 };
      if (!body.assignment_id) delete body.assignment_id;
      if (!body.person_id) delete body.person_id;
      await api.post("/contracts", body);
      toast.success("Contrat créé.");
      setOpen(false); setForm(EMPTY); load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/contracts/${id}/status`, { status });
      toast.success(`Statut → ${STATUS_LABEL[status] || status}`);
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const downloadPdf = (id, label) => {
    const win = window.open(`${API}/contracts/${id}/pdf`, "_blank");
    if (!win) toast.error("Bloqueur de pop-up : autorisez les téléchargements.");
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);
  const role = user?.role;

  return (
    <div className="p-10" data-testid="admin-contracts">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="label-eyebrow opacity-60">Phase 4</p>
          <h1 className="serif-display text-5xl mt-2">Contrats &amp; NDA.</h1>
        </div>
        {(role === "admin" || role === "production") && (
          <button onClick={() => { setForm(EMPTY); setOpen(true); }} data-testid="contract-create-btn" className="flex items-center gap-2 bg-noir text-ivoire px-5 py-3 label-eyebrow hover:bg-brun transition-colors">
            <Plus size={14} /> Nouveau contrat
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b border-sable overflow-x-auto">
        {["all", ...Object.keys(STATUS_LABEL)].map((s) => (
          <button key={s} onClick={() => setFilter(s)} data-testid={`contract-filter-${s}`}
            className={`px-4 py-3 label-eyebrow border-b-2 whitespace-nowrap transition-colors ${filter === s ? "border-noir text-noir" : "border-transparent opacity-60 hover:opacity-100"}`}>
            {s === "all" ? "Tous" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <table className="w-full border border-sable bg-white/40" data-testid="contracts-table">
        <thead>
          <tr className="border-b border-sable label-eyebrow opacity-60 text-left">
            <th className="py-3 px-4">Template</th>
            <th className="py-3 px-4">Bénéficiaire</th>
            <th className="py-3 px-4">Poste</th>
            <th className="py-3 px-4">Montant</th>
            <th className="py-3 px-4">Statut</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="border-b border-sable/40 hover:bg-sable/20">
              <td className="py-3 px-4">
                <div className="serif-display text-lg">{c.template_title}</div>
                <div className="text-xs opacity-60">{c.kind}</div>
              </td>
              <td className="py-3 px-4 text-sm">{c.person?.full_name || "—"}</td>
              <td className="py-3 px-4 text-sm opacity-70">{c.position_title || "—"}</td>
              <td className="py-3 px-4 text-sm">{c.fee_amount ? `${Number(c.fee_amount).toLocaleString("fr-FR")} €` : "—"}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs uppercase tracking-wider ${STATUS_COLOR[c.status] || "bg-sable"}`}>{STATUS_LABEL[c.status] || c.status}</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <button onClick={() => downloadPdf(c.id)} className="p-2 hover:bg-sable" title="Télécharger PDF" data-testid={`pdf-${c.id}`}><Download size={16} /></button>
                  {role === "production" && c.status === "draft" && <button onClick={() => setStatus(c.id, "juridique_review")} className="text-xs px-2 py-1 border border-noir/30 hover:bg-noir hover:text-ivoire">→ Juridique</button>}
                  {role === "juridique" && c.status === "juridique_review" && <>
                    <button onClick={() => setStatus(c.id, "approved")} className="text-xs px-2 py-1 bg-sauge text-ivoire hover:bg-noir">Valider</button>
                    <button onClick={() => setStatus(c.id, "refused")} className="text-xs px-2 py-1 bg-destructive text-destructive-foreground">Refuser</button>
                  </>}
                  {role === "admin" && c.status === "approved" && <button onClick={() => setStatus(c.id, "sent")} className="text-xs px-2 py-1 bg-or text-noir">Envoyer</button>}
                  {role === "admin" && c.status === "sent" && <button onClick={() => setStatus(c.id, "signed")} className="text-xs px-2 py-1 bg-noir text-ivoire">Marquer signé</button>}
                  {role === "admin" && c.status === "signed" && <button onClick={() => setStatus(c.id, "archived")} className="text-xs px-2 py-1 border border-noir/30">Archiver</button>}
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={6} className="py-10 text-center opacity-60">Aucun contrat.</td></tr>}
        </tbody>
      </table>

      {open && (
        <div className="fixed inset-0 bg-noir/50 z-50 flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-ivoire border border-sable w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="serif-display text-3xl mb-6">Nouveau contrat</h2>
            <div className="space-y-4">
              <div><label className="label-eyebrow opacity-60 block mb-2">Template *</label>
                <select required value={form.template_id} onChange={(e) => setForm({ ...form, template_id: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" data-testid="contract-form-template">
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select></div>
              <div><label className="label-eyebrow opacity-60 block mb-2">Affectation (poste + personne)</label>
                <select value={form.assignment_id} onChange={(e) => setForm({ ...form, assignment_id: e.target.value, person_id: "" })} className="w-full border border-sable bg-white px-4 py-2">
                  <option value="">— Aucune (utiliser personne directe ci-dessous) —</option>
                  {assignments.map((a) => <option key={a.id} value={a.id}>{a.position?.code} · {a.position?.title} → {a.person?.full_name}</option>)}
                </select></div>
              <div><label className="label-eyebrow opacity-60 block mb-2">Ou personne directe</label>
                <select value={form.person_id} onChange={(e) => setForm({ ...form, person_id: e.target.value, assignment_id: "" })} disabled={!!form.assignment_id} className="w-full border border-sable bg-white px-4 py-2 disabled:opacity-50">
                  <option value="">— Sélectionner —</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-eyebrow opacity-60 block mb-2">Montant (€)</label>
                  <input type="number" value={form.fee_amount} onChange={(e) => setForm({ ...form, fee_amount: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="label-eyebrow opacity-60 block mb-2">Début</label>
                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full border border-sable bg-white px-2 py-2 text-sm" /></div>
                  <div><label className="label-eyebrow opacity-60 block mb-2">Fin</label>
                    <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full border border-sable bg-white px-2 py-2 text-sm" /></div>
                </div>
              </div>
              <div><label className="label-eyebrow opacity-60 block mb-2">Livrables</label>
                <textarea rows={2} value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} className="w-full border border-sable bg-white px-4 py-2 resize-none" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-noir/30 py-3 label-eyebrow">Annuler</button>
              <button type="submit" className="flex-1 bg-noir text-ivoire py-3 label-eyebrow hover:bg-brun" data-testid="contract-form-submit">Générer en brouillon</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
