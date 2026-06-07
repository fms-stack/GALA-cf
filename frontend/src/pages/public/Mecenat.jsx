import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const SUGGESTIONS = [5000, 25000, 100000, 500000];

export default function Mecenat() {
  const [form, setForm] = useState({ full_name: "", email: "", organisation: "", amount_eur: 5000, purpose: "general", honeypot: "" });
  const [loading, setLoading] = useState(false);
  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/mecenat", { ...form, amount_eur: Number(form.amount_eur) });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
      setLoading(false);
    }
  };

  return (
    <div data-testid="mecenat" className="min-h-screen bg-noir text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20">
        <div>
          <p className="label-eyebrow text-or mb-6">Mécénat</p>
          <h1 className="serif-display text-5xl md:text-7xl mb-6">Soutenir<br/><span className="italic">la fondation.</span></h1>
          <p className="text-sable text-base md:text-lg leading-relaxed mb-8">
            Le Cook &amp; Food Gala finance les 7 Prix CF-GAP, la captation TC'V, le programme Bible et l'infrastructure culturelle long-terme. Chaque don soutient un standard naissant.
          </p>
          <div className="space-y-6 mt-12 pt-12 border-t border-ivoire/10">
            <div>
              <p className="label-eyebrow text-or mb-2">Cadre fiscal</p>
              <p className="text-sable text-sm leading-relaxed">Reçu fiscal délivré sur demande. Dons éligibles aux dispositifs prévus par les articles 200 et 238 bis du CGI dans le cadre de notre structure d'accueil partenaire reconnue d'utilité publique.</p>
            </div>
            <div>
              <p className="label-eyebrow text-or mb-2">Conseil dédié</p>
              <p className="serif-display text-xl">+596 696 78 89 86</p>
              <p className="text-sable text-xs italic opacity-70">mecenat@cookandfood.gala — réponse 24h</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <input type="text" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} />
          <div>
            <label className="label-eyebrow opacity-60 block mb-3">Montant suggéré</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, amount_eur: s })}
                  data-testid={`mecenat-amount-${s}`}
                  className={`py-3 label-eyebrow border transition-colors ${Number(form.amount_eur) === s ? "border-or text-or bg-or/10" : "border-ivoire/20 text-ivoire/60 hover:border-or/60"}`}>
                  {s.toLocaleString("fr-FR")} €
                </button>
              ))}
            </div>
            <input type="number" min={500} value={form.amount_eur} onChange={onChange("amount_eur")} className={inp} placeholder="Ou saisir un montant…" data-testid="mecenat-custom-amount" />
          </div>
          <F l="Affectation"><select value={form.purpose} onChange={onChange("purpose")} className={inp}>
            <option value="general">Soutien général</option>
            <option value="prizes">Dotation des 7 Prix CF-GAP</option>
            <option value="casting">Casting jeunes talents</option>
            <option value="series">Production série TC'V</option>
            <option value="bible">Programme Bible &amp; archive</option>
          </select></F>
          <F l="Nom *"><input required value={form.full_name} onChange={onChange("full_name")} className={inp} data-testid="mecenat-name" /></F>
          <F l="E-mail *"><input required type="email" value={form.email} onChange={onChange("email")} className={inp} data-testid="mecenat-email" /></F>
          <F l="Organisation (facultatif)"><input value={form.organisation} onChange={onChange("organisation")} className={inp} /></F>
          <button type="submit" disabled={loading} data-testid="mecenat-submit" className="w-full bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60">{loading ? "Stripe…" : "Verser mon don →"}</button>
          <mention className="text-xs italic opacity-50 text-center block">Paiement Stripe sécurisé · reçu fiscal sous 7 jours</mention>
        </form>
      </div>
    </div>
  );
}

export function MecenatSuccess() {
  const [params] = useSearchParams();
  return (
    <div className="min-h-[70vh] bg-noir text-ivoire flex items-center justify-center px-6 py-24" data-testid="mecenat-success">
      <div className="text-center max-w-lg">
        <p className="label-eyebrow text-or mb-6">Don confirmé</p>
        <h1 className="serif-display text-5xl mb-6">Merci infiniment.</h1>
        <p className="text-sable">Votre engagement nourrit la fondation. Un reçu et un message signé <em>Cook &amp; Food Gala by Factory Maker Studio &amp; CVLN Group</em> vous parviennent.</p>
      </div>
    </div>
  );
}

const inp = "w-full bg-transparent border-b border-sable/30 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 transition-colors";
function F({ l, children }) { return (<div><label className="label-eyebrow opacity-60 block mb-2">{l}</label>{children}</div>); }
