import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export default function MagicLink() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState(null);

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      api.post("/auth/magic-link/verify", { token })
        .then(({ data }) => { setUser(data); navigate("/admin"); })
        .catch((err) => toast.error(formatApiError(err.response?.data?.detail)));
    }
  }, [params, navigate, setUser]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/magic-link/request", { email });
      setSent(true);
      if (data.dev_link) setDevLink(data.dev_link);
      toast.success("Si l'adresse est reconnue, un lien a été envoyé.");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivoire text-noir flex items-center justify-center px-6" data-testid="magic-link-page">
      <div className="w-full max-w-sm">
        <Logo size={48} className="mb-8" />
        <p className="label-eyebrow text-brun mb-4">Portail nommé</p>
        <h1 className="serif-display text-4xl mb-2">Lien magique.</h1>
        <p className="text-sm opacity-60 mb-8">Recevez un lien de connexion à usage unique par e-mail.</p>

        {sent ? (
          <div className="border border-sable p-6">
            <p className="text-sm">Vérifiez votre boîte de réception. Le lien expire dans 20 minutes.</p>
            {devLink && (
              <div className="mt-4 text-xs">
                <p className="label-eyebrow opacity-60 mb-1">Lien dev (mock)</p>
                <a href={devLink} className="text-brun underline break-all" data-testid="magic-link-dev">{devLink}</a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label-eyebrow opacity-60 block mb-2">E-mail</label>
              <input
                required
                type="email"
                data-testid="magic-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-sable bg-white/40 focus:border-noir outline-none py-3 px-4"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              data-testid="magic-submit"
              className="w-full bg-noir text-ivoire py-4 label-eyebrow hover:bg-brun transition-colors disabled:opacity-60"
            >
              {loading ? "Envoi…" : "Recevoir mon lien →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
