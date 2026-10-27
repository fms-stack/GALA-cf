import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const eur = (n) => `${Number(n || 0).toLocaleString("fr-FR")} €`;

function Stat({ label, value, hint, testid }) {
  return (
    <div className="border border-sable bg-white/40 p-6" data-testid={testid}>
      <div className="label-eyebrow opacity-60 [overflow-wrap:anywhere]">{label}</div>
      <div className="serif-display text-5xl mt-3">{value}</div>
      {hint && <div className="text-xs opacity-60 mt-2">{hint}</div>}
    </div>
  );
}

export default function Ticketing() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [edits, setEdits] = useState({});
  const isAdmin = user?.role === "admin";

  const load = () => {
    api.get("/ticketing/overview").then((r) => setData(r.data)).catch(() => setData(null));
    api.get("/ticketing/tickets").then((r) => setTickets(r.data)).catch(() => setTickets([]));
  };
  useEffect(load, []);

  const save = async (p) => {
    const e = edits[p.id] || {};
    try {
      await api.put(`/ticketing/packages/${p.id}`, {
        capacity: Number(e.capacity ?? p.capacity),
        active: e.active ?? p.active,
      });
      toast.success(`${p.label} · mis à jour`);
      setEdits((x) => ({ ...x, [p.id]: undefined }));
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const tot = data?.totals;
  return (
    <div className="p-5 md:p-10" data-testid="admin-ticketing">
      <div className="mb-10">
        <p className="label-eyebrow opacity-60">Billetterie publique</p>
        <h1 className="serif-display text-5xl mt-2">Ventes & jauge.</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Stat label="Places vendues" value={tot ? tot.paid : "·"} hint={tot ? `sur ${tot.capacity} places` : ""} testid="tk-sold" />
        <Stat label="Recettes billetterie" value={tot ? eur(tot.revenue) : "·"} hint="paiements confirmés, TTC" testid="tk-revenue" />
        <Stat label="En cours de paiement" value={tot ? tot.held : "·"} hint={data ? `places bloquées ${data.hold_minutes} min` : ""} testid="tk-held" />
        <Stat label="Entrées scannées" value={tot ? tot.checked_in : "·"} hint={tot ? `sur ${tot.paid} billets` : ""} testid="tk-checked" />
      </div>

      <div className="overflow-x-auto">

        <table className="w-full min-w-[640px] border border-sable bg-white/40 mb-14" data-testid="table-packages">
        <thead>
          <tr className="border-b border-sable label-eyebrow opacity-60 text-left">
            <th className="py-3 px-4">Catégorie</th><th className="py-3 px-4">Prix</th><th className="py-3 px-4">Jauge</th>
            <th className="py-3 px-4">Vendues</th><th className="py-3 px-4">Restantes</th><th className="py-3 px-4">Recettes</th>
            <th className="py-3 px-4">En vente</th>{isAdmin && <th className="py-3 px-4" />}
          </tr>
        </thead>
        <tbody>
          {data?.packages.map((p) => {
            const e = edits[p.id] || {};
            return (
              <tr key={p.id} className="border-b border-sable/40" data-testid={`pkg-${p.id}`}>
                <td className="py-3 px-4 text-sm">
                  {p.label}
                  {p.sales_end && <div className="text-xs opacity-60">jusqu'au {new Date(p.sales_end).toLocaleDateString("fr-FR")}</div>}
                </td>
                <td className="py-3 px-4 text-sm">{eur(p.amount)}</td>
                <td className="py-3 px-4 text-sm">
                  {isAdmin ? (
                    <input type="number" min={p.paid} className="w-24 border border-sable bg-transparent px-2 py-1"
                      value={e.capacity ?? p.capacity} data-testid={`pkg-${p.id}-capacity`}
                      onChange={(ev) => setEdits((x) => ({ ...x, [p.id]: { ...e, capacity: ev.target.value } }))} />
                  ) : p.capacity}
                </td>
                <td className="py-3 px-4 text-sm">{p.paid}{p.held > 0 && <span className="opacity-60"> (+{p.held})</span>}</td>
                <td className="py-3 px-4 text-sm">{p.remaining}</td>
                <td className="py-3 px-4 text-sm">{eur(p.revenue)}</td>
                <td className="py-3 px-4 text-sm">
                  {isAdmin ? (
                    <input type="checkbox" checked={e.active ?? p.active} data-testid={`pkg-${p.id}-active`}
                      onChange={(ev) => setEdits((x) => ({ ...x, [p.id]: { ...e, active: ev.target.checked } }))} />
                  ) : (p.on_sale ? "Oui" : "Non")}
                  {p.active && !p.on_sale && <div className="text-xs opacity-60">date dépassée</div>}
                </td>
                {isAdmin && (
                  <td className="py-3 px-4">
                    <button onClick={() => save(p)} disabled={!edits[p.id]} data-testid={`pkg-${p.id}-save`}
                      className="label-eyebrow border border-noir px-3 py-1.5 hover:bg-noir hover:text-ivoire disabled:opacity-30">Enregistrer</button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      </div>

      <h2 className="serif-display text-3xl mb-6">Billets émis ({tickets.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border border-sable bg-white/40" data-testid="table-tickets">
        <thead>
          <tr className="border-b border-sable label-eyebrow opacity-60 text-left">
            <th className="py-3 px-4">Code</th><th className="py-3 px-4">Titulaire</th><th className="py-3 px-4">E-mail</th>
            <th className="py-3 px-4">Catégorie</th><th className="py-3 px-4">Statut</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((tk) => (
            <tr key={tk.id} className="border-b border-sable/40 hover:bg-sable/20">
              <td className="py-3 px-4 text-sm font-mono">{tk.code}</td>
              <td className="py-3 px-4 text-sm">{tk.holder_name}</td>
              <td className="py-3 px-4 text-sm">{tk.email}</td>
              <td className="py-3 px-4 text-sm">{tk.package_label}</td>
              <td className="py-3 px-4 text-sm">
                {tk.status === "checked_in" ? `Entré · ${new Date(tk.checked_in_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "Valide"}
              </td>
            </tr>
          ))}
          {tickets.length === 0 && <tr><td colSpan={5} className="py-10 text-center opacity-60">Aucun billet émis.</td></tr>}
        </tbody>
      </table>
      </div>
    </div>
  );
}
