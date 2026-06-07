import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function FoundersCircle() {
  const [members, setMembers] = useState([]);
  useEffect(() => { api.get("/public/founders-circle").then((r) => setMembers(r.data)).catch(() => {}); }, []);

  return (
    <div data-testid="founders-circle" className="min-h-screen bg-noir text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">Founders' Circle</p>
        <h1 className="serif-display text-5xl md:text-7xl mb-6 max-w-3xl">
          Les hôtes<br/><span className="italic">du Chapter I.</span>
        </h1>
        <p className="text-sable max-w-2xl text-base md:text-lg leading-relaxed mb-20">
          Le Cercle se constitue par cooptation. Chaque hôte ouvre une nouvelle porte. Les noms apparaissent ici progressivement, par décision du Cercle.
        </p>

        {members.length === 0 ? (
          <div className="border border-or/20 p-12 text-center max-w-2xl mx-auto">
            <p className="label-eyebrow text-or mb-6">En construction</p>
            <p className="serif-display text-3xl italic mb-6">Les premiers noms<br/>seront révélés en septembre 2026.</p>
            <p className="text-sable text-sm opacity-70">Pour proposer un hôte, contactez Laurent directement — circle@cookandfood.gala</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-ivoire/10">
            {members.map((m, i) => (
              <div key={i} className="bg-noir p-10">
                <div className="label-eyebrow text-or mb-4">{m.kind || "Hôte"}</div>
                <div className="serif-display text-3xl mb-3">{m.name}</div>
                <p className="text-sable text-sm italic mb-4">{m.title}</p>
                <p className="text-ivoire/80 text-sm leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 pt-12 border-t border-ivoire/10 max-w-2xl">
          <p className="label-eyebrow text-or mb-4">Conseil dédié</p>
          <p className="serif-display text-2xl mb-2">+596 696 78 89 86</p>
          <p className="text-sable text-sm italic opacity-70">WhatsApp Business · circle@cookandfood.gala · réponse sous 24h</p>
        </div>
      </div>
    </div>
  );
}
