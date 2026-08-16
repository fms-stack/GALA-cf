import { createContext, useContext, useState, useEffect } from "react";
import fr from "./translations/fr";
import en from "./translations/en";
import es from "./translations/es";
import pt from "./translations/pt";
import ru from "./translations/ru";
import zh from "./translations/zh";
import ja from "./translations/ja";
import hi from "./translations/hi";
import ht from "./translations/ht";

const DICTS = { fr, en, es, pt, ru, zh, ja, hi, ht };

export const LANGS = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "en", label: "EN", name: "English" },
  { code: "es", label: "ES", name: "Español" },
  { code: "pt", label: "PT", name: "Português" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "zh", label: "中文", name: "中文" },
  { code: "ja", label: "日本語", name: "日本語" },
  { code: "hi", label: "हिं", name: "हिन्दी" },
  { code: "ht", label: "KR", name: "Kreyòl" },
];

const I18nCtx = createContext({ lang: "fr", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("cvln_lang") || "fr");
  useEffect(() => { localStorage.setItem("cvln_lang", lang); document.documentElement.lang = lang; }, [lang]);
  const setLang = (l) => setLangState(l);
  const t = (path) => {
    const parts = path.split(".");
    let v = DICTS[lang] || DICTS.fr;
    for (const p of parts) { v = v?.[p]; if (v == null) break; }
    if (v == null) {
      v = DICTS.fr;
      for (const p of parts) v = v?.[p];
    }
    return v ?? path;
  };
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);

export function LangSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];
  return (
    <div className="relative" data-testid="lang-switcher">
      <button onClick={() => setOpen(!open)} className="label-eyebrow text-or border border-or/40 px-3 py-1.5 hover:bg-or hover:text-noir transition-colors" data-testid="lang-current">
        {current.label}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-noir border border-or/30 min-w-[140px] z-50 max-h-[60vh] overflow-y-auto">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
              data-testid={`lang-option-${l.code}`}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-or hover:text-noir ${lang === l.code ? "text-or" : "text-ivoire/80"}`}>
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
