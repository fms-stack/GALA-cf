import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Prix() {
  const [prizes, setPrizes] = useState([]);

  useEffect(() => {
    api.get("/public/prizes").then((r) => setPrizes(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="public-prizes" className="text-ivoire min-h-screen px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">Cook &amp; Food Awards</p>
        <h1 className="serif-display text-5xl lg:text-7xl mb-6 max-w-4xl">
          Les sept prix CF-GAP.
        </h1>
        <p className="text-sable max-w-2xl text-lg leading-relaxed mb-20">
          Sept disciplines, sept consécrations. Une cérémonie pensée comme un acte de fondation —
          chaque prix marque l'installation d'un nouveau standard pour la diaspora caribéenne.
        </p>

        <div className="space-y-px bg-ivoire/10">
          {prizes.map((p, i) => (
            <div
              key={p.code}
              data-testid={`prize-${p.code}`}
              className="bg-noir grid grid-cols-12 gap-6 items-baseline px-6 py-10 hover:bg-noir/60 transition-colors"
            >
              <div className="col-span-12 md:col-span-2 label-eyebrow text-or">{p.code}</div>
              <div className="col-span-12 md:col-span-7 serif-display text-3xl lg:text-4xl">{p.title}</div>
              <div className="col-span-12 md:col-span-3 text-right text-sable text-sm italic">{p.discipline}</div>
            </div>
          ))}
        </div>

        <p className="mt-16 text-sable text-sm italic opacity-70 max-w-xl">
          * Nominations, jury et lauréats annoncés en novembre 2026. CIP (Cultural Impact Protocol) — standard en cours de dépôt.
        </p>
      </div>
    </div>
  );
}
