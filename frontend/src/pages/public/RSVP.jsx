import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function RSVP() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", seats: 1, message: "", honeypot: "" });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const { t } = useI18n();
  const [titleA, titleB] = String(t("rsvp.title")).split("|");

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/rsvp", { ...form, seats: Number(form.seats) });
      setConfirmed(data.ref);
      toast.success(t("rsvp.sent_toast"));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div data-testid="public-rsvp-success" className="min-h-[80vh] text-ivoire flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <p className="label-eyebrow text-or mb-6">{t("rsvp.s_label")}</p>
          <h1 className="serif-display text-5xl mb-6">{t("common.thanks")}</h1>
          <p className="text-sable mb-8 leading-relaxed">
            {t("rsvp.s_body1")} <span className="text-or font-medium">#{confirmed}</span>. {t("rsvp.s_body2")}
          </p>
          <p className="text-sable text-sm italic opacity-70">{t("rsvp.nontransf")}</p>
        </div>
      </div>
    );
  }

  const inp = "w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-lg text-ivoire placeholder:text-sable/30 transition-colors";

  return (
    <div data-testid="public-rsvp" className="min-h-screen text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20">
        <div>
          <p className="label-eyebrow text-or mb-6">{t("rsvp.eyebrow")}</p>
          <h1 className="serif-display text-5xl lg:text-7xl mb-8">
            {titleA}<br />
            <span className="italic">{titleB}</span>
          </h1>
          <p className="text-sable text-lg leading-relaxed mb-8 max-w-md">
            {t("rsvp.date_line")}<br />
            {t("rsvp.dress")} <span className="italic">Black Cultural Elegance</span>.
          </p>
          <p className="text-sable text-sm italic opacity-70 max-w-md">{t("rsvp.privacy")}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6" data-testid="rsvp-form">
          <input type="text" name="hp" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />
          <div>
            <label className="label-eyebrow opacity-60 block mb-2">{t("common.name")}</label>
            <input required data-testid="rsvp-name" value={form.full_name} onChange={onChange("full_name")} className={inp} placeholder={t("rsvp.name_ph")} />
          </div>
          <div>
            <label className="label-eyebrow opacity-60 block mb-2">{t("common.email")}</label>
            <input required type="email" data-testid="rsvp-email" value={form.email} onChange={onChange("email")} className={inp} placeholder={t("rsvp.email_ph")} />
          </div>
          <div>
            <label className="label-eyebrow opacity-60 block mb-2">{t("common.phone")}</label>
            <input type="tel" data-testid="rsvp-phone" value={form.phone} onChange={onChange("phone")} className={inp} placeholder="+596 …" />
          </div>
          <div>
            <label className="label-eyebrow opacity-60 block mb-2">{t("rsvp.seats")}</label>
            <input type="number" min={1} max={10} data-testid="rsvp-seats" value={form.seats} onChange={onChange("seats")} className={inp} />
          </div>
          <div>
            <label className="label-eyebrow opacity-60 block mb-2">{t("common.message")}</label>
            <textarea rows={3} data-testid="rsvp-message" value={form.message} onChange={onChange("message")} className={`${inp} resize-none text-base`} placeholder={t("common.optional")} />
          </div>
          <button type="submit" disabled={loading} data-testid="rsvp-submit" className="w-full bg-or text-noir py-5 label-eyebrow mt-8 hover:bg-ivoire transition-colors disabled:opacity-60">
            {loading ? t("common.sending") : t("rsvp.submit")}
          </button>
          <p className="text-xs text-sable/60 text-center italic">{t("rsvp.nontransf")}</p>
        </form>
      </div>
    </div>
  );
}
