import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useCinematics } from "@/lib/cinematics";
import { X } from "@phosphor-icons/react";

export default function Prix() {
  const rootRef = useRef(null);
  const [prizes, setPrizes] = useState([]);
  const [active, setActive] = useState(null);
  useCinematics(rootRef);

  useEffect(() => {
    api.get("/public/prizes").then((r) => setPrizes(r.data)).catch(() => {});
  }, []);

  return (
    <div ref={rootRef} data-testid="public-prizes" className="text-ivoire min-h-screen px-6 lg:px-12 py-20 md:py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-4 md:mb-6" data-reveal>Cook &amp; Food Awards</p>
        <h1 data-hero-title className="serif-display text-4xl md:text-7xl mb-4 md:mb-6 max-w-4xl">
          Les sept prix CF-GAP.
        </h1>
        <p className="text-sable max-w-2xl text-base md:text-lg leading-relaxed mb-12 md:mb-20" data-reveal>
          Sept disciplines, sept consécrations. Une cérémonie pensée comme un acte de fondation —
          chaque prix marque l'installation d'un nouveau standard pour la diaspora afro mondiale.
        </p>

        {/* Editorial gallery — alternating large editorial blocks */}
        <div data-stagger className="grid md:grid-cols-2 gap-px bg-ivoire/10">
          {prizes.map((p, i) => (
            <button
              key={p.code}
              type="button"
              onClick={() => setActive(p)}
              data-testid={`prize-${p.code}`}
              data-stagger-item
              className="group relative bg-noir overflow-hidden text-left aspect-[4/5] md:aspect-[3/4]"
            >
              <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/80 to-noir/20" />
              <div className="relative h-full flex flex-col justify-end p-6 md:p-10">
                <div className="label-eyebrow text-or mb-3">{p.code}</div>
                <h3 className="serif-display text-2xl md:text-4xl leading-tight mb-3 group-hover:text-or transition-colors">{p.title}</h3>
                <p className="text-sable text-xs md:text-sm italic mb-4">{p.discipline}</p>
                <p className="text-ivoire/80 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">{p.intro}</p>
                <div className="label-eyebrow opacity-50 group-hover:opacity-100 group-hover:text-or transition-all">Découvrir →</div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-12 md:mt-16 text-sable text-sm italic opacity-70 max-w-xl" data-reveal>
          * Nominations, jury et lauréats annoncés en novembre 2026. CIP (Cultural Impact Protocol) — standard en cours de dépôt.
        </p>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] bg-noir/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
            onClick={() => setActive(null)}
            data-testid="prize-detail"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-noir border border-or/30"
            >
              <button
                onClick={() => setActive(null)}
                aria-label="Fermer"
                className="absolute top-4 right-4 z-10 p-2 text-ivoire hover:text-or"
                data-testid="prize-detail-close"
              >
                <X size={22} />
              </button>
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-auto">
                  <img src={active.image} alt={active.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-noir/40" />
                </div>
                <div className="p-8 md:p-12">
                  <div className="label-eyebrow text-or mb-4">{active.code}</div>
                  <h2 className="serif-display text-3xl md:text-5xl mb-3 leading-tight">{active.title}</h2>
                  <p className="text-sable italic text-sm mb-8 pb-6 border-b border-ivoire/10">{active.discipline}</p>
                  <p className="text-ivoire/90 text-lg italic mb-6 leading-relaxed">{active.intro}</p>
                  <p className="text-sable text-sm md:text-base leading-relaxed">{active.body}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
