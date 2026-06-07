import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Connexion réussie.");
      navigate("/admin");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivoire text-noir flex" data-testid="admin-login">
      <div className="hidden lg:flex w-1/2 bg-noir text-ivoire items-center justify-center relative grain">
        <div className="text-center">
          <Logo size={72} />
          <div className="serif-display text-5xl mt-8">Gala OS</div>
          <div className="label-eyebrow opacity-60 mt-3">CVLN · Back-office</div>
          <p className="mt-12 max-w-xs mx-auto text-sable text-sm italic">
            « Ce Gala fonde le standard culturel de la diaspora caribéenne. »
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <p className="label-eyebrow text-brun mb-4">Accès équipe</p>
          <h1 className="serif-display text-4xl mb-2">Connexion.</h1>
          <p className="text-sm opacity-60 mb-10">Réservé aux équipes CVLN / Factory Maker Studio.</p>

          <form onSubmit={onSubmit} className="space-y-5" data-testid="login-form">
            <div>
              <label className="label-eyebrow opacity-60 block mb-2">E-mail</label>
              <input
                required
                type="email"
                data-testid="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-sable bg-white/40 focus:border-noir outline-none py-3 px-4"
              />
            </div>
            <div>
              <label className="label-eyebrow opacity-60 block mb-2">Mot de passe</label>
              <input
                required
                type="password"
                data-testid="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-sable bg-white/40 focus:border-noir outline-none py-3 px-4"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full bg-noir text-ivoire py-4 label-eyebrow hover:bg-brun transition-colors disabled:opacity-60 mt-4"
            >
              {loading ? "Connexion…" : "Se connecter →"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-sable">
            <p className="text-xs opacity-60 mb-3">Nommé sans mot de passe ?</p>
            <Link to="/portail" data-testid="login-magic-link" className="label-eyebrow text-brun hover:text-noir">
              Recevoir un lien magique →
            </Link>
          </div>
          <Link to="/" className="mt-8 inline-block text-xs opacity-50 hover:opacity-100">← Retour au site public</Link>
        </div>
      </div>
    </div>
  );
}
