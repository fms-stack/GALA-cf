import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Billetterie() {
  const [tickets, setTickets] = useState([]);
  const [pkg, setPkg] = useState(null);
  const [step, setStep] = useState(1);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/public/tickets").then((r) => setTickets(r.data)).catch((e) => { console.error(e); toast.error("Impossible de charger la billetterie."); });
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

  // Tier descriptions (no prices on step 1)
  const tierCopy = {
    vip:     { eyebrow: "Cercle restreint", body: "Table d'honneur · accès backstage · cocktail privé · positions premium." },
    premium: { eyebrow: "Premium", body: "Gradin face en hauteur · arrivée prioritaire · vestiaire dédié." },
    gradin:  { eyebrow: "Gradin", body: "Vue directe sur la scène circulaire · expérience complète." },
    lateral: { eyebrow: "Latéral", body: "Zone debout · ambiance immersive proche des îlots cuisine." },
  };

  return (
    <div data-testid="public-billetterie" className="min-h-screen text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">Billetterie · Paris · 12.12.2026</p>
        <h1 className="serif-display text-5xl lg:text-7xl mb-8">Réserver une place.</h1>
        <p className="text-sable max-w-2xl text-lg leading-relaxed mb-16">
          Une nuit · une scène · sept disciplines. Choisissez d'abord la nature de votre présence — le détail suivra.
        </p>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-ivoire/10"
            >
              {tickets.map((t, i) => {
                const copy = tierCopy[t.id] || { eyebrow: t.label, body: "" };
                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    onClick={() => { setPkg(t); setStep(2); }}
                    data-testid={`ticket-${t.id}`}
                    className="bg-noir p-10 text-left transition-all hover:bg-noir/40 group relative overflow-hidden"
                  >
                    <div className="label-eyebrow text-or mb-6">{copy.eyebrow}</div>
                    <div className="serif-display text-4xl mb-4 group-hover:text-or transition-colors">{t.label}</div>
                    <p className="text-sable text-sm leading-relaxed">{copy.body}</p>
                    <div className="mt-8 label-eyebrow opacity-60 group-hover:opacity-100 group-hover:text-or transition-all">Choisir →</div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {step === 2 && pkg && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              onSubmit={submit}
              className="max-w-2xl"
            >
              <button type="button" onClick={() => { setStep(1); setPkg(null); }} className="label-eyebrow text-or mb-10 opacity-70 hover:opacity-100" data-testid="bill-back">← Changer de catégorie</button>
              <div className="border-l-2 border-or pl-6 mb-10">
                <div className="label-eyebrow text-or mb-2">{tierCopy[pkg.id]?.eyebrow}</div>
                <div className="serif-display text-4xl">{pkg.label}</div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Field wide label="Nom & Prénom *"><input required value={name} onChange={(e) => setName(e.target.value)} className={inp} data-testid="bill-name" /></Field>
                <Field wide label="E-mail *"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} data-testid="bill-email" /></Field>
                <Field label="Nombre de places"><input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(e.target.value)} className={inp} data-testid="bill-qty" /></Field>
                <Field label="Total à régler">
                  <motion.div key={total} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-3 text-3xl serif-display text-or" data-testid="bill-total">
                    {total} €
                  </motion.div>
                </Field>
                <button type="submit" disabled={loading || !pkg} data-testid="bill-submit" className="col-span-2 bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60 mt-4">
                  {loading ? "Redirection Stripe…" : "Payer et réserver →"}
                </button>
                <p className="col-span-2 text-xs opacity-50 italic">Paiement sécurisé via Stripe Checkout. Vous serez redirigé.</p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const inp = "w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 transition-colors";
function Field({ label, children }) { return (<div><label className="label-eyebrow opacity-60 block mb-2">{label}</label>{children}</div>); }

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
          <><p className="label-eyebrow text-or mb-6">Paiement confirmé</p><h1 className="serif-display text-5xl mb-6">Bienvenue.</h1><p className="text-sable">Votre place est réservée. Un e-mail de confirmation vous parviendra.</p></>
        ) : status.status === "expired" ? (
          <><h1 className="serif-display text-5xl mb-6">Session expirée.</h1><button onClick={() => navigate("/billetterie")} className="border border-or text-or px-6 py-3 label-eyebrow">Réessayer →</button></>
        ) : (
          <><p className="label-eyebrow text-or mb-6">Vérification…</p><h1 className="serif-display text-5xl mb-6">Paiement en cours.</h1><p className="text-sable">Tentative {attempts}/8…</p></>
        )}
      </div>
    </div>
  );
}
