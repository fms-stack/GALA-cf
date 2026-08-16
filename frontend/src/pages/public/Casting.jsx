import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

const TYPES = ["chef", "artiste", "performer", "mc"];

export default function Casting() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", profile_type: "chef", bio: "", demo_url: "", honeypot: "" });
  const [ref, setRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/casting", form);
      setRef(data.ref);
      toast.success(t("casting.sent_toast"));
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };

  if (ref) return (
    <div data-testid="public-casting-success" className="min-h-[70vh] text-ivoire flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        <p className="label-eyebrow text-or mb-6">{t("casting.s_label")}</p>
        <h1 className="serif-display text-5xl mb-6">{t("casting.s_title")}</h1>
        <p className="text-sable">{t("common.ref")} <span className="text-or">#{ref}</span>. {t("casting.s_body")}</p>
      </div>
    </div>
  );

  return (
    <div data-testid="public-casting" className="min-h-screen text-ivoire">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="relative overflow-hidden hidden lg:block order-2">
          <img src="https://images.unsplash.com/photo-1570000569749-3a9f0c46d70c?auto=format&fit=crop&w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-bl from-noir/30 via-noir/60 to-noir" />
          <div className="relative h-full flex flex-col justify-end p-12">
            <p className="label-eyebrow text-or mb-6">{t("casting.eyebrow")}</p>
            <h1 className="serif-display text-5xl xl:text-7xl mb-6">{t("casting.title")}</h1>
            <p className="text-sable text-lg max-w-md leading-relaxed">{t("casting.intro")}</p>
          </div>
        </div>
        <div className="px-6 lg:px-12 py-20 md:py-24 order-1">
          <div className="lg:hidden mb-10">
            <p className="label-eyebrow text-or mb-4">{t("casting.eyebrow")}</p>
            <h1 className="serif-display text-4xl">{t("casting.title")}</h1>
          </div>
          <form onSubmit={submit} className="space-y-6 max-w-md">
          <input type="text" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />
          <Field label={t("common.name")}><input required value={form.full_name} onChange={onChange("full_name")} className={inp} data-testid="cast-name" /></Field>
          <Field label={t("common.email")}><input required type="email" value={form.email} onChange={onChange("email")} className={inp} data-testid="cast-email" /></Field>
          <Field label={t("common.phone")}><input value={form.phone} onChange={onChange("phone")} className={inp} data-testid="cast-phone" /></Field>
          <Field label={t("casting.profile")}><select value={form.profile_type} onChange={onChange("profile_type")} className={inp} data-testid="cast-type">{TYPES.map((ty) => <option key={ty} value={ty}>{ty}</option>)}</select></Field>
          <Field label={t("casting.bio")}><textarea required rows={4} value={form.bio} onChange={onChange("bio")} className={`${inp} resize-none`} data-testid="cast-bio" /></Field>
          <Field label={t("casting.demo")}><input value={form.demo_url} onChange={onChange("demo_url")} className={inp} placeholder="https://…" data-testid="cast-demo" /></Field>
          <button type="submit" disabled={loading} data-testid="cast-submit" className="w-full bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60">{loading ? t("common.sending") : t("casting.submit")}</button>
        </form>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 transition-colors";
function Field({ label, children }) { return (<div><label className="label-eyebrow opacity-60 block mb-2">{label}</label>{children}</div>); }
