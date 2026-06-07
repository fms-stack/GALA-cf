import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash, PencilSimple } from "@phosphor-icons/react";

const EMPTY = { full_name: "", email: "", phone: "", company: "", notes: "" };

export default function People() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/people").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (it) => { setEditing(it); setForm({ full_name: it.full_name, email: it.email || "", phone: it.phone || "", company: it.company || "", notes: it.notes || "" }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/people/${editing.id}`, form);
      else await api.post("/people", form);
      toast.success("Personne enregistrée.");
      setOpen(false); load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Supprimer ${it.full_name} ?`)) return;
    try { await api.delete(`/people/${it.id}`); toast.success("Supprimé."); load(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  return (
    <div className="p-10" data-testid="admin-people">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="label-eyebrow opacity-60">Référentiel</p>
          <h1 className="serif-display text-5xl mt-2">Personnes.</h1>
        </div>
        <button onClick={openCreate} data-testid="person-create-btn" className="flex items-center gap-2 bg-noir text-ivoire px-5 py-3 label-eyebrow hover:bg-brun transition-colors">
          <Plus size={14} /> Nouvelle personne
        </button>
      </div>

      <table className="w-full border border-sable bg-white/40" data-testid="people-table">
        <thead>
          <tr className="border-b border-sable label-eyebrow opacity-60 text-left">
            <th className="py-3 px-4">Nom complet</th>
            <th className="py-3 px-4">E-mail</th>
            <th className="py-3 px-4">Société</th>
            <th className="py-3 px-4 w-32 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-sable/40 hover:bg-sable/20">
              <td className="py-3 px-4 serif-display text-lg">{it.full_name}</td>
              <td className="py-3 px-4 text-sm opacity-70">{it.email || "—"}</td>
              <td className="py-3 px-4 text-sm opacity-70">{it.company || "—"}</td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => openEdit(it)} className="p-2 hover:bg-sable"><PencilSimple size={16} /></button>
                <button onClick={() => remove(it)} className="p-2 hover:bg-destructive hover:text-destructive-foreground"><Trash size={16} /></button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4} className="py-10 text-center opacity-60">Aucune personne. Ajoutez les noms à partir de votre liste confirmée.</td></tr>}
        </tbody>
      </table>

      {open && (
        <div className="fixed inset-0 bg-noir/50 z-50 flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-ivoire border border-sable w-full max-w-lg p-8">
            <h2 className="serif-display text-3xl mb-6">{editing ? "Modifier" : "Nouvelle"} personne</h2>
            <div className="space-y-4">
              <div><label className="label-eyebrow opacity-60 block mb-2">Nom complet *</label>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" data-testid="person-form-name" /></div>
              <div><label className="label-eyebrow opacity-60 block mb-2">E-mail</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" /></div>
              <div><label className="label-eyebrow opacity-60 block mb-2">Téléphone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" /></div>
              <div><label className="label-eyebrow opacity-60 block mb-2">Société</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" /></div>
              <div><label className="label-eyebrow opacity-60 block mb-2">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-sable bg-white px-4 py-2 resize-none" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-noir/30 py-3 label-eyebrow">Annuler</button>
              <button type="submit" className="flex-1 bg-noir text-ivoire py-3 label-eyebrow hover:bg-brun" data-testid="person-form-submit">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
