import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

const SUGGESTIONS = [5000, 25000, 100000, 500000];
const PURPOSES = ["general", "prizes", "casting", "series", "bible"];

export default function Mecenat() {
  const [form, setForm] = useState({ full_name: "", email: "", organisation: "", amount_eur: 5000, purpose: "general", honeypot: "" });
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const [titleA, titleB] = String(t("mecenat.title")).split("|");
  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/mecenat", { ...form, amount_eur: Number(form.amount_eur) });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
      setLoading(false);
    }
  };

  return (
    <div data-testid="mecenat" className="min-h-screen bg-noir text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20">
        <div>
          <p className="label-eyebrow text-or mb-6">{t("mecenat.eyebrow")}</p>
          <h1 className="serif-display text-5xl md:text-7xl mb-6">{titleA}<br/><span className="italic">{titleB}</span></h1>
          <p className="text-sable text-base md:text-lg leading-relaxed mb-8">{t("mecenat.intro")}</p>
          <div className="space-y-6 mt-12 pt-12 border-t border-ivoire/10">
            <div>
              <p className="label-eyebrow text-or mb-2">{t("mecenat.fiscal_label")}</p>
              <p className="text-sable text-sm leading-relaxed">{t("mecenat.fiscal_body")}</p>
            </div>
            <div>
              <p className="label-eyebrow text-or mb-2">{t("mecenat.council_label")}</p>
              <p className="serif-display text-xl">+596 696 78 89 86</p>
              <p className="text-sable text-xs italic opacity-70">{t("mecenat.council_note")}</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <input type="text" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} />
          <div>
            <label className="label-eyebrow opacity-60 block mb-3">{t("mecenat.amount_label")}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, amount_eur: s })}
                  data-testid={`mecenat-amount-${s}`}
                  className={`py-3 label-eyebrow border transition-colors ${Number(form.amount_eur) === s ? "border-or text-or bg-or/10" : "border-ivoire/20 text-ivoire/60 hover:border-or/60"}`}>
                  {s.toLocaleString("fr-FR")} €
                </button>
              ))}
            </div>
            <input type="number" min={500} value={form.amount_eur} onChange={onChange("amount_eur")} className={inp} placeholder={t("mecenat.custom_ph")} data-testid="mecenat-custom-amount" />
          </div>
          <F l={t("mecenat.purpose")}><select value={form.purpose} onChange={onChange("purpose")} className={inp}>
            {PURPOSES.map((p) => <option key={p} value={p}>{t(`mecenat.purposes.${p}`)}</option>)}
          </select></F>
          <F l={t("common.name")}><input required value={form.full_name} onChange={onChange("full_name")} className={inp} data-testid="mecenat-name" /></F>
          <F l={t("common.email")}><input required type="email" value={form.email} onChange={onChange("email")} className={inp} data-testid="mecenat-email" /></F>
          <F l={t("mecenat.org")}><input value={form.organisation} onChange={onChange("organisation")} className={inp} /></F>
          <button type="submit" disabled={loading} data-testid="mecenat-submit" className="w-full bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60">{loading ? t("mecenat.stripe") : t("mecenat.submit")}</button>
          <p className="text-xs italic opacity-50 text-center block">{t("mecenat.secure")}</p>
        </form>
      </div>
    </div>
  );
}

export function MecenatSuccess() {
  const { t } = useI18n();
  return (
    <div className="min-h-[70vh] bg-noir text-ivoire flex items-center justify-center px-6 py-24" data-testid="mecenat-success">
      <div className="text-center max-w-lg">
        <p className="label-eyebrow text-or mb-6">{t("mecenat.s_label")}</p>
        <h1 className="serif-display text-5xl mb-6">{t("mecenat.s_title")}</h1>
        <p className="text-sable">{t("mecenat.s_body")}</p>
      </div>
    </div>
  );
}

const inp = "w-full bg-transparent border-b border-sable/30 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 transition-colors";
function F({ l, children }) { return (<div><label className="label-eyebrow opacity-60 block mb-2">{l}</label>{children}</div>); }
