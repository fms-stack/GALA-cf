import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";

export default function SurInvitation() {
  const [params] = useSearchParams();
  const cooptToken = params.get("coopte");
  const [sponsor, setSponsor] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (cooptToken) {
      api.get(`/public/cooptation/${cooptToken}`).then((r) => {
        if (r.data.valid) { setSponsor(r.data.sponsor); setTokenValid(true); }
      }).catch(() => {});
    }
  }, [cooptToken]);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    const message = tokenValid ? `Cooptation reçue de ${sponsor} [coopte:${cooptToken}]` : "Demande de signal depuis /sur-invitation";
    try {
      await api.post("/public/cercle-restreint", {
        full_name: tokenValid ? `Coopté par ${sponsor}` : "Manifestation d'intérêt",
        email, sector: "—", recommended_by: sponsor || "", message,
        philanthropic_engagement: "", honeypot: "",
      });
      setSent(true);
    } catch { setSent(true); }
  };

  return (
    <div data-testid="sur-invitation" className="min-h-[88vh] bg-noir text-ivoire flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <Logo size={56} className="mx-auto mb-12 opacity-70" />

        {tokenValid && sponsor && (
          <div className="border border-or/40 px-6 py-4 mb-12 max-w-md mx-auto" data-testid="cooptation-banner">
            <p className="label-eyebrow text-or mb-2">{t("surinv.coopt_label")}</p>
            <p className="serif-display text-2xl italic">{t("surinv.coopt_line")}<br/><span className="text-or not-italic">{sponsor}</span>.</p>
          </div>
        )}

        <p className="label-eyebrow text-or mb-8">{t("surinv.eyebrow")}</p>
        <h1 className="serif-display text-5xl md:text-7xl mb-10 leading-tight">{t("invitation.title")}</h1>
        <p className="text-sable text-lg md:text-xl max-w-lg mx-auto leading-relaxed mb-16 italic whitespace-pre-line">
          {tokenValid ? t("surinv.body_coopted") : t("invitation.body")}
        </p>

        {sent ? (
          <p className="label-eyebrow text-or" data-testid="signal-confirmed">{t("invitation.signal_ok")}</p>
        ) : (
          <form onSubmit={submit} className="max-w-sm mx-auto">
            <p className="label-eyebrow opacity-50 mb-4">{tokenValid ? t("surinv.email_coopted") : t("invitation.manifest")}</p>
            <div className="flex gap-0 border-b border-or/40 focus-within:border-or transition-colors">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t("surinv.email_ph")} data-testid="signal-email"
                className="flex-1 bg-transparent outline-none py-3 text-base text-ivoire placeholder:text-sable/30" />
              <button type="submit" data-testid="signal-submit" className="text-or hover:text-ivoire transition-colors label-eyebrow px-3">→</button>
            </div>
            <p className="mt-8 text-xs opacity-40 italic">{tokenValid ? t("surinv.token_note") : t("surinv.anon_note")}</p>
          </form>
        )}

        <Link to="/" className="mt-20 inline-block label-eyebrow opacity-30 hover:opacity-100 transition-opacity">{t("surinv.back")}</Link>
      </div>
    </div>
  );
}
