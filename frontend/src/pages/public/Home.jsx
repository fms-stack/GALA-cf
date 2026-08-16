import { Link } from "react-router-dom";
import { useRef } from "react";
import { Logo } from "@/components/Logo";
import { Countdown } from "@/components/Countdown";
import { useCinematics } from "@/lib/cinematics";
import { useI18n } from "@/lib/i18n";

const HERO_IMG = "https://images.unsplash.com/photo-1709837167686-a2e33aad1bf0?auto=format&fit=crop&w=1920&q=80";
const PLATE_IMG = "https://images.unsplash.com/photo-1663530761401-15eefb544889?auto=format&fit=crop&w=1200&q=80";
const BANQUET_IMG = "https://images.unsplash.com/photo-1670229712389-cbd53e848bbe?auto=format&fit=crop&w=1200&q=80";
const DISC_IMGS = [
  "https://images.unsplash.com/photo-1709837167686-a2e33aad1bf0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1670229712389-cbd53e848bbe?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1538819137474-ffa0ee381af6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1720630351938-1233133223f4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1570000569749-3a9f0c46d70c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1663530761401-15eefb544889?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1734771771447-d943e2b5f4d5?auto=format&fit=crop&w=900&q=80",
];

export default function Home() {
  const rootRef = useRef(null);
  const { t } = useI18n();
  useCinematics(rootRef);
  const disciplines = (t("home.disciplines") || []).map((d, i) => ({ ...d, num: String(i + 1).padStart(2, "0"), img: DISC_IMGS[i] }));
  const [ctaA, ctaB] = String(t("home.cta_title")).split("|");

  return (
    <div ref={rootRef} data-testid="public-home" className="text-ivoire">
      <section className="relative min-h-[92vh] flex items-end overflow-hidden snap-start">
        <img src={HERO_IMG} alt="" data-parallax className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-noir/30" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pb-16 md:pb-24 pt-32 w-full">
          <div className="max-w-3xl">
            <div className="label-eyebrow text-or mb-6 md:mb-8" data-reveal>{t("hero.chapter")}</div>
            <h1 data-hero-title className="serif-display text-[clamp(2.6rem,9vw,7.5rem)] mb-6 md:mb-8">
              Cook &amp; Food Gala.
            </h1>
            <p className="text-base md:text-xl text-sable max-w-2xl leading-relaxed" data-reveal>
              {t("hero.tagline")}
              <span className="italic"> {t("hero.note")}</span>
            </p>
            <div className="mt-8 md:mt-12 flex flex-wrap gap-3 md:gap-4" data-reveal>
              <Link to="/rsvp" data-testid="home-cta-rsvp" className="bg-or text-noir px-6 md:px-8 py-3 md:py-4 label-eyebrow hover:bg-ivoire transition-colors">
                {t("cta.confirm_presence")} →
              </Link>
              <Link to="/billetterie" data-testid="home-cta-billet" className="border border-ivoire/40 px-6 md:px-8 py-3 md:py-4 label-eyebrow hover:border-or hover:text-or transition-colors">
                {t("cta.public_billet")}
              </Link>
            </div>
            <div className="mt-12 md:mt-20 pt-6 md:pt-10 border-t border-ivoire/10" data-reveal>
              <Countdown />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 px-6 lg:px-12 snap-start">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-end" data-reveal>
            <div className="lg:col-span-2"><Logo size={56} className="text-or" /></div>
            <div className="lg:col-span-9">
              <p className="label-eyebrow text-or mb-4 md:mb-6">{t("home.founding_label")}</p>
              <p className="serif-display text-3xl md:text-5xl lg:text-6xl leading-[1.05] italic">{t("home.founding")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 px-6 lg:px-12 bg-noir border-t border-ivoire/10 snap-start">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-10 md:mb-16 flex-wrap gap-6" data-reveal>
            <div>
              <p className="label-eyebrow text-or mb-3 md:mb-4">{t("home.disc_eyebrow")}</p>
              <h2 className="serif-display text-4xl md:text-6xl">{t("home.disc_title")}</h2>
            </div>
            <p className="text-sable max-w-md text-sm leading-relaxed">{t("home.disc_note")}</p>
          </div>
          <div data-stagger className="flex md:overflow-x-auto md:snap-x md:snap-mandatory flex-col md:flex-row gap-px bg-ivoire/10 -mx-6 lg:-mx-12 px-6 lg:px-12 pb-4 scrollbar-hide">
            {disciplines.map((d) => (
              <div key={d.num} data-stagger-item className="relative bg-noir md:min-w-[320px] md:snap-start flex-shrink-0 group overflow-hidden">
                <div className="aspect-[4/3] md:aspect-[3/4] relative">
                  <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                    <div className="label-eyebrow text-or mb-3">{d.num}</div>
                    <div className="serif-display text-3xl md:text-4xl mb-2 group-hover:text-or transition-colors">{d.name}</div>
                    <div className="text-sable italic text-sm mb-3">— {d.word}</div>
                    <p className="text-ivoire/80 text-xs md:text-sm leading-relaxed">{d.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="hidden md:block mt-4 label-eyebrow opacity-40">{t("home.scroll")}</p>
        </div>
      </section>

      <section className="py-20 md:py-24 px-6 lg:px-12 snap-start">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div data-reveal>
            <img src={PLATE_IMG} alt="" className="w-full h-[40vh] md:h-[60vh] object-cover" />
            <p className="label-eyebrow text-or mt-4 md:mt-6">{t("home.flux1_label")}</p>
            <p className="serif-display text-2xl md:text-3xl mt-2 leading-tight">{t("home.flux1")}</p>
          </div>
          <div className="lg:mt-32" data-reveal>
            <img src={BANQUET_IMG} alt="" className="w-full h-[40vh] md:h-[60vh] object-cover" />
            <p className="label-eyebrow text-or mt-4 md:mt-6">{t("home.flux2_label")}</p>
            <p className="serif-display text-2xl md:text-3xl mt-2 leading-tight">{t("home.flux2")}</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 bg-noir border-t border-ivoire/10">
        <div className="max-w-[1400px] mx-auto text-center" data-reveal>
          <p className="label-eyebrow text-or mb-4">{t("home.eco_label")}</p>
          <p className="serif-display text-3xl md:text-5xl italic max-w-3xl mx-auto leading-tight">{t("home.eco_quote")}</p>
          <p className="mt-6 md:mt-8 text-sable text-sm opacity-60 max-w-md mx-auto leading-relaxed">{t("home.eco_note")}</p>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 lg:px-12 bg-noir border-t border-ivoire/10 snap-start">
        <div className="max-w-3xl mx-auto text-center" data-reveal>
          <p className="label-eyebrow text-or mb-4 md:mb-6">{t("home.cta_label")}</p>
          <h2 className="serif-display text-4xl md:text-7xl mb-6 md:mb-8">
            {ctaA}<br /><span className="italic">{ctaB}</span>
          </h2>
          <p className="text-sable mb-8 md:mb-12 text-base md:text-lg">{t("home.cta_body")}</p>
          <Link to="/rsvp" data-testid="home-final-cta" className="inline-block bg-or text-noir px-8 md:px-12 py-4 md:py-5 label-eyebrow hover:bg-ivoire transition-colors">
            {t("cta.confirm_presence")}
          </Link>
        </div>
      </section>
    </div>
  );
}
