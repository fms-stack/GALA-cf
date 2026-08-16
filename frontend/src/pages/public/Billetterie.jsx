import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export default function Billetterie() {
  const [tickets, setTickets] = useState([]);
  const [pkg, setPkg] = useState(null);
  const [step, setStep] = useState(1);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    api.get("/public/tickets").then((r) => setTickets(r.data)).catch((e) => { console.error(e); toast.error(t("billetterie.load_error")); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const tierCopy = (id) => t(`billetterie.tiers.${id}`);

  return (
    <div data-testid="public-billetterie" className="min-h-screen text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">{t("billetterie.eyebrow")}</p>
        <h1 className="serif-display text-5xl lg:text-7xl mb-8">{t("billetterie.title")}</h1>
        <p className="text-sable max-w-2xl text-lg leading-relaxed mb-16">{t("billetterie.intro")}</p>

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
              {tickets.map((tk, i) => {
                const copy = typeof tierCopy(tk.id) === "object" ? tierCopy(tk.id) : { eyebrow: tk.label, body: "" };
                return (
                  <motion.button
                    key={tk.id}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    onClick={() => { setPkg(tk); setStep(2); }}
                    data-testid={`ticket-${tk.id}`}
                    className="bg-noir p-10 text-left transition-all hover:bg-noir/40 group relative overflow-hidden"
                  >
                    <div className="label-eyebrow text-or mb-6">{copy.eyebrow}</div>
                    <div className="serif-display text-4xl mb-4 group-hover:text-or transition-colors">{tk.label}</div>
                    <p className="text-sable text-sm leading-relaxed">{copy.body}</p>
                    <div className="mt-8 label-eyebrow opacity-60 group-hover:opacity-100 group-hover:text-or transition-all">{t("common.choose")}</div>
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
              <button type="button" onClick={() => { setStep(1); setPkg(null); }} className="label-eyebrow text-or mb-10 opacity-70 hover:opacity-100" data-testid="bill-back">{t("billetterie.back")}</button>
              <div className="border-l-2 border-or pl-6 mb-10">
                <div className="label-eyebrow text-or mb-2">{(typeof tierCopy(pkg.id) === "object" && tierCopy(pkg.id).eyebrow) || pkg.label}</div>
                <div className="serif-display text-4xl">{pkg.label}</div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Field wide label={t("common.name")}><input required value={name} onChange={(e) => setName(e.target.value)} className={inp} data-testid="bill-name" /></Field>
                <Field wide label={t("common.email")}><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} data-testid="bill-email" /></Field>
                <Field label={t("billetterie.qty")}><input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(e.target.value)} className={inp} data-testid="bill-qty" /></Field>
                <Field label={t("billetterie.total")}>
                  <motion.div key={total} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-3 text-3xl serif-display text-or" data-testid="bill-total">
                    {total} €
                  </motion.div>
                </Field>
                <button type="submit" disabled={loading || !pkg} data-testid="bill-submit" className="col-span-2 bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60 mt-4">
                  {loading ? t("billetterie.redirect") : t("billetterie.pay")}
                </button>
                <p className="col-span-2 text-xs opacity-50 italic">{t("billetterie.secure")}</p>
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
  const { t } = useI18n();

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
          <><p className="label-eyebrow text-or mb-6">{t("billetterie.s_paid_label")}</p><h1 className="serif-display text-5xl mb-6">{t("billetterie.s_paid_title")}</h1><p className="text-sable">{t("billetterie.s_paid_body")}</p></>
        ) : status.status === "expired" ? (
          <><h1 className="serif-display text-5xl mb-6">{t("billetterie.s_expired")}</h1><button onClick={() => navigate("/billetterie")} className="border border-or text-or px-6 py-3 label-eyebrow">{t("billetterie.s_retry")}</button></>
        ) : (
          <><p className="label-eyebrow text-or mb-6">{t("billetterie.s_wait_label")}</p><h1 className="serif-display text-5xl mb-6">{t("billetterie.s_wait_title")}</h1><p className="text-sable">{t("billetterie.s_attempt")} {attempts}/8…</p></>
        )}
      </div>
    </div>
  );
}
