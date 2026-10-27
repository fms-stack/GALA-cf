import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const STATUSES = [
  ["candidat", "Candidat"], ["qualifie", "Qualifié"], ["finaliste", "Finaliste"], ["laureat", "Lauréat"], ["elimine", "Éliminé"],
];
const CRITERIA = [["gout", "Goût"], ["technique", "Technique"], ["creativite", "Créativité"], ["recit", "Récit"]];
const ROUNDS = [["qualifications", "Qualifications"], ["finale", "Finale"]];
const EMPTY_CHEF = { name: "", origin: "", specialty: "", bio: "", photo_url: "", email: "", status: "candidat", image_release: "aucune" };
const RELEASES = [["aucune", "Non envoyée"], ["envoyee", "Envoyée"], ["signee", "Signée"]];
const EMPTY_SCORE = { gout: "", technique: "", creativite: "", recit: "" };

const inp = "border border-sable bg-white/60 px-3 py-2 text-sm";
const btn = "label-eyebrow border border-noir px-4 py-2 hover:bg-noir hover:text-ivoire disabled:opacity-30";

export default function Concours() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [tab, setTab] = useState("chefs");
  const [chefs, setChefs] = useState([]);
  const [jurors, setJurors] = useState([]);
  const [settings, setSettings] = useState({ vote_open: false });
  const [stage, setStage] = useState("qualifications");
  const [board, setBoard] = useState(null);
  const [chefForm, setChefForm] = useState(EMPTY_CHEF);
  const [jurorForm, setJurorForm] = useState({ name: "", role: "" });
  const [sel, setSel] = useState({ juror_id: "", chef_id: "" });
  const [score, setScore] = useState(EMPTY_SCORE);

  const load = () => {
    api.get("/competition/chefs").then((r) => setChefs(r.data)).catch(() => {});
    api.get("/competition/jurors").then((r) => setJurors(r.data)).catch(() => {});
    api.get("/competition/settings").then((r) => setSettings(r.data)).catch(() => {});
  };
  const loadBoard = () => api.get(`/competition/leaderboard?round=${stage}`).then((r) => setBoard(r.data)).catch(() => {});
  useEffect(load, []);
  useEffect(() => { loadBoard(); }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const call = async (fn, ok) => {
    try { await fn(); if (ok) toast.success(ok); load(); loadBoard(); return true; }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); return false; }
  };

  const addChef = async (e) => {
    e.preventDefault();
    if (await call(() => api.post("/competition/chefs", chefForm), "Chef ajouté")) setChefForm(EMPTY_CHEF);
  };
  const patchChef = (c, patch, msg) => call(() => api.put(`/competition/chefs/${c.id}`, { ...EMPTY_CHEF, ...c, ...patch }), msg);
  const setStatus = (c, status) => patchChef(c, { status }, `${c.name} · ${status}`);
  const setRelease = (c, image_release) => patchChef(c, { image_release }, `${c.name} · autorisation ${image_release}`);
  const removeChef = (c) => window.confirm(`Supprimer ${c.name} et ses notes ?`) && call(() => api.delete(`/competition/chefs/${c.id}`), "Chef supprimé");
  const addJuror = async (e) => {
    e.preventDefault();
    if (await call(() => api.post("/competition/jurors", jurorForm), "Juré ajouté")) setJurorForm({ name: "", role: "" });
  };
  const removeJuror = (j) => window.confirm(`Retirer ${j.name} et ses notes ?`) && call(() => api.delete(`/competition/jurors/${j.id}`), "Juré retiré");
  const saveScore = async (e) => {
    e.preventDefault();
    const body = { ...sel, round: stage, ...Object.fromEntries(CRITERIA.map(([k]) => [k, Number(score[k])])) };
    if (await call(() => api.put("/competition/scores", body), "Note enregistrée")) setScore(EMPTY_SCORE);
  };
  const toggleVote = () => call(() => api.put("/competition/settings", { vote_open: !settings.vote_open }),
    settings.vote_open ? "Vote du public fermé" : "Vote du public ouvert");

  const TABS = [["chefs", `Chefs (${chefs.length})`], ["jury", `Jury (${jurors.length})`], ["notation", "Notation"], ["classement", "Classement"]];

  return (
    <div className="p-5 md:p-10" data-testid="admin-concours">
      <div className="mb-8">
        <p className="label-eyebrow opacity-60">Concours · Héritage & Création</p>
        <h1 className="serif-display text-5xl mt-2">Le duel des chefs.</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-sable">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} data-testid={`concours-tab-${k}`}
            className={`px-4 py-3 label-eyebrow border-b-2 ${tab === k ? "border-noir" : "border-transparent opacity-60 hover:opacity-100"}`}>{label}</button>
        ))}
      </div>

      {tab === "chefs" && (
        <>
          <form onSubmit={addChef} className="grid md:grid-cols-3 gap-3 mb-8" data-testid="chef-form">
            <input required placeholder="Nom *" value={chefForm.name} onChange={(e) => setChefForm({ ...chefForm, name: e.target.value })} className={inp} />
            <input placeholder="Territoire / pays" value={chefForm.origin} onChange={(e) => setChefForm({ ...chefForm, origin: e.target.value })} className={inp} />
            <input placeholder="Spécialité" value={chefForm.specialty} onChange={(e) => setChefForm({ ...chefForm, specialty: e.target.value })} className={inp} />
            <input type="email" placeholder="E-mail (interne)" value={chefForm.email} onChange={(e) => setChefForm({ ...chefForm, email: e.target.value })} className={inp} />
            <input placeholder="URL photo" value={chefForm.photo_url} onChange={(e) => setChefForm({ ...chefForm, photo_url: e.target.value })} className={inp} />
            <select value={chefForm.status} onChange={(e) => setChefForm({ ...chefForm, status: e.target.value })} className={inp}>
              {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <textarea placeholder="Biographie (visible publiquement pour les finalistes)" rows={2} value={chefForm.bio} onChange={(e) => setChefForm({ ...chefForm, bio: e.target.value })} className={`${inp} md:col-span-2`} />
            <button type="submit" className={btn}>Ajouter le chef</button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border border-sable bg-white/40" data-testid="table-chefs">
            <thead><tr className="border-b border-sable label-eyebrow opacity-60 text-left">
              <th className="py-3 px-4">Chef</th><th className="py-3 px-4">Territoire</th><th className="py-3 px-4">Spécialité</th><th className="py-3 px-4">Statut</th><th className="py-3 px-4">Droit à l'image</th>{isAdmin && <th />}
            </tr></thead>
            <tbody>
              {chefs.map((c) => (
                <tr key={c.id} className="border-b border-sable/40">
                  <td className="py-3 px-4 text-sm">{c.name}</td>
                  <td className="py-3 px-4 text-sm">{c.origin || "·"}</td>
                  <td className="py-3 px-4 text-sm">{c.specialty || "·"}</td>
                  <td className="py-3 px-4 text-sm">
                    <select value={c.status} onChange={(e) => setStatus(c, e.target.value)} className={inp} data-testid={`chef-status-${c.id}`}>
                      {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <select value={c.image_release || "aucune"} onChange={(e) => setRelease(c, e.target.value)} data-testid={`chef-release-${c.id}`}
                      className={`${inp} ${c.image_release === "signee" ? "" : "border-red-700 text-red-800"}`}>
                      {RELEASES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  {isAdmin && <td className="py-3 px-4"><button onClick={() => removeChef(c)} className="text-xs underline opacity-60">Supprimer</button></td>}
                </tr>
              ))}
              {chefs.length === 0 && <tr><td colSpan={6} className="py-10 text-center opacity-60">Aucun chef. Les candidatures « chef » arrivent dans Réceptions publiques · Casting.</td></tr>}
            </tbody>
          </table>
          </div>
          <p className="text-xs opacity-60 mt-3">Seuls les finalistes et lauréats dont l'autorisation de droit à l'image est signée apparaissent sur la page publique /concours (sans leur e-mail). Aucun chef ne doit être filmé avant signature du contrat « Chef Invité + CIP » (menu Contrats & NDA).</p>
        </>
      )}

      {tab === "jury" && (
        <>
          <form onSubmit={addJuror} className="flex flex-wrap gap-3 mb-8" data-testid="juror-form">
            <input required placeholder="Nom du juré *" value={jurorForm.name} onChange={(e) => setJurorForm({ ...jurorForm, name: e.target.value })} className={inp} />
            <input placeholder="Titre, territoire représenté" value={jurorForm.role} onChange={(e) => setJurorForm({ ...jurorForm, role: e.target.value })} className={`${inp} flex-1`} />
            <button type="submit" className={btn}>Ajouter</button>
          </form>
          <ul className="border border-sable bg-white/40 divide-y divide-sable/40">
            {jurors.map((j) => (
              <li key={j.id} className="px-4 py-3 flex justify-between text-sm">
                <span>{j.name}{j.role && <span className="opacity-60"> · {j.role}</span>}</span>
                {isAdmin && <button onClick={() => removeJuror(j)} className="text-xs underline opacity-60">Retirer</button>}
              </li>
            ))}
            {jurors.length === 0 && <li className="px-4 py-10 text-center opacity-60 text-sm">Aucun juré.</li>}
          </ul>
        </>
      )}

      {(tab === "notation" || tab === "classement") && (
        <div className="flex gap-2 mb-6">
          {ROUNDS.map(([k, l]) => (
            <button key={k} onClick={() => setStage(k)} className={`${btn} ${stage === k ? "bg-noir text-ivoire" : ""}`} data-testid={`round-${k}`}>{l}</button>
          ))}
        </div>
      )}

      {tab === "notation" && (
        <form onSubmit={saveScore} className="max-w-xl space-y-4" data-testid="score-form">
          <p className="text-sm opacity-70">Pondération : goût 35 %, technique 25 %, créativité 20 %, récit 20 %. Notes de 0 à 10. Une nouvelle saisie remplace la note précédente du même juré.</p>
          <div className="grid grid-cols-2 gap-3">
            <select required value={sel.juror_id} onChange={(e) => setSel({ ...sel, juror_id: e.target.value })} className={inp}>
              <option value="">Juré…</option>{jurors.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
            <select required value={sel.chef_id} onChange={(e) => setSel({ ...sel, chef_id: e.target.value })} className={inp}>
              <option value="">Chef…</option>{chefs.filter((c) => c.status !== "elimine").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {CRITERIA.map(([k, l]) => (
              <label key={k} className="text-sm">
                <span className="label-eyebrow opacity-60 block mb-1">{l}</span>
                <input required type="number" min={0} max={10} step={0.5} value={score[k]} onChange={(e) => setScore({ ...score, [k]: e.target.value })} className={`${inp} w-full`} data-testid={`score-${k}`} />
              </label>
            ))}
          </div>
          <button type="submit" className={btn} data-testid="score-save">Enregistrer la note</button>
        </form>
      )}

      {tab === "classement" && board && (
        <>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-sm">Vote du public : <b>{settings.vote_open ? "ouvert" : "fermé"}</b> · {board.votes_total} voix</span>
            {isAdmin && <button onClick={toggleVote} className={btn} data-testid="vote-toggle">{settings.vote_open ? "Fermer le vote" : "Ouvrir le vote"}</button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border border-sable bg-white/40" data-testid="table-leaderboard">
            <thead><tr className="border-b border-sable label-eyebrow opacity-60 text-left">
              <th className="py-3 px-4">#</th><th className="py-3 px-4">Chef</th>
              {CRITERIA.map(([k, l]) => <th key={k} className="py-3 px-4">{l}</th>)}
              <th className="py-3 px-4">Note jury /10</th><th className="py-3 px-4">Notes</th><th className="py-3 px-4">Vote public</th>
            </tr></thead>
            <tbody>
              {board.rows.map((r, i) => (
                <tr key={r.chef_id} className="border-b border-sable/40">
                  <td className="py-3 px-4 text-sm">{r.total == null ? "·" : i + 1}</td>
                  <td className="py-3 px-4 text-sm">{r.name}<div className="text-xs opacity-60">{r.status}{r.image_release !== "signee" && <span className="text-red-800"> · autorisation image manquante</span>}</div></td>
                  {CRITERIA.map(([k]) => <td key={k} className="py-3 px-4 text-sm">{r.criteria[k] ?? "·"}</td>)}
                  <td className="py-3 px-4 serif-display text-2xl">{r.total ?? "·"}</td>
                  <td className="py-3 px-4 text-sm">{r.scores}/{board.jurors}</td>
                  <td className="py-3 px-4 text-sm">{r.votes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
