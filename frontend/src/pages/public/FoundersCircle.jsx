import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function FoundersCircle() {
  const [members, setMembers] = useState([]);
  const { t } = useI18n();
  useEffect(() => { api.get("/public/founders-circle").then((r) => setMembers(r.data)).catch(() => {}); }, []);
  const [titleA, titleB] = String(t("founders.title")).split("|");

  return (
    <div data-testid="founders-circle" className="min-h-screen bg-noir text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">{t("founders.eyebrow")}</p>
        <h1 className="serif-display text-5xl md:text-7xl mb-6 max-w-3xl">
          {titleA}<br/><span className="italic">{titleB}</span>
        </h1>
        <p className="text-sable max-w-2xl text-base md:text-lg leading-relaxed mb-20">{t("founders.intro")}</p>

        {members.length === 0 ? (
          <div className="border border-or/20 p-12 text-center max-w-2xl mx-auto">
            <p className="label-eyebrow text-or mb-6">{t("founders.empty_label")}</p>
            <p className="serif-display text-3xl italic mb-6">{t("founders.empty_title")}</p>
            <p className="text-sable text-sm opacity-70">{t("founders.empty_note")}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-ivoire/10">
            {members.map((m, i) => (
              <div key={i} className="bg-noir p-10">
                <div className="label-eyebrow text-or mb-4">{m.kind || t("founders.host")}</div>
                <div className="serif-display text-3xl mb-3">{m.name}</div>
                <p className="text-sable text-sm italic mb-4">{m.title}</p>
                <p className="text-ivoire/80 text-sm leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 pt-12 border-t border-ivoire/10 max-w-2xl">
          <p className="label-eyebrow text-or mb-4">{t("founders.council_label")}</p>
          <p className="serif-display text-2xl mb-2">+596 696 78 89 86</p>
          <p className="text-sable text-sm italic opacity-70">{t("founders.council_note")}</p>
        </div>
      </div>
    </div>
  );
}
