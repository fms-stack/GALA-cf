import { useI18n } from "@/lib/i18n";

const NAMES = ["CVLN Holding", "Factory Maker Studio", "CVL Culinary Innovations"];

export default function Partenaires() {
  const { t } = useI18n();
  const partners = (t("partenaires.partners") || []).map((p, i) => ({ ...p, name: NAMES[i] }));
  return (
    <div data-testid="public-partners" className="text-ivoire min-h-screen px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">{t("partenaires.eyebrow")}</p>
        <h1 className="serif-display text-5xl lg:text-7xl mb-20 max-w-4xl">{t("partenaires.title")}</h1>
        <div className="grid lg:grid-cols-3 gap-px bg-ivoire/10">
          {partners.map((p) => (
            <div key={p.name} className="bg-noir p-10 lg:p-14">
              <div className="border border-ivoire/30 w-20 h-20 flex items-center justify-center mb-8">
                <div className="serif-display text-3xl text-or">{p.name.charAt(0)}</div>
              </div>
              <div className="serif-display text-3xl mb-2">{p.name}</div>
              <div className="label-eyebrow text-or mb-6">{p.role}</div>
              <p className="text-sable text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-24 max-w-3xl">
          <p className="label-eyebrow text-or mb-4">{t("partenaires.inst_label")}</p>
          <p className="text-sable text-base leading-relaxed">{t("partenaires.inst_body")}</p>
        </div>
      </div>
    </div>
  );
}
