import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash, PencilSimple } from "@phosphor-icons/react";

const EMPTY = { code: "", title: "", pole: "", description: "" };

export default function Positions() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);

  const load = () => api.get("/positions").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (it) => { setEditing(it); setForm({ code: it.code, title: it.title, pole: it.pole, description: it.description || "" }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/positions/${editing.id}`, form);
      else await api.post("/positions", form);
      toast.success("Poste enregistré.");
      setOpen(false);
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Supprimer ${it.code} — ${it.title} ?`)) return;
    try { await api.delete(`/positions/${it.id}`); toast.success("Supprimé."); load(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  return (
    <div className="p-10" data-testid="admin-positions">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="label-eyebrow opacity-60">Référentiel</p>
          <h1 className="serif-display text-5xl mt-2">Postes.</h1>
        </div>
        <button onClick={openCreate} data-testid="position-create-btn" className="flex items-center gap-2 bg-noir text-ivoire px-5 py-3 label-eyebrow hover:bg-brun transition-colors">
          <Plus size={14} /> Nouveau poste
        </button>
      </div>

      <table className="w-full border border-sable bg-white/40" data-testid="positions-table">
        <thead>
          <tr className="border-b border-sable label-eyebrow opacity-60 text-left">
            <th className="py-3 px-4 w-32">Code</th>
            <th className="py-3 px-4">Titre</th>
            <th className="py-3 px-4">Pôle</th>
            <th className="py-3 px-4 w-32 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-sable/40 hover:bg-sable/20" data-testid={`position-row-${it.code}`}>
              <td className="py-3 px-4 font-medium">{it.code}</td>
              <td className="py-3 px-4 serif-display text-lg">{it.title}</td>
              <td className="py-3 px-4 text-sm opacity-70">{it.pole}</td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => openEdit(it)} className="p-2 hover:bg-sable" data-testid={`edit-${it.code}`}><PencilSimple size={16} /></button>
                <button onClick={() => remove(it)} className="p-2 hover:bg-destructive hover:text-destructive-foreground" data-testid={`del-${it.code}`}><Trash size={16} /></button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4} className="py-10 text-center opacity-60">Aucun poste.</td></tr>}
        </tbody>
      </table>

      {open && (
        <div className="fixed inset-0 bg-noir/50 z-50 flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-ivoire border border-sable w-full max-w-lg p-8" data-testid="position-modal">
            <h2 className="serif-display text-3xl mb-6">{editing ? "Modifier" : "Nouveau"} poste</h2>
            <div className="space-y-4">
              <div>
                <label className="label-eyebrow opacity-60 block mb-2">Code *</label>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" data-testid="position-form-code" />
              </div>
              <div>
                <label className="label-eyebrow opacity-60 block mb-2">Titre *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" data-testid="position-form-title" />
              </div>
              <div>
                <label className="label-eyebrow opacity-60 block mb-2">Pôle *</label>
                <input required value={form.pole} onChange={(e) => setForm({ ...form, pole: e.target.value })} className="w-full border border-sable bg-white px-4 py-2" data-testid="position-form-pole" />
              </div>
              <div>
                <label className="label-eyebrow opacity-60 block mb-2">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-sable bg-white px-4 py-2 resize-none" data-testid="position-form-desc" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-noir/30 py-3 label-eyebrow">Annuler</button>
              <button type="submit" className="flex-1 bg-noir text-ivoire py-3 label-eyebrow hover:bg-brun" data-testid="position-form-submit">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
