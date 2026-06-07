import { Link } from "react-router-dom";
import { useState } from "react";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function SurInvitation() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post("/public/cercle-restreint", {
        full_name: "Manifestation d'intérêt", email,
        sector: "—", message: "Demande de signal depuis /sur-invitation",
        honeypot: "",
      });
      setSent(true);
    } catch { setSent(true); /* always confirm to avoid email enumeration */ }
  };

  return (
    <div data-testid="sur-invitation" className="min-h-[88vh] bg-noir text-ivoire flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <Logo size={56} className="mx-auto mb-12 opacity-70" />
        <p className="label-eyebrow text-or mb-8">Cercle restreint</p>
        <h1 className="serif-display text-5xl md:text-7xl mb-10 leading-tight">
          120 sièges à la table.
        </h1>
        <p className="text-sable text-lg md:text-xl max-w-lg mx-auto leading-relaxed mb-16 italic">
          Les invitations partent en septembre 2026.<br />
          Sur cooptation uniquement.
        </p>

        {sent ? (
          <p className="label-eyebrow text-or" data-testid="signal-confirmed">Signal reçu. La direction reviendra vers vous.</p>
        ) : (
          <form onSubmit={submit} className="max-w-sm mx-auto">
            <p className="label-eyebrow opacity-50 mb-4">Manifester son intérêt — confidentiel</p>
            <div className="flex gap-0 border-b border-or/40 focus-within:border-or transition-colors">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@discret.com"
                data-testid="signal-email"
                className="flex-1 bg-transparent outline-none py-3 text-base text-ivoire placeholder:text-sable/30"
              />
              <button type="submit" data-testid="signal-submit" className="text-or hover:text-ivoire transition-colors label-eyebrow px-3">→</button>
            </div>
            <p className="mt-8 text-xs opacity-40 italic">Aucun nom n'est exposé. Aucun montant n'est demandé.</p>
          </form>
        )}

        <Link to="/" className="mt-20 inline-block label-eyebrow opacity-30 hover:opacity-100 transition-opacity">↩ Retour</Link>
      </div>
    </div>
  );
}
