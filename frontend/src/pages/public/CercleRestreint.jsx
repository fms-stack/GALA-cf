import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function CercleRestreint() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", sector: "",
    recommended_by: "", philanthropic_engagement: "", message: "", honeypot: "",
  });
  const [ref, setRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/cercle-restreint", form);
      setRef(data.ref);
      toast.success("Demande transmise.");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };

  if (ref) return (
    <div data-testid="cercle-success" className="min-h-[70vh] bg-noir text-ivoire flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        <p className="label-eyebrow text-or mb-6">Demande reçue</p>
        <h1 className="serif-display text-5xl mb-6">Merci.</h1>
        <p className="text-sable">Référence confidentielle <span className="text-or">#{ref}</span>. La direction reviendra vers vous personnellement.</p>
        <p className="mt-10 text-xs italic opacity-60">+596 696 78 89 86 — WhatsApp dédié au Cercle</p>
      </div>
    </div>
  );

  return (
    <div data-testid="cercle-restreint" className="min-h-screen bg-noir text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-2xl mx-auto">
        <p className="label-eyebrow text-or mb-6">Pré-qualification confidentielle</p>
        <h1 className="serif-display text-5xl md:text-6xl mb-6">Rejoindre le Cercle.</h1>
        <p className="text-sable text-base md:text-lg leading-relaxed mb-12">
          Le Cercle restreint accueille 120 hôtes au Chapter I. Aucun ticket n'est en vente.
          Cette demande sera examinée personnellement par la direction. Aucune réponse automatique.
        </p>
        <form onSubmit={submit} className="space-y-6">
          <input type="text" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} />
          <F l="Nom complet *"><input required value={form.full_name} onChange={onChange("full_name")} className={inp} /></F>
          <F l="E-mail (confidentiel) *"><input required type="email" value={form.email} onChange={onChange("email")} className={inp} /></F>
          <F l="Téléphone direct"><input value={form.phone} onChange={onChange("phone")} className={inp} /></F>
          <F l="Secteur / Activité *"><input required value={form.sector} onChange={onChange("sector")} className={inp} placeholder="Finance · Tech · Culture · Industrie…" /></F>
          <F l="Coopté par (nom d'un membre existant)"><input value={form.recommended_by} onChange={onChange("recommended_by")} className={inp} placeholder="(facultatif)" /></F>
          <F l="Engagement philanthropique"><textarea rows={3} value={form.philanthropic_engagement} onChange={onChange("philanthropic_engagement")} className={`${inp} resize-none`} placeholder="Fondations, mécénat, causes soutenues…" /></F>
          <F l="Message"><textarea rows={3} value={form.message} onChange={onChange("message")} className={`${inp} resize-none`} /></F>
          <button type="submit" disabled={loading} data-testid="cercle-submit" className="w-full bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60">{loading ? "Envoi…" : "Soumettre ma demande →"}</button>
          <p className="text-xs italic opacity-50 text-center">Examen sous 7 jours · message signé Cook &amp; Food Gala by Factory Maker Studio &amp; CVLN Group</p>
        </form>
      </div>
    </div>
  );
}

const inp = "w-full bg-transparent border-b border-sable/30 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 transition-colors";
function F({ l, children }) { return (<div><label className="label-eyebrow opacity-60 block mb-2">{l}</label>{children}</div>); }
