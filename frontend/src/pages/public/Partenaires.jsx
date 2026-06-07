const PARTNERS = [
  {
    name: "CVLN Holding",
    role: "IP Owner · Governance",
    body: "Conglomérat culturel afro, propriétaire IP du Gala — le Gala présente l'écosystème.",
  },
  {
    name: "Factory Maker Studio",
    role: "Executive Producer · Direction artistique",
    body: "Production exécutive, direction artistique, première diffusion TC'V.",
  },
  {
    name: "CVL Culinary Innovations",
    role: "CIP · Standard culinaire",
    body: "Norme silencieuse, première cérémonie CIP — acte fondateur d'un standard international.",
  },
];

export default function Partenaires() {
  return (
    <div data-testid="public-partners" className="text-ivoire min-h-screen px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">Écosystème</p>
        <h1 className="serif-display text-5xl lg:text-7xl mb-20 max-w-4xl">
          Trois piliers, un standard.
        </h1>
        <div className="grid lg:grid-cols-3 gap-px bg-ivoire/10">
          {PARTNERS.map((p) => (
            <div key={p.name} className="bg-noir p-10 lg:p-14">
              <div className="border border-ivoire/30 w-20 h-20 flex items-center justify-center mb-8">
                <div className="serif-display text-3xl text-or">{p.name.charAt(0)}</div>
              </div>
              <div className="serif-display text-3xl mb-2">{p.name}</div>
              <div className="label-eyebrow text-or mb-6">{p.role}</div>
              <p className="text-sable text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-24 max-w-3xl">
          <p className="label-eyebrow text-or mb-4">Partenaires institutionnels cibles</p>
          <p className="text-sable text-base leading-relaxed">
            Martinique Tourisme · OIF · UNESCO (SHS) · Ministère de la Culture · CARICOM / CARIFESTA · RESCA · Marché Afro-Caribéen Paris.
          </p>
        </div>
      </div>
    </div>
  );
}
