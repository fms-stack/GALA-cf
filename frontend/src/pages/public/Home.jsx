import { Link } from "react-router-dom";
import { useRef } from "react";
import { Logo } from "@/components/Logo";
import { Countdown } from "@/components/Countdown";
import { useCinematics } from "@/lib/cinematics";

const HERO_IMG = "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1920&q=80";
const PLATE_IMG = "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?auto=format&fit=crop&w=1200&q=80";
const BANQUET_IMG = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80";

const DISCIPLINES = [
  { num: "01", name: "Cuisine", word: "matière",     body: "Deux îlots cuisine, chefs invités afro, gestes en direct.", img: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?auto=format&fit=crop&w=900&q=80" },
  { num: "02", name: "Culture", word: "mémoire",     body: "Conversations, manifestes, lectures, transmissions.",        img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80" },
  { num: "03", name: "Musique", word: "souffle",     body: "Set live, compositions inédites, voix de la diaspora.",       img: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?auto=format&fit=crop&w=900&q=80" },
  { num: "04", name: "Art",     word: "geste",       body: "Installations, performances, scénographie immersive.",        img: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80" },
  { num: "05", name: "Mode",    word: "silhouette",  body: "Black Cultural Elegance — défilé éclair, signatures.",        img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80" },
  { num: "06", name: "Cinéma",  word: "image",       body: "Captation cinéma 360°, première série gastronomique.",        img: "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?auto=format&fit=crop&w=900&q=80" },
  { num: "07", name: "Littérature", word: "verbe",   body: "Lecture, manifeste fondateur, archive vivante.",              img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80" },
];

export default function Home() {
  const rootRef = useRef(null);
  useCinematics(rootRef);

  return (
    <div ref={rootRef} data-testid="public-home" className="text-ivoire">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden snap-start">
        <img src={HERO_IMG} alt="" data-parallax className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-noir/30" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pb-16 md:pb-24 pt-32 w-full">
          <div className="max-w-3xl">
            <div className="label-eyebrow text-or mb-6 md:mb-8" data-reveal>Chapitre I · Samedi 12 Décembre 2026 · Paris</div>
            <h1 data-hero-title className="serif-display text-[clamp(2.6rem,9vw,7.5rem)] mb-6 md:mb-8">
              Cook &amp; Food Gala.
            </h1>
            <p className="text-base md:text-xl text-sable max-w-2xl leading-relaxed" data-reveal>
              Une expérience gastronomique &amp; culturelle immersive — Cuisine, Culture, Musique, Art, Mode, Cinéma &amp; Littérature.
              <span className="italic"> Plus qu'un événement, une empreinte culturelle.</span>
            </p>
            <div className="mt-8 md:mt-12 flex flex-wrap gap-3 md:gap-4" data-reveal>
              <Link to="/rsvp" data-testid="home-cta-rsvp" className="bg-or text-noir px-6 md:px-8 py-3 md:py-4 label-eyebrow hover:bg-ivoire transition-colors">
                Confirmer ma présence →
              </Link>
              <Link to="/billetterie" data-testid="home-cta-billet" className="border border-ivoire/40 px-6 md:px-8 py-3 md:py-4 label-eyebrow hover:border-or hover:text-or transition-colors">
                Billetterie publique
              </Link>
            </div>
            <div className="mt-12 md:mt-20 pt-6 md:pt-10 border-t border-ivoire/10" data-reveal>
              <Countdown />
            </div>
          </div>
        </div>
      </section>

      {/* PHRASE FONDATRICE */}
      <section className="py-20 md:py-24 px-6 lg:px-12 snap-start">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-end" data-reveal>
            <div className="lg:col-span-2"><Logo size={56} className="text-or" /></div>
            <div className="lg:col-span-9">
              <p className="label-eyebrow text-or mb-4 md:mb-6">Phrase fondatrice</p>
              <p className="serif-display text-3xl md:text-5xl lg:text-6xl leading-[1.05] italic">
                « Ce Gala fonde le standard culturel<br />de la diaspora afro mondiale. »
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 DISCIPLINES — horizontal premium */}
      <section className="py-20 md:py-24 px-6 lg:px-12 bg-noir border-t border-ivoire/10 snap-start">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-10 md:mb-16 flex-wrap gap-6" data-reveal>
            <div>
              <p className="label-eyebrow text-or mb-3 md:mb-4">Sept disciplines · une nuit</p>
              <h2 className="serif-display text-4xl md:text-6xl">L'arène double-produit.</h2>
            </div>
            <p className="text-sable max-w-md text-sm leading-relaxed">
              Scène circulaire, deux îlots cuisine, gradins panoramiques. La salle est un studio 360°. L'événement se vit, se filme, se diffuse.
            </p>
          </div>
          <div data-stagger className="flex md:overflow-x-auto md:snap-x md:snap-mandatory flex-col md:flex-row gap-px bg-ivoire/10 -mx-6 lg:-mx-12 px-6 lg:px-12 pb-4 scrollbar-hide">
            {DISCIPLINES.map((d) => (
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
          <p className="hidden md:block mt-4 label-eyebrow opacity-40">← Faire défiler latéralement →</p>
        </div>
      </section>

      {/* DOUBLE EDITORIAL */}
      <section className="py-20 md:py-24 px-6 lg:px-12 snap-start">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div data-reveal>
            <img src={PLATE_IMG} alt="" className="w-full h-[40vh] md:h-[60vh] object-cover" />
            <p className="label-eyebrow text-or mt-4 md:mt-6">I · Le Flux Gala</p>
            <p className="serif-display text-2xl md:text-3xl mt-2 leading-tight">L'expérience millimétrée pour 800–1000 convives.</p>
          </div>
          <div className="lg:mt-32" data-reveal>
            <img src={BANQUET_IMG} alt="" className="w-full h-[40vh] md:h-[60vh] object-cover" />
            <p className="label-eyebrow text-or mt-4 md:mt-6">II · Le Flux Série</p>
            <p className="serif-display text-2xl md:text-3xl mt-2 leading-tight">Une captation cinématographique multi-caméras, en temps réel.</p>
          </div>
        </div>
      </section>

      {/* ÉCOSYSTÈME */}
      <section className="py-20 px-6 lg:px-12 bg-noir border-t border-ivoire/10">
        <div className="max-w-[1400px] mx-auto text-center" data-reveal>
          <p className="label-eyebrow text-or mb-4">Écosystème</p>
          <p className="serif-display text-3xl md:text-5xl italic max-w-3xl mx-auto leading-tight">
            « Le Gala<br />présente l'écosystème. »
          </p>
          <p className="mt-6 md:mt-8 text-sable text-sm opacity-60 max-w-md mx-auto leading-relaxed">
            Cook &amp; Food Gala est l'un des chapitres d'une infrastructure culturelle plus large — qu'on dévoilera, pierre par pierre.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 md:py-32 px-6 lg:px-12 bg-noir border-t border-ivoire/10 snap-start">
        <div className="max-w-3xl mx-auto text-center" data-reveal>
          <p className="label-eyebrow text-or mb-4 md:mb-6">Invitation personnelle · non transférable</p>
          <h2 className="serif-display text-4xl md:text-7xl mb-6 md:mb-8">
            Soyez témoin<br /><span className="italic">d'un acte fondateur.</span>
          </h2>
          <p className="text-sable mb-8 md:mb-12 text-base md:text-lg">
            120 places VIP · 800 places publiques · une cérémonie, sept prix, une nuit.
          </p>
          <Link to="/rsvp" data-testid="home-final-cta" className="inline-block bg-or text-noir px-8 md:px-12 py-4 md:py-5 label-eyebrow hover:bg-ivoire transition-colors">
            Confirmer ma présence
          </Link>
        </div>
      </section>
    </div>
  );
}
