import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export function Countdown() {
  const [c, setC] = useState({ days: "·", hours: "·" });
  const { t } = useI18n();

  useEffect(() => {
    const fetch = () => api.get("/public/countdown").then((r) => setC(r.data)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-8 lg:gap-12" data-testid="countdown">
      <div>
        <div className="serif-display text-6xl lg:text-8xl text-or leading-none">{c.days}</div>
        <div className="label-eyebrow opacity-60 mt-2">{t("common.days")}</div>
      </div>
      <div className="text-or text-4xl serif-display">·</div>
      <div>
        <div className="serif-display text-6xl lg:text-8xl text-or leading-none">{c.hours}</div>
        <div className="label-eyebrow opacity-60 mt-2">{t("common.hours")}</div>
      </div>
      <div className="hidden md:block flex-1 border-t border-ivoire/20 ml-6" />
      <div className="hidden md:block label-eyebrow opacity-50">10.04.2027 · 19h00</div>
    </div>
  );
}
