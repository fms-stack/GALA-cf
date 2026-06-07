import { motion } from "framer-motion";

const POLES = [
  { num: "I", title: "Vision & ADN", body: "Acte de fondation. Premier standard gastronomique culturel pour la diaspora caribéenne contemporaine." },
  { num: "II", title: "Arène Studio 360°", body: "Décor pensé pour caméras et convives. Architecture double-produit : Gala live + Série TC'V." },
  { num: "III", title: "Plan de scène", body: "Scène centrale circulaire, deux îlots cuisine, 120 places VIP en arc, gradins, zones latérales, régie TC'V." },
  { num: "IV", title: "Run of Show", body: "18h30 ouverture publique → 22h00 cérémonie awards → 00h00 networking stratégique. Millimétré." },
  { num: "V", title: "Sept Pôles", body: "Direction · Artistique · Casting · Technique · Série · DataTech · Communication. 25 postes confirmés." },
  { num: "VI", title: "Trajectoire", body: "Chapter I (2026) · Chapter II (2027) · Chapter III (2028) — IPO trajectory." },
];

export default function Concept() {
  return (
    <div data-testid="public-concept" className="text-ivoire min-h-screen px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">Concept &amp; ADN</p>
        <h1 className="serif-display text-5xl lg:text-7xl mb-16 max-w-4xl">
          Cuisine, culture, image —<br />
          <span className="italic">une seule nuit.</span>
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-ivoire/10 mt-24">
          {POLES.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-noir p-10"
            >
              <div className="serif-display text-6xl text-or mb-4">{p.num}</div>
              <div className="serif-display text-2xl mb-4">{p.title}</div>
              <p className="text-sable text-sm leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
