import { useRef } from "react";
import { useCinematics } from "@/lib/cinematics";
import { useI18n } from "@/lib/i18n";

const HERO = "https://images.unsplash.com/photo-1709837167686-a2e33aad1bf0?auto=format&fit=crop&w=1600&q=80";
const NUMS = ["I", "II", "III", "IV", "V", "VI"];
const IMGS = [
  "https://images.unsplash.com/photo-1670229712389-cbd53e848bbe?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1663530761401-15eefb544889?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1720630351938-1233133223f4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1734771771447-d943e2b5f4d5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1610851467843-fe4a65aea9c0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1570000569749-3a9f0c46d70c?auto=format&fit=crop&w=900&q=80",
];

export default function Concept() {
  const rootRef = useRef(null);
  const { t } = useI18n();
  useCinematics(rootRef);
  const poles = (t("concept.poles") || []).map((p, i) => ({ ...p, num: NUMS[i], img: IMGS[i] }));
  return (
    <div ref={rootRef} data-testid="public-concept" className="text-ivoire">
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <img src={HERO} alt="" data-parallax className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-noir/30" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pb-16 pt-32 w-full">
          <p className="label-eyebrow text-or mb-6" data-reveal>{t("concept.eyebrow")}</p>
          <h1 data-hero-title className="serif-display text-4xl md:text-7xl max-w-4xl">{t("concept.title")}</h1>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-20 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <div data-stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-ivoire/10">
            {poles.map((p) => (
              <div key={p.num} data-stagger-item className="relative bg-noir aspect-[4/5] group overflow-hidden">
                <img src={p.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/80 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-8 lg:p-10">
                  <div className="serif-display text-6xl text-or mb-4">{p.num}</div>
                  <div className="serif-display text-2xl md:text-3xl mb-3 group-hover:text-or transition-colors">{p.title}</div>
                  <p className="text-sable text-sm leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
