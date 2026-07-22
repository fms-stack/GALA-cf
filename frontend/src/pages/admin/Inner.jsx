import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Copy, Plus } from "@phosphor-icons/react";

const TABS = [
  { key: "cercle", label: "Cercle restreint", endpoint: "/cercle-restreint-inquiries", cols: ["full_name", "email", "sector", "recommended_by", "status"] },
  { key: "mecenat", label: "Mécénat", endpoint: "/mecenat-donations", cols: ["full_name", "email", "organisation", "amount", "purpose", "payment_status"] },
  { key: "cooptation", label: "Cooptation tokens", endpoint: "/cooptation/list", cols: ["sponsor_name", "token", "used", "expires_at"] },
];

const HEADERS = {
  full_name: "Nom", email: "E-mail", sector: "Secteur", recommended_by: "Coopté par",
  organisation: "Organisation", amount: "Montant", purpose: "Affectation",
  payment_status: "Paiement", status: "Statut", sponsor_name: "Parrain", token: "Token",
  used: "Utilisé", expires_at: "Expire",
};

export default function Inner() {
  const [tab, setTab] = useState(TABS[0]);
  const [items, setItems] = useState([]);
  const [sponsor, setSponsor] = useState("");

  const load = () => api.get(tab.endpoint).then((r) => setItems(r.data)).catch(() => setItems([]));
  useEffect(() => { load(); }, [tab]);

  const issueToken = async () => {
    try {
      const { data } = await api.post("/cooptation/issue", { sponsor_name: sponsor || "Direction" });
      await navigator.clipboard.writeText(data.url);
      toast.success("Token créé · URL copiée dans le presse-papier");
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const exportCsv = () => {
    if (items.length === 0) { toast.error("Rien à exporter"); return; }
    const cols = [...tab.cols, "created_at"];
    const escape = (v) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[,;"\n]/.test(s) ? `"${s}"` : s;
    };
    const rows = [
      cols.map((c) => HEADERS[c] || c).join(";"),
      ...items.map((it) => cols.map((c) => escape(it[c])).join(";")),
    ];
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `cookfood_${tab.key}_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exporté");
  };

  return (
    <div className="p-10" data-testid="admin-inner">
      <div className="mb-10">
        <p className="label-eyebrow opacity-60">Tiers premium</p>
        <h1 className="serif-display text-5xl mt-2">Cercle, Mécénat &amp; Cooptation.</h1>
      </div>
      <div className="flex gap-2 mb-6 border-b border-sable items-center">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t)} data-testid={`inner-tab-${t.key}`}
            className={`px-4 py-3 label-eyebrow border-b-2 transition-colors ${tab.key === t.key ? "border-noir text-noir" : "border-transparent opacity-60 hover:opacity-100"}`}>
            {t.label}
          </button>
        ))}
        <button onClick={exportCsv} data-testid="export-csv-btn" className="ml-auto mb-2 flex items-center gap-2 border border-noir/30 px-3 py-1.5 label-eyebrow hover:bg-noir hover:text-ivoire transition-colors text-xs">
          <DownloadSimple size={14} /> Exporter CSV
        </button>
      </div>

      {tab.key === "cooptation" && (
        <div className="mb-6 flex gap-2 items-end">
          <div className="flex-1 max-w-sm">
            <label className="label-eyebrow opacity-60 block mb-2">Nom du parrain</label>
            <input value={sponsor} onChange={(e) => setSponsor(e.target.value)} className="w-full border border-sable bg-white px-4 py-2" placeholder="Ex : Laurent CVLN" data-testid="cooptation-sponsor-name" />
          </div>
          <button onClick={issueToken} data-testid="cooptation-issue-btn" className="flex items-center gap-2 bg-noir text-ivoire px-5 py-2 label-eyebrow hover:bg-brun transition-colors">
            <Plus size={14} /> Émettre un token (7j)
          </button>
        </div>
      )}

      <table className="w-full border border-sable bg-white/40" data-testid={`inner-table-${tab.key}`}>
        <thead>
          <tr className="border-b border-sable label-eyebrow opacity-60 text-left">
            {tab.cols.map((c) => <th key={c} className="py-3 px-4">{HEADERS[c] || c}</th>)}
            <th className="py-3 px-4 w-24">Reçu</th>
            {tab.key === "cooptation" && <th className="py-3 px-4 w-20">Copier</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id || it.token} className="border-b border-sable/40 hover:bg-sable/20">
              {tab.cols.map((c) => (
                <td key={c} className="py-3 px-4 text-sm">
                  {c === "amount" ? `${it[c]?.toLocaleString("fr-FR") || 0} €` :
                   c === "token" ? <code className="text-xs">{(it[c] || "").slice(0, 12)}…</code> :
                   c === "used" ? (it[c] ? "✓" : "—") :
                   c === "expires_at" ? new Date(it[c]).toLocaleDateString("fr-FR") :
                   (it[c] || "—")}
                </td>
              ))}
              <td className="py-3 px-4 text-xs opacity-60">{it.created_at ? new Date(it.created_at).toLocaleDateString("fr-FR") : "—"}</td>
              {tab.key === "cooptation" && (
                <td className="py-3 px-4">
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/cercle-restreint?coopte=${it.token}`); toast.success("URL copiée"); }} className="p-2 hover:bg-sable" data-testid={`copy-${it.token}`}>
                    <Copy size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={tab.cols.length + 2} className="py-10 text-center opacity-60">Aucune entrée.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
