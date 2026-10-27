import { useEffect, useRef, useState } from "react";
import { api, formatApiError } from "@/lib/api";

// Contrôle des entrées · fonctionne avec une douchette USB/Bluetooth (saisie + Entrée),
// la saisie manuelle du code, ou la caméra du téléphone (navigateurs avec BarcodeDetector, ex. Chrome Android).
export default function Checkin() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const lastRef = useRef({ value: "", at: 0 });
  const cameraSupported = typeof window !== "undefined" && "BarcodeDetector" in window;

  const submit = async (value) => {
    const v = (value ?? code).trim();
    if (!v || busy) return;
    setBusy(true);
    try {
      const { data } = await api.post("/ticketing/checkin", { code: v });
      setResult({ ok: true, ticket: data.ticket });
    } catch (err) {
      setResult({ ok: false, message: formatApiError(err.response?.data?.detail) });
    } finally {
      setBusy(false);
      setCode("");
      inputRef.current?.focus();
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
    } catch {
      setResult({ ok: false, message: "Accès à la caméra refusé." });
    }
  };

  useEffect(() => {
    if (!scanning || !videoRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play();
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    let stop = false;
    const tick = async () => {
      if (stop) return;
      try {
        const codes = await detector.detect(video);
        const raw = codes[0]?.rawValue;
        const now = Date.now();
        // évite de re-scanner le même billet en boucle pendant qu'il est devant la caméra
        if (raw && (raw !== lastRef.current.value || now - lastRef.current.at > 4000)) {
          lastRef.current = { value: raw, at: now };
          await submit(raw);
        }
      } catch { /* frame not ready */ }
      setTimeout(tick, 350);
    };
    tick();
    return () => { stop = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="p-5 md:p-10 max-w-2xl" data-testid="admin-checkin">
      <div className="mb-8">
        <p className="label-eyebrow opacity-60">Jour J · accueil public</p>
        <h1 className="serif-display text-5xl mt-2">Contrôle des entrées.</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-3 mb-6">
        <input ref={inputRef} autoFocus value={code} onChange={(e) => setCode(e.target.value)}
          placeholder="Scanner ou saisir le code CF-XXXXX-XXXXX" data-testid="checkin-input"
          className="flex-1 border border-sable bg-white/60 px-4 py-3 font-mono uppercase" />
        <button type="submit" disabled={busy} data-testid="checkin-submit"
          className="bg-noir text-ivoire px-6 label-eyebrow disabled:opacity-50">Valider</button>
      </form>

      {cameraSupported && (
        <div className="mb-8">
          {scanning ? (
            <>
              <video ref={videoRef} playsInline muted className="w-full max-h-80 bg-noir object-cover" />
              <button onClick={stopCamera} className="mt-3 label-eyebrow border border-noir px-4 py-2">Arrêter la caméra</button>
            </>
          ) : (
            <button onClick={startCamera} data-testid="checkin-camera" className="label-eyebrow border border-noir px-4 py-2">Scanner avec la caméra</button>
          )}
        </div>
      )}

      {result && (
        <div data-testid="checkin-result"
          className={`p-8 border-2 ${result.ok ? "border-green-700 bg-green-50 text-green-900" : "border-red-700 bg-red-50 text-red-900"}`}>
          <div className="serif-display text-4xl mb-2">{result.ok ? "Entrée validée" : "Refusé"}</div>
          {result.ok ? (
            <div className="text-lg">
              {result.ticket.holder_name} · {result.ticket.package_label} · place {result.ticket.seat_index}
              <div className="font-mono text-sm opacity-70 mt-1">{result.ticket.code}</div>
            </div>
          ) : (
            <div className="text-lg">{result.message}</div>
          )}
        </div>
      )}
    </div>
  );
}
