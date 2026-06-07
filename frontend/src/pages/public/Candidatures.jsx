import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const DISCIPLINES = ["cuisine", "musique", "art", "mode", "cinema", "litterature", "culture"];

export default function Candidatures() {
  const [form, setForm] = useState({ full_name: "", email: "", discipline: "cuisine", project_title: "", description: "", portfolio_url: "", honeypot: "" });
  const [ref, setRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/applications", form);
      setRef(data.ref);
      toast.success("Votre proposition est arrivée.");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };

  if (ref) return (
    <div data-testid="public-applications-success" className="min-h-[70vh] text-ivoire flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        <p className="label-eyebrow text-or mb-6">Proposition reçue</p>
        <h1 className="serif-display text-5xl mb-6">Merci.</h1>
        <p className="text-sable">Référence <span className="text-or">#{ref}</span>. La direction artistique reviendra vers vous après lecture.</p>
      </div>
    </div>
  );

  return (
    <div data-testid="public-applications" className="min-h-screen text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-20">
        <div>
          <p className="label-eyebrow text-or mb-6">Proposer une création</p>
          <h1 className="serif-display text-5xl lg:text-7xl mb-8">Soumettre<br /><span className="italic">un projet.</span></h1>
          <p className="text-sable text-lg leading-relaxed max-w-md">
            Une recette, un set, une pièce, une œuvre, un texte. Si votre proposition résonne avec l'ADN du Gala, nous reviendrons vers vous.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-6">
          <input type="text" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />
          <Field label="Nom & Prénom *" testid="app-name"><input required value={form.full_name} onChange={onChange("full_name")} className={inp} /></Field>
          <Field label="E-mail *" testid="app-email"><input required type="email" value={form.email} onChange={onChange("email")} className={inp} /></Field>
          <Field label="Discipline *"><select value={form.discipline} onChange={onChange("discipline")} className={inp} data-testid="app-discipline">{DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}</select></Field>
          <Field label="Titre du projet *" testid="app-title"><input required value={form.project_title} onChange={onChange("project_title")} className={inp} /></Field>
          <Field label="Description *" testid="app-desc"><textarea required rows={4} value={form.description} onChange={onChange("description")} className={`${inp} resize-none`} /></Field>
          <Field label="Lien portfolio" testid="app-portfolio"><input value={form.portfolio_url} onChange={onChange("portfolio_url")} className={inp} placeholder="https://…" /></Field>
          <button type="submit" disabled={loading} data-testid="app-submit" className="w-full bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60">{loading ? "Envoi…" : "Envoyer ma proposition →"}</button>
        </form>
      </div>
    </div>
  );
}

const inp = "w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 transition-colors";
function Field({ label, testid, children }) {
  return (<div><label className="label-eyebrow opacity-60 block mb-2" data-testid={testid ? `${testid}-label` : undefined}>{label}</label>{children}</div>);
}
