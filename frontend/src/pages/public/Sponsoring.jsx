import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const TIERS = [
  { id: "titre", label: "Sponsor Titre", body: "Luxe · Spirits · Agro Premium · Catégorie unique", img: "https://images.unsplash.com/photo-1734771771447-d943e2b5f4d5?auto=format&fit=crop&w=900&q=80", price: "Catégorie unique · sur dossier", perks: ["Naming droit Chapter I", "Cocktail nominatif privé", "5 places VIP + table d'honneur", "Mention TC'V broadcast"] },
  { id: "or",    label: "Sponsor Or",     body: "Technologie · Fintech · Médias", img: "https://images.unsplash.com/photo-1670229712389-cbd53e848bbe?auto=format&fit=crop&w=900&q=80", price: "Sur dossier", perks: ["Visibilité scénographie", "3 places VIP", "Présence digitale", "Logo broadcast"] },
  { id: "argent",label: "Sponsor Argent", body: "Hôtellerie · Tourisme · Mode",   img: "https://images.unsplash.com/photo-1570000569749-3a9f0c46d70c?auto=format&fit=crop&w=900&q=80", price: "Sur dossier", perks: ["Présence digitale", "2 places VIP", "Mention dans dossier presse"] },
  { id: "partenaire", label: "Partenaire", body: "Presse · Culture · Institutions", img: "https://images.unsplash.com/photo-1663530761401-15eefb544889?auto=format&fit=crop&w=900&q=80", price: "Échange de visibilité", perks: ["Logo cfceremony.com", "2 places gradins", "Accès networking"] },
];

export default function Sponsoring() {
  const [form, setForm] = useState({ company_name: "", contact_name: "", email: "", phone: "", tier_interest: "or", sector: "", message: "", honeypot: "" });
  const [ref, setRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/sponsoring", form);
      setRef(data.ref);
      toast.success("Demande transmise.");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };

  if (ref) return (
    <div data-testid="public-sponsoring-success" className="min-h-[70vh] text-ivoire flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        <p className="label-eyebrow text-or mb-6">Demande reçue</p>
        <h1 className="serif-display text-5xl mb-6">Merci.</h1>
        <p className="text-sable">Référence <span className="text-or">#{ref}</span>. La direction sponsoring vous contacte sous 48h ouvrées.</p>
      </div>
    </div>
  );

  return (
    <div data-testid="public-sponsoring" className="min-h-screen text-ivoire">
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <img src="https://images.unsplash.com/photo-1734771771447-d943e2b5f4d5?auto=format&fit=crop&w=1920&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-noir/40" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pb-12 pt-24 w-full">
          <p className="label-eyebrow text-or mb-4">Devenir partenaire</p>
          <h1 className="serif-display text-4xl md:text-7xl mb-6 max-w-3xl">
            Inscrire votre marque<br /><span className="italic">dans la fondation.</span>
          </h1>
          <p className="text-sable max-w-2xl text-base md:text-lg leading-relaxed">
            Cook &amp; Food Gala — Chapter I s'adresse à 800–1000 convives, dont 120 VIP. Audience digitale &amp; broadcast TC'V à venir.
            Le partenariat ouvre l'accès à un capital culturel sans équivalent.
          </p>
        </div>
      </section>
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-ivoire/10 mb-16">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setForm({ ...form, tier_interest: t.id })}
              data-testid={`sponsor-tier-${t.id}`}
              className={`relative bg-noir text-left aspect-[3/4] overflow-hidden group transition-all ${form.tier_interest === t.id ? "outline outline-1 outline-or" : ""}`}
            >
              <img src={t.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/80 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-7">
                <div className="label-eyebrow text-or mb-4">{t.label}</div>
                <p className="text-sable text-sm mb-4">{t.body}</p>
                <ul className="space-y-1 mb-3">
                  {t.perks.map((p, i) => <li key={i} className="text-ivoire/80 text-xs">— {p}</li>)}
                </ul>
                <div className="label-eyebrow opacity-50 mt-2 pt-3 border-t border-ivoire/10">{t.price}</div>
              </div>
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-6 max-w-3xl">
          <input type="text" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} />
          <Field label="Société *"><input required value={form.company_name} onChange={onChange("company_name")} className={inp} data-testid="spon-company" /></Field>
          <Field label="Nom du contact *"><input required value={form.contact_name} onChange={onChange("contact_name")} className={inp} data-testid="spon-contact" /></Field>
          <Field label="E-mail *"><input required type="email" value={form.email} onChange={onChange("email")} className={inp} data-testid="spon-email" /></Field>
          <Field label="Téléphone"><input value={form.phone} onChange={onChange("phone")} className={inp} /></Field>
          <Field label="Secteur"><input value={form.sector} onChange={onChange("sector")} className={inp} /></Field>
          <Field label="Tier souhaité"><div className="py-3 capitalize text-or">{form.tier_interest}</div></Field>
          <div className="md:col-span-2"><Field label="Message *"><textarea required rows={4} value={form.message} onChange={onChange("message")} className={`${inp} resize-none`} data-testid="spon-msg" /></Field></div>
          <button type="submit" disabled={loading} data-testid="spon-submit" className="md:col-span-2 bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60">{loading ? "Envoi…" : "Envoyer ma demande →"}</button>
        </form>
      </section>
    </div>
  );
}

const inp = "w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 transition-colors";
function Field({ label, children }) { return (<div><label className="label-eyebrow opacity-60 block mb-2">{label}</label>{children}</div>); }
