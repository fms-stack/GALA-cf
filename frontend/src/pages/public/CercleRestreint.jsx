import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function CercleRestreint() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", sector: "",
    recommended_by: "", philanthropic_engagement: "", message: "", honeypot: "",
  });
  const [ref, setRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/cercle-restreint", form);
      setRef(data.ref);
      toast.success(t("cercle.sent_toast"));
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };

  if (ref) return (
    <div data-testid="cercle-success" className="min-h-[70vh] bg-noir text-ivoire flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        <p className="label-eyebrow text-or mb-6">{t("cercle.s_label")}</p>
        <h1 className="serif-display text-5xl mb-6">{t("common.thanks")}</h1>
        <p className="text-sable">{t("cercle.s_body")} <span className="text-or">#{ref}</span>. {t("cercle.s_body2")}</p>
        <p className="mt-10 text-xs italic opacity-60">{t("cercle.s_wa")}</p>
      </div>
    </div>
  );

  return (
    <div data-testid="cercle-restreint" className="min-h-screen bg-noir text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-2xl mx-auto">
        <p className="label-eyebrow text-or mb-6">{t("cercle.eyebrow")}</p>
        <h1 className="serif-display text-5xl md:text-6xl mb-6">{t("cercle.title")}</h1>
        <p className="text-sable text-base md:text-lg leading-relaxed mb-12">{t("cercle.intro")}</p>
        <form onSubmit={submit} className="space-y-6">
          <input type="text" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} />
          <F l={t("common.name")}><input required value={form.full_name} onChange={onChange("full_name")} className={inp} /></F>
          <F l={t("cercle.email")}><input required type="email" value={form.email} onChange={onChange("email")} className={inp} /></F>
          <F l={t("cercle.phone")}><input value={form.phone} onChange={onChange("phone")} className={inp} /></F>
          <F l={t("cercle.sector")}><input required value={form.sector} onChange={onChange("sector")} className={inp} placeholder={t("cercle.sector_ph")} /></F>
          <F l={t("cercle.recommended")}><input value={form.recommended_by} onChange={onChange("recommended_by")} className={inp} placeholder={t("common.optional")} /></F>
          <F l={t("cercle.engagement")}><textarea rows={3} value={form.philanthropic_engagement} onChange={onChange("philanthropic_engagement")} className={`${inp} resize-none`} placeholder={t("cercle.engagement_ph")} /></F>
          <F l={t("common.message")}><textarea rows={3} value={form.message} onChange={onChange("message")} className={`${inp} resize-none`} /></F>
          <button type="submit" disabled={loading} data-testid="cercle-submit" className="w-full bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60">{loading ? t("common.sending") : t("cercle.submit")}</button>
          <p className="text-xs italic opacity-50 text-center">{t("cercle.note")}</p>
        </form>
      </div>
    </div>
  );
}

const inp = "w-full bg-transparent border-b border-sable/30 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 transition-colors";
function F({ l, children }) { return (<div><label className="label-eyebrow opacity-60 block mb-2">{l}</label>{children}</div>); }
