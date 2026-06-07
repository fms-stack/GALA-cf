import { useEffect, useState, useRef } from "react";
import { api, formatApiError, API } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { UploadSimple, Lock, FileText, Eye } from "@phosphor-icons/react";

export default function Bible() {
  const { user } = useAuth();
  const [meta, setMeta] = useState(null);
  const [logs, setLogs] = useState([]);
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const m = await api.get("/bible/meta").catch(() => ({ data: { exists: false } }));
    setMeta(m.data);
    if (user?.role === "admin") {
      const l = await api.get("/bible/access-logs").catch(() => ({ data: [] }));
      setLogs(l.data);
    }
  };
  useEffect(() => { load(); }, [user]);

  const onUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Merci de fournir un fichier .pdf"); return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      await api.post("/bible/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Bible uploadée.");
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setUploading(false); }
  };

  const openBible = async () => {
    try {
      const { data } = await api.post("/bible/signed-url");
      const url = `${process.env.REACT_APP_BACKEND_URL}${data.url}`;
      window.open(url, "_blank");
      toast.info("Lien valide 5 minutes. Lien à usage unique.");
      setTimeout(load, 1500);
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  return (
    <div className="p-10" data-testid="admin-bible">
      <div className="mb-10">
        <p className="label-eyebrow opacity-60">Phase 5 · Bible CVLN</p>
        <h1 className="serif-display text-5xl mt-2">Bible PDF.</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="border border-sable bg-white/40 p-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={20} className="text-brun" />
            <div className="label-eyebrow opacity-60">Document chiffré</div>
          </div>
          {meta?.exists ? (
            <>
              <div className="serif-display text-2xl mb-2">{meta.meta?.original_filename || "Bible PDF"}</div>
              <div className="text-xs opacity-60 mb-6">
                Uploadée le {meta.meta?.uploaded_at ? new Date(meta.meta.uploaded_at).toLocaleDateString("fr-FR") : "—"} ·
                {meta.meta?.size ? ` ${(meta.meta.size / 1024).toFixed(0)} KB` : ""}
              </div>
              <button onClick={openBible} data-testid="bible-open" className="flex items-center gap-2 bg-noir text-ivoire px-5 py-3 label-eyebrow hover:bg-brun transition-colors">
                <Eye size={14} /> Ouvrir (lien 5 min)
              </button>
              <p className="mt-4 text-xs opacity-60 italic">URL signée à durée limitée · usage unique · accès logué</p>
            </>
          ) : (
            <div className="text-sm opacity-60 mb-6">Aucune Bible uploadée pour le moment.</div>
          )}

          {user?.role === "admin" && (
            <div className="mt-8 pt-6 border-t border-sable">
              <p className="label-eyebrow opacity-60 mb-3">{meta?.exists ? "Remplacer" : "Uploader"} la Bible</p>
              <input ref={fileRef} type="file" accept=".pdf" onChange={onUpload} className="hidden" data-testid="bible-file-input" />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 border border-noir/30 px-5 py-3 label-eyebrow hover:bg-noir hover:text-ivoire transition-colors disabled:opacity-60" data-testid="bible-upload-btn">
                <UploadSimple size={14} /> {uploading ? "Upload…" : "Sélectionner un PDF"}
              </button>
            </div>
          )}
        </div>

        {user?.role === "admin" && (
          <div className="border border-sable bg-white/40 p-8">
            <div className="label-eyebrow opacity-60 mb-4">Logs d'accès (200 derniers)</div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 && <p className="text-sm opacity-60">Aucun accès enregistré.</p>}
              {logs.map((l) => (
                <div key={l.id} className="text-xs border-l-2 border-or pl-3 py-1">
                  <div className="font-medium">{l.user_email}</div>
                  <div className="opacity-60">{new Date(l.at).toLocaleString("fr-FR")} · {l.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 max-w-2xl text-sm opacity-70 italic leading-relaxed">
        <strong>Accès conditionnel :</strong> les Nommés ne peuvent consulter la Bible qu'après signature de leur NDA. Les rôles admin, production et juridique disposent d'un accès permanent. Chaque génération de lien et chaque consultation sont loggées de manière immuable.
      </div>
    </div>
  );
}
