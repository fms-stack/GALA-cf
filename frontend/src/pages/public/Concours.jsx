import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function Concours() {
  const [data, setData] = useState({ vote_open: false, finalists: [] });
  const [choice, setChoice] = useState(null);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    api.get("/public/competition").then((r) => setData(r.data)).catch(() => {});
  }, []);

  const vote = async (e) => {
    e.preventDefault();
    if (!choice) return;
    setLoading(true);
    try {
      await api.post("/public/competition/vote", { chef_id: choice, email, honeypot });
      setVoted(true);
      toast.success(t("concours.vote_ok"));
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };

  return (
    <div data-testid="public-concours" className="min-h-screen text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto">
        <p className="label-eyebrow text-or mb-6">{t("concours.eyebrow")}</p>
        <h1 className="serif-display text-5xl lg:text-7xl mb-8">{t("concours.title")}</h1>
        <p className="text-sable max-w-2xl text-lg leading-relaxed mb-6">{t("concours.intro")}</p>
        <p className="label-eyebrow opacity-60 mb-16">{t("concours.criteria")}</p>

        <h2 className="serif-display text-3xl mb-8">{t("concours.finalists")}</h2>
        {data.finalists.length === 0 ? (
          <p className="text-sable mb-16" data-testid="concours-empty">{t("concours.empty")}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-ivoire/10 mb-12">
            {data.finalists.map((c) => {
              const selectable = data.vote_open && !voted;
              const selected = choice === c.id;
              return (
                <button key={c.id} type="button" disabled={!selectable} onClick={() => setChoice(c.id)}
                  data-testid={`finalist-${c.id}`}
                  className={`bg-noir text-left p-8 transition-colors ${selected ? "outline outline-1 outline-or" : ""} ${selectable ? "hover:bg-noir/40" : "cursor-default"}`}>
                  {c.photo_url && <img src={c.photo_url} alt={c.name} className="w-full aspect-[4/3] object-cover mb-6 opacity-90" />}
                  {c.origin && <div className="label-eyebrow text-or mb-2">{c.origin}</div>}
                  <div className="serif-display text-3xl mb-3">{c.name}</div>
                  {c.specialty && <div className="text-sm opacity-70 mb-3">{c.specialty}</div>}
                  {c.bio && <p className="text-sable text-sm leading-relaxed">{c.bio}</p>}
                  {selected && <div className="label-eyebrow text-or mt-6">{t("concours.chosen")}</div>}
                </button>
              );
            })}
          </div>
        )}

        {data.finalists.length > 0 && (
          voted ? (
            <p className="serif-display text-3xl text-or" data-testid="concours-voted">{t("concours.vote_ok")}</p>
          ) : data.vote_open ? (
            <form onSubmit={vote} className="max-w-md space-y-6" data-testid="concours-vote-form">
              <p className="text-sable">{t("concours.vote_open")}</p>
              <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />
              <div>
                <label className="label-eyebrow opacity-60 block mb-2">{t("common.email")}</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="concours-email"
                  className="w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-base text-ivoire" />
              </div>
              <button type="submit" disabled={loading || !choice} data-testid="concours-vote"
                className="w-full bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-50">
                {loading ? t("common.sending") : t("concours.vote")}
              </button>
            </form>
          ) : (
            <p className="text-sable" data-testid="concours-closed">{t("concours.vote_closed")}</p>
          )
        )}

        <Link to="/casting" className="inline-block mt-16 label-eyebrow text-or" data-testid="concours-apply">{t("concours.apply")}</Link>
      </div>
    </div>
  );
}
