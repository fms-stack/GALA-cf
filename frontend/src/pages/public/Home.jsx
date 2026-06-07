import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Countdown } from "@/components/Countdown";

const HERO_IMG = "https://images.pexels.com/photos/4997894/pexels-photo-4997894.jpeg";
const PLATE_IMG = "https://images.pexels.com/photos/2403392/pexels-photo-2403392.jpeg";
const BANQUET_IMG = "https://images.pexels.com/photos/29410669/pexels-photo-29410669.jpeg";

const DISCIPLINES = [
  { num: "01", name: "Cuisine", word: "matière" },
  { num: "02", name: "Culture", word: "mémoire" },
  { num: "03", name: "Musique", word: "souffle" },
  { num: "04", name: "Art", word: "geste" },
  { num: "05", name: "Mode", word: "silhouette" },
  { num: "06", name: "Cinéma", word: "image" },
  { num: "07", name: "Littérature", word: "verbe" },
];

export default function Home() {
  return (
    <div data-testid="public-home" className="text-ivoire">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden snap-start">
        <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-noir/30" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pb-24 pt-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="label-eyebrow text-or mb-8">Chapitre I · Samedi 12 Décembre 2026 · Paris</div>
            <h1 className="serif-display text-[clamp(3rem,9vw,7.5rem)] mb-8">
              Cook &amp; Food<br />
              <span className="italic opacity-90">Gala.</span>
            </h1>
            <p className="text-lg lg:text-xl text-sable max-w-2xl leading-relaxed">
              Une expérience gastronomique &amp; culturelle immersive — Cuisine, Culture, Musique, Art, Mode, Cinéma &amp; Littérature.
              <span className="italic"> Plus qu'un événement, une empreinte culturelle.</span>
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                to="/rsvp"
                data-testid="home-cta-rsvp"
                className="bg-or text-noir px-8 py-4 label-eyebrow hover:bg-ivoire transition-colors"
              >
                Confirmer ma présence →
              </Link>
              <Link
                to="/billetterie"
                data-testid="home-cta-billet"
                className="border border-ivoire/40 px-8 py-4 label-eyebrow hover:border-or hover:text-or transition-colors"
              >
                Billetterie publique
              </Link>
            </div>
            <div className="mt-20 pt-10 border-t border-ivoire/10">
              <Countdown />
            </div>
          </motion.div>
        </div>
      </section>

      {/* PHRASE FONDATRICE */}
      <section className="py-20 md:py-24 px-6 lg:px-12 snap-start">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-2">
              <Logo size={48} className="text-or" />
            </div>
            <div className="lg:col-span-9">
              <p className="label-eyebrow text-or mb-6">Phrase fondatrice</p>
              <p className="serif-display text-4xl lg:text-6xl leading-[1.05] italic">
                « Ce Gala fonde le standard culturel<br />
                de la diaspora afro mondiale. »
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 DISCIPLINES */}
      <section className="py-20 md:py-24 px-6 lg:px-12 bg-noir border-t border-ivoire/10 snap-start">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
            <div>
              <p className="label-eyebrow text-or mb-4">Sept disciplines · une nuit</p>
              <h2 className="serif-display text-5xl lg:text-6xl">L'arène double-produit.</h2>
            </div>
            <p className="text-sable max-w-md text-sm leading-relaxed">
              Scène circulaire, deux îlots cuisine, gradins panoramiques. La salle est un studio 360°.
              L'événement se vit, se filme, se diffuse — chapitre I d'une série en construction.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-ivoire/10">
            {DISCIPLINES.map((d) => (
              <div key={d.num} className="bg-noir p-8 hover:bg-noir/50 transition-colors group">
                <div className="label-eyebrow text-or mb-8">{d.num}</div>
                <div className="serif-display text-3xl mb-2">{d.name}</div>
                <div className="text-sable italic text-sm opacity-60 group-hover:opacity-100 transition-opacity">— {d.word}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOUBLE IMAGE EDITORIAL */}
      <section className="py-32 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <img src={PLATE_IMG} alt="" className="w-full h-[50vh] md:h-[60vh] object-cover" />
            <p className="label-eyebrow text-or mt-6">I · Le Flux Gala</p>
            <p className="serif-display text-3xl mt-2 leading-tight">
              L'expérience millimétrée pour 800–1000 convives.
            </p>
          </div>
          <div className="lg:mt-32">
            <img src={BANQUET_IMG} alt="" className="w-full h-[50vh] md:h-[60vh] object-cover" />
            <p className="label-eyebrow text-or mt-6">II · Le Flux Série</p>
            <p className="serif-display text-3xl mt-2 leading-tight">
              Une captation cinématographique multi-caméras, en temps réel.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-40 px-6 lg:px-12 bg-noir border-t border-ivoire/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="label-eyebrow text-or mb-6">Invitation personnelle · non transférable</p>
          <h2 className="serif-display text-5xl lg:text-7xl mb-8">
            Soyez témoin<br />
            <span className="italic">d'un acte fondateur.</span>
          </h2>
          <p className="text-sable mb-12 text-lg">
            120 places VIP · 800 places publiques · une cérémonie, sept prix, une nuit.
          </p>
          <Link
            to="/rsvp"
            data-testid="home-final-cta"
            className="inline-block bg-or text-noir px-12 py-5 label-eyebrow hover:bg-ivoire transition-colors"
          >
            Confirmer ma présence
          </Link>
        </div>
      </section>
    </div>
  );
}
