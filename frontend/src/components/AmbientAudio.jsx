import { useState, useRef, useEffect } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

/**
 * Discreet ambient audio toggle for hero/site.
 * Default: muted. User opt-in only.
 * Audio src can be swapped via prop; falls back to silent state if missing.
 */
export function AmbientAudio({ src }) {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    const onCanPlay = () => setReady(true);
    a.addEventListener("canplaythrough", onCanPlay);
    return () => a.removeEventListener("canplaythrough", onCanPlay);
  }, []);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (on) { a.pause(); setOn(false); return; }
    try { await a.play(); setOn(true); } catch { setOn(false); }
  };

  if (!src) return null;
  return (
    <>
      <audio ref={audioRef} src={src} loop preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        aria-label={on ? "Couper le son" : "Activer le son ambiant"}
        data-testid="ambient-audio-toggle"
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2 border border-or/40 bg-noir/70 backdrop-blur px-4 py-2.5 text-or hover:bg-or hover:text-noir transition-colors group"
      >
        {on ? <SpeakerHigh size={16} weight="light" /> : <SpeakerSlash size={16} weight="light" />}
        <span className="label-eyebrow opacity-80 group-hover:opacity-100">{on ? "Pause" : "Ambiance"}</span>
        {on && (
          <span className="flex items-end gap-0.5 ml-1">
            <span className="block w-0.5 h-3 bg-current animate-pulse" style={{ animationDelay: "0ms" }} />
            <span className="block w-0.5 h-4 bg-current animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="block w-0.5 h-2 bg-current animate-pulse" style={{ animationDelay: "300ms" }} />
          </span>
        )}
      </button>
    </>
  );
}
