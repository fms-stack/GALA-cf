import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function RSVP() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", seats: 1, message: "", honeypot: "" });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/rsvp", { ...form, seats: Number(form.seats) });
      setConfirmed(data.ref);
      toast.success("Votre demande a été enregistrée.");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div data-testid="public-rsvp-success" className="min-h-[80vh] text-ivoire flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <p className="label-eyebrow text-or mb-6">Demande reçue</p>
          <h1 className="serif-display text-5xl mb-6">Merci.</h1>
          <p className="text-sable mb-8 leading-relaxed">
            Votre demande de présence a été enregistrée sous la référence <span className="text-or font-medium">#{confirmed}</span>.
            L'équipe protocole reviendra vers vous personnellement.
          </p>
          <p className="text-sable text-sm italic opacity-70">Invitation personnelle · non transférable.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="public-rsvp" className="min-h-screen text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20">
        <div>
          <p className="label-eyebrow text-or mb-6">RSVP · Digital</p>
          <h1 className="serif-display text-5xl lg:text-7xl mb-8">
            Confirmer<br />
            <span className="italic">ma présence.</span>
          </h1>
          <p className="text-sable text-lg leading-relaxed mb-8 max-w-md">
            Samedi 12 décembre 2026 · 19h00 · Paris.<br />
            Dress code : <span className="italic">Black Cultural Elegance</span>.
          </p>
          <p className="text-sable text-sm italic opacity-70 max-w-md">
            Vos coordonnées sont enregistrées de manière strictement confidentielle. Aucun nom n'est exposé publiquement.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6" data-testid="rsvp-form">
          <input type="text" name="hp" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />

          <div>
            <label className="label-eyebrow opacity-60 block mb-2">Nom &amp; Prénom *</label>
            <input
              required
              data-testid="rsvp-name"
              value={form.full_name}
              onChange={onChange("full_name")}
              className="w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-lg text-ivoire placeholder:text-sable/30 transition-colors"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label className="label-eyebrow opacity-60 block mb-2">E-mail *</label>
            <input
              required
              type="email"
              data-testid="rsvp-email"
              value={form.email}
              onChange={onChange("email")}
              className="w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-lg text-ivoire placeholder:text-sable/30 transition-colors"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="label-eyebrow opacity-60 block mb-2">Téléphone</label>
            <input
              type="tel"
              data-testid="rsvp-phone"
              value={form.phone}
              onChange={onChange("phone")}
              className="w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-lg text-ivoire placeholder:text-sable/30 transition-colors"
              placeholder="+596 …"
            />
          </div>

          <div>
            <label className="label-eyebrow opacity-60 block mb-2">Nombre de places</label>
            <input
              type="number"
              min={1}
              max={10}
              data-testid="rsvp-seats"
              value={form.seats}
              onChange={onChange("seats")}
              className="w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-lg text-ivoire transition-colors"
            />
          </div>

          <div>
            <label className="label-eyebrow opacity-60 block mb-2">Message</label>
            <textarea
              rows={3}
              data-testid="rsvp-message"
              value={form.message}
              onChange={onChange("message")}
              className="w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 resize-none transition-colors"
              placeholder="(optionnel)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="rsvp-submit"
            className="w-full bg-or text-noir py-5 label-eyebrow mt-8 hover:bg-ivoire transition-colors disabled:opacity-60"
          >
            {loading ? "Envoi…" : "Confirmer ma présence →"}
          </button>
          <p className="text-xs text-sable/60 text-center italic">Invitation personnelle · non transférable</p>
        </form>
      </div>
    </div>
  );
}
