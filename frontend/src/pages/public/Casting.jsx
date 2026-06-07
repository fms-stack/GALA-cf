import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const TYPES = ["chef", "artiste", "performer", "mc"];

export default function Casting() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", profile_type: "chef", bio: "", demo_url: "", honeypot: "" });
  const [ref, setRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/public/casting", form);
      setRef(data.ref);
      toast.success("Candidature enregistrée.");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };

  if (ref) return (
    <div data-testid="public-casting-success" className="min-h-[70vh] text-ivoire flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        <p className="label-eyebrow text-or mb-6">Casting</p>
        <h1 className="serif-display text-5xl mb-6">Reçu.</h1>
        <p className="text-sable">Référence <span className="text-or">#{ref}</span>. La directrice de casting vous contacte si votre profil correspond.</p>
      </div>
    </div>
  );

  return (
    <div data-testid="public-casting" className="min-h-screen text-ivoire">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="relative overflow-hidden hidden lg:block order-2">
          <img src="https://images.unsplash.com/photo-1570000569749-3a9f0c46d70c?auto=format&fit=crop&w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-bl from-noir/30 via-noir/60 to-noir" />
          <div className="relative h-full flex flex-col justify-end p-12">
            <p className="label-eyebrow text-or mb-6">Rejoindre la scène</p>
            <h1 className="serif-display text-5xl xl:text-7xl mb-6">Casting.</h1>
            <p className="text-sable text-lg max-w-md leading-relaxed">Chefs, artistes, performers, maîtres de cérémonie. Les talents qui font la différence ne se trouvent pas dans les annuaires.</p>
          </div>
        </div>
        <div className="px-6 lg:px-12 py-20 md:py-24 order-1">
          <div className="lg:hidden mb-10">
            <p className="label-eyebrow text-or mb-4">Rejoindre la scène</p>
            <h1 className="serif-display text-4xl">Casting.</h1>
          </div>
          <form onSubmit={submit} className="space-y-6 max-w-md">
          <input type="text" value={form.honeypot} onChange={onChange("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />
          <Field label="Nom & Prénom *"><input required value={form.full_name} onChange={onChange("full_name")} className={inp} data-testid="cast-name" /></Field>
          <Field label="E-mail *"><input required type="email" value={form.email} onChange={onChange("email")} className={inp} data-testid="cast-email" /></Field>
          <Field label="Téléphone"><input value={form.phone} onChange={onChange("phone")} className={inp} data-testid="cast-phone" /></Field>
          <Field label="Profil *"><select value={form.profile_type} onChange={onChange("profile_type")} className={inp} data-testid="cast-type">{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
          <Field label="Bio courte *"><textarea required rows={4} value={form.bio} onChange={onChange("bio")} className={`${inp} resize-none`} data-testid="cast-bio" /></Field>
          <Field label="Lien démo / portfolio"><input value={form.demo_url} onChange={onChange("demo_url")} className={inp} placeholder="https://…" data-testid="cast-demo" /></Field>
          <button type="submit" disabled={loading} data-testid="cast-submit" className="w-full bg-or text-noir py-4 label-eyebrow hover:bg-ivoire transition-colors disabled:opacity-60">{loading ? "Envoi…" : "Postuler →"}</button>
        </form>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full bg-transparent border-b border-sable/40 focus:border-or outline-none py-3 text-base text-ivoire placeholder:text-sable/30 transition-colors";
function Field({ label, children }) { return (<div><label className="label-eyebrow opacity-60 block mb-2">{label}</label>{children}</div>); }
