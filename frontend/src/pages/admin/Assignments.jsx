import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash } from "@phosphor-icons/react";

const EMPTY = { position_id: "", person_id: "", start_date: "", end_date: "", status: "active", fee_amount: 0, deliverables: "" };

export default function Assignments() {
  const [items, setItems] = useState([]);
  const [positions, setPositions] = useState([]);
  const [people, setPeople] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    const [a, p, pe] = await Promise.all([api.get("/assignments"), api.get("/positions"), api.get("/people")]);
    setItems(a.data); setPositions(p.data); setPeople(pe.data);
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post("/assignments", { ...form, fee_amount: Number(form.fee_amount) || 0 });
      toast.success("Affectation enregistrée.");
      setOpen(false); setForm(EMPTY); load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const remove = async (it) => {
    if (!window.confirm("Supprimer cette affectation ?")) return;
    try { await api.delete(`/assignments/${it.id}`); toast.success("Supprimé."); load(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  return (
    <div className="p-10" data-testid="admin-assignments">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="label-eyebrow opacity-60">Affectations Poste ↔ Personne</p>
          <h1 className="serif-display text-5xl mt-2">Équipe.</h1>
        </div>
        <button onClick={() => { setForm(EMPTY); setOpen(true); }} data-testid="assignment-create-btn" disabled={!positions.length || !people.length} className="flex items-center gap-2 bg-noir text-ivoire px-5 py-3 label-eyebrow hover:bg-brun transition-colors disabled:opacity-50">
          <Plus size={14} /> Nouvelle affectation
        </button>
      </div>

      {(!positions.length || !people.length) && (
        <div className="border border-brun/40 bg-or/10 px-4 py-3 text-sm mb-6">
          Créez d'abord au moins un poste et une personne avant de pouvoir saisir une affectation.
        </div>
      )}

      <table className="w-full border border-sable bg-white/40" data-testid="assignments-table">
        <thead>
          <tr className="border-b border-sable label-eyebrow opacity-60 text-left">
            <th className="py-3 px-4">Poste</th>
            <th className="py-3 px-4">Personne</th>
            <th className="py-3 px-4">Statut</th>
            <th className="py-3 px-4">Cachet</th>
            <th className="py-3 px-4 w-24 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-sable/40 hover:bg-sable/20">
              <td className="py-3 px-4">
                <div className="serif-display text-lg">{it.position?.title || "—"}</div>
                <div className="text-xs opacity-60">{it.position?.code} · {it.position?.pole}</div>
              </td>
              <td className="py-3 px-4 serif-display text-lg">{it.person?.full_name || "—"}</td>
              <td className="py-3 px-4 text-sm">
                <span className={`px-2 py-1 text-xs uppercase tracking-wider ${it.status === "active" ? "bg-sauge text-ivoire" : "bg-sable"}`}>{it.status}</span>
              </td>
              <td className="py-3 px-4 text-sm opacity-70">{it.fee_amount ? `${Number(it.fee_amount).toLocaleString("fr-FR")} €` : "—"}</td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => remove(it)} className="p-2 hover:bg-destructive hover:text-destructive-foreground"><Trash size={16} /></button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} className="py-10 text-center opacity-60">Aucune affectation pour l'instant.</td></tr>}
        </tbody>
      </table>

      {open && (
        <div className="fixed inset-0 bg-noir/50 z-50 flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-ivoire border border-sable w-full max-w-lg p-8">
            <h2 className="serif-display text-3xl mb-6">Nouvelle affectation</h2>
            <div className="space-y-4">
              <div><label className="label-eyebrow opacity-60 block mb-2">Poste *</label>
                <select required value={form.position_id} onChange={(e) => setForm({ ...form, position_id: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" data-testid="assignment-form-position">
                  <option value="">— Sélectionner —</option>
                  {positions.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.title}</option>)}
                </select></div>
              <div><label className="label-eyebrow opacity-60 block mb-2">Personne *</label>
                <select required value={form.person_id} onChange={(e) => setForm({ ...form, person_id: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" data-testid="assignment-form-person">
                  <option value="">— Sélectionner —</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-eyebrow opacity-60 block mb-2">Début</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" /></div>
                <div><label className="label-eyebrow opacity-60 block mb-2">Fin</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" /></div>
              </div>
              <div><label className="label-eyebrow opacity-60 block mb-2">Cachet (€)</label>
                <input type="number" value={form.fee_amount} onChange={(e) => setForm({ ...form, fee_amount: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" /></div>
              <div><label className="label-eyebrow opacity-60 block mb-2">Livrables</label>
                <textarea rows={2} value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} className="w-full border border-sable bg-white px-4 py-2 resize-none" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-noir/30 py-3 label-eyebrow">Annuler</button>
              <button type="submit" className="flex-1 bg-noir text-ivoire py-3 label-eyebrow hover:bg-brun" data-testid="assignment-form-submit">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
