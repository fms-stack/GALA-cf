import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function Billetterie() {
  const [tickets, setTickets] = useState([]);
  const [pkg, setPkg] = useState(null);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/public/tickets").then((r) => { setTickets(r.data); setPkg(r.data[0]); }).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!pkg) return;
    setLoading(true);
    try {
      const origin_url = window.location.origin;
      const { data } = await api.post("/public/checkout/session", {
        package_id: pkg.id, quantity: Number(qty), origin_url, full_name: name, email,
      });
      window.location.href = data.url;
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
      setLoading(false);
    }
  };

  const total = pkg ? (pkg.amount * qty).toFixed(2) : "0.00";

  return (
    <div data-testid="public-billetterie" className="min-h-screen text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">Billetterie publique</p>
        <h1 className="serif-display text-5xl lg:text-7xl mb-8">Réserver une place.</h1>
        <p className="text-sable max-w-2xl text-lg leading-relaxed mb-16">
          Gradins, zones latérales, gradin premium — assister à la première chapitre du Cook &amp; Food Gala.
        </p>

        <div className="grid md:grid-cols-3 gap-px bg-ivoire/10 mb-16">
          {tickets.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPkg(t)}
              data-testid={`ticket-${t.id}`}
              className={`bg-noir p-10 text-left transition-colors ${pkg?.id === t.id ? "outline outline-1 outline-or" : "hover:bg-noir/60"}`}
            >
              <div className="label-eyebrow text-or mb-4">{t.id}</div>
              <div className="serif-display text-3xl mb-3">{t.label}</div>
              <div className="text-or text-2xl">{t.amount.toFixed(0)} €</div>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="max-w-xl grid grid-cols-2 gap-6">
          <Field label="Nom *" wide><input required value={name} onChange={(e) => setName(e.target.value)} className={inp} data-testid="bill-name" /></Field>
          <Field label="E-mail *" wide><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} data-testid="bill-email" /></Field>
          <Field label="Nombre de places"><input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(e.target.value)} className={inp} data-testid="bill-qty" /></Field>
          <Field label="Total"><div className="py-3 text-3xl serif-display text-or" data-testid="bill-total">{total} €</div></Field>
          <button type="submit" disabled={loading || !pkg} data-testid="bill-submit" className="col-span-2 bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60">
            {loading ? "Redirection Stripe…" : "Payer et réserver →"}
          </button>
          <p className="col-span-2 text-xs opacity-50 italic">Paiement sécurisé via Stripe Checkout. Vous serez redirigé.</p>
        </form>
      </div>
    </div>
  );
}

export function BilletterieSuccess() {
  const [params] = useSearchParams();
  const sid = params.get("session_id");
  const [status, setStatus] = useState({ payment_status: "pending" });
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sid) return;
    let cancel = false;
    const poll = async (a = 0) => {
      if (cancel) return;
      if (a >= 8) return;
      try {
        const { data } = await api.get(`/public/checkout/status/${sid}`);
        setStatus(data); setAttempts(a + 1);
        if (data.payment_status !== "paid" && data.status !== "expired") setTimeout(() => poll(a + 1), 2000);
      } catch { setTimeout(() => poll(a + 1), 2000); }
    };
    poll(0);
    return () => { cancel = true; };
  }, [sid]);

  return (
    <div data-testid="public-billetterie-success" className="min-h-[70vh] text-ivoire flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        {status.payment_status === "paid" ? (
          <>
            <p className="label-eyebrow text-or mb-6">Paiement confirmé</p>
            <h1 className="serif-display text-5xl mb-6">Bienvenue.</h1>
            <p className="text-sable">Votre place est réservée. Un e-mail de confirmation vous parviendra. Référence session <span className="text-or break-all">{sid?.slice(-12)}</span>.</p>
          </>
        ) : status.status === "expired" ? (
          <><h1 className="serif-display text-5xl mb-6">Session expirée.</h1><button onClick={() => navigate("/billetterie")} className="border border-or text-or px-6 py-3 label-eyebrow">Réessayer →</button></>
        ) : (
          <><p className="label-eyebrow text-or mb-6">Vérification…</p><h1 className="serif-display text-5xl mb-6">Paiement en cours.</h1><p className="text-sable">Tentative {attempts}/8…</p></>
        )}
      </div>
    </div>
  );
}
