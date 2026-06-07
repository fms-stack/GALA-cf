import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const TABS = [
  { key: "applications", label: "Candidatures", endpoint: "/applications", cols: ["full_name", "email", "discipline", "project_title"] },
  { key: "castings",     label: "Casting",      endpoint: "/castings",     cols: ["full_name", "email", "profile_type", "phone"] },
  { key: "sponsoring",   label: "Sponsoring",   endpoint: "/sponsoring",   cols: ["company_name", "contact_name", "email", "tier_interest"] },
  { key: "orders",       label: "Billetterie",  endpoint: "/orders",       cols: ["full_name", "email", "package_label", "quantity", "amount", "payment_status"] },
];

const HEADERS = {
  full_name: "Nom", email: "E-mail", discipline: "Discipline", project_title: "Projet",
  profile_type: "Profil", phone: "Téléphone", company_name: "Société", contact_name: "Contact",
  tier_interest: "Tier", package_label: "Billet", quantity: "Qté", amount: "Montant", payment_status: "Paiement",
};

export default function Submissions() {
  const [tab, setTab] = useState(TABS[0]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get(tab.endpoint).then((r) => setItems(r.data)).catch(() => setItems([]));
  }, [tab]);

  return (
    <div className="p-10" data-testid="admin-submissions">
      <div className="mb-10">
        <p className="label-eyebrow opacity-60">Espaces publics</p>
        <h1 className="serif-display text-5xl mt-2">Réceptions.</h1>
      </div>
      <div className="flex gap-2 mb-6 border-b border-sable">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t)}
            data-testid={`submissions-tab-${t.key}`}
            className={`px-4 py-3 label-eyebrow border-b-2 transition-colors ${tab.key === t.key ? "border-noir text-noir" : "border-transparent opacity-60 hover:opacity-100"}`}
          >
            {t.label} ({tab.key === t.key ? items.length : "…"})
          </button>
        ))}
      </div>
      <table className="w-full border border-sable bg-white/40" data-testid={`table-${tab.key}`}>
        <thead>
          <tr className="border-b border-sable label-eyebrow opacity-60 text-left">
            {tab.cols.map((c) => <th key={c} className="py-3 px-4">{HEADERS[c] || c}</th>)}
            <th className="py-3 px-4 w-32">Reçu</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-sable/40 hover:bg-sable/20">
              {tab.cols.map((c) => (
                <td key={c} className="py-3 px-4 text-sm">
                  {c === "amount" ? `${it[c]} €` : (it[c] || "—")}
                </td>
              ))}
              <td className="py-3 px-4 text-xs opacity-60">{new Date(it.created_at).toLocaleDateString("fr-FR")}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={tab.cols.length + 1} className="py-10 text-center opacity-60">Aucune entrée.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
