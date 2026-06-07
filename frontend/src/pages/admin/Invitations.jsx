import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const STATUS = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "confirmed", label: "Confirmées" },
  { key: "waiting", label: "Liste d'attente" },
  { key: "declined", label: "Refusées" },
];

export default function Invitations() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = (f = filter) => {
    const q = f === "all" ? "" : `?status=${f}`;
    api.get(`/invitations${q}`).then((r) => setItems(r.data)).catch(() => {});
  };
  useEffect(() => { load(filter); }, [filter]);

  const update = async (id, status) => {
    try {
      await api.patch(`/invitations/${id}`, { status });
      toast.success("Statut mis à jour.");
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const totalSeats = items.reduce((s, it) => s + (it.seats || 0), 0);

  return (
    <div className="p-10" data-testid="admin-invitations">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="label-eyebrow opacity-60">RSVP VIP cfceremony.com</p>
          <h1 className="serif-display text-5xl mt-2">Invitations.</h1>
        </div>
        <div className="text-right">
          <div className="label-eyebrow opacity-60">Places demandées</div>
          <div className="serif-display text-4xl">{totalSeats}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-sable">
        {STATUS.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            data-testid={`invitations-filter-${s.key}`}
            className={`px-4 py-3 label-eyebrow border-b-2 transition-colors ${filter === s.key ? "border-noir text-noir" : "border-transparent opacity-60 hover:opacity-100"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <table className="w-full border border-sable bg-white/40" data-testid="invitations-table">
        <thead>
          <tr className="border-b border-sable label-eyebrow opacity-60 text-left">
            <th className="py-3 px-4">Nom</th>
            <th className="py-3 px-4">E-mail</th>
            <th className="py-3 px-4">Téléphone</th>
            <th className="py-3 px-4 w-20 text-center">Places</th>
            <th className="py-3 px-4">Statut</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-sable/40 hover:bg-sable/20" data-testid={`invitation-row-${it.id}`}>
              <td className="py-3 px-4 serif-display text-lg">{it.full_name}</td>
              <td className="py-3 px-4 text-sm">{it.email}</td>
              <td className="py-3 px-4 text-sm opacity-70">{it.phone || "—"}</td>
              <td className="py-3 px-4 text-center font-medium">{it.seats}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs uppercase tracking-wider ${
                  it.status === "confirmed" ? "bg-sauge text-ivoire" :
                  it.status === "declined" ? "bg-destructive text-destructive-foreground" :
                  it.status === "waiting" ? "bg-brun text-ivoire" : "bg-sable"
                }`}>{it.status}</span>
              </td>
              <td className="py-3 px-4">
                <select value={it.status} onChange={(e) => update(it.id, e.target.value)} className="border border-sable bg-white px-2 py-1 text-sm" data-testid={`invitation-status-${it.id}`}>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmer</option>
                  <option value="waiting">Liste d'attente</option>
                  <option value="declined">Refuser</option>
                </select>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} className="py-10 text-center opacity-60">Aucune invitation pour ce filtre.</td></tr>}
        </tbody>
      </table>

      {items.length > 0 && items[0]?.message && (
        <p className="mt-6 text-xs opacity-50 italic">Astuce : cliquer sur le statut pour valider, refuser ou mettre en liste d'attente.</p>
      )}
    </div>
  );
}
