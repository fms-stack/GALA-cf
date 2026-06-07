import { createContext, useContext, useEffect, useState } from "react";

// Lightweight i18n: dictionary-based, no external dep needed at this scale.
const DICTS = {
  fr: {
    nav: { home: "Accueil", concept: "Concept", prix: "Les 7 Prix", billetterie: "Billetterie", cercle: "Cercle", mecenat: "Mécénat", partenaires: "Partenaires", soumettre: "Soumettre", casting: "Casting" },
    cta: { confirm: "Confirmer", reserve: "Réserver une place", join_circle: "Rejoindre le Cercle", become_patron: "Devenir mécène" },
    hero: { chapter: "Chapitre I · Samedi 12 Décembre 2026 · Paris" },
    footer: { rights: "Tous droits réservés", powered: "Powered by", staff_access: "Accès équipe ↗" },
  },
  en: {
    nav: { home: "Home", concept: "Concept", prix: "The 7 Awards", billetterie: "Tickets", cercle: "Circle", mecenat: "Patronage", partenaires: "Partners", soumettre: "Submit", casting: "Casting" },
    cta: { confirm: "Confirm", reserve: "Reserve a seat", join_circle: "Join the Circle", become_patron: "Become a patron" },
    hero: { chapter: "Chapter I · Saturday December 12, 2026 · Paris" },
    footer: { rights: "All rights reserved", powered: "Powered by", staff_access: "Team access ↗" },
  },
  es: {
    nav: { home: "Inicio", concept: "Concepto", prix: "Los 7 Premios", billetterie: "Entradas", cercle: "Círculo", mecenat: "Mecenazgo", partenaires: "Socios", soumettre: "Proponer", casting: "Casting" },
    cta: { confirm: "Confirmar", reserve: "Reservar plaza", join_circle: "Unirse al Círculo", become_patron: "Ser mecenas" },
    hero: { chapter: "Capítulo I · Sábado 12 de diciembre de 2026 · París" },
    footer: { rights: "Todos los derechos reservados", powered: "Impulsado por", staff_access: "Acceso equipo ↗" },
  },
  pt: {
    nav: { home: "Início", concept: "Conceito", prix: "Os 7 Prémios", billetterie: "Bilheteira", cercle: "Círculo", mecenat: "Mecenato", partenaires: "Parceiros", soumettre: "Submeter", casting: "Casting" },
    cta: { confirm: "Confirmar", reserve: "Reservar lugar", join_circle: "Juntar-se ao Círculo", become_patron: "Tornar-se mecenas" },
    hero: { chapter: "Capítulo I · Sábado 12 de dezembro de 2026 · Paris" },
    footer: { rights: "Todos os direitos reservados", powered: "Powered by", staff_access: "Acesso equipa ↗" },
  },
  ru: {
    nav: { home: "Главная", concept: "Концепция", prix: "7 Премий", billetterie: "Билеты", cercle: "Круг", mecenat: "Меценатство", partenaires: "Партнёры", soumettre: "Подать", casting: "Кастинг" },
    cta: { confirm: "Подтвердить", reserve: "Забронировать место", join_circle: "Войти в Круг", become_patron: "Стать меценатом" },
    hero: { chapter: "Глава I · Суббота, 12 декабря 2026 · Париж" },
    footer: { rights: "Все права защищены", powered: "Powered by", staff_access: "Команда ↗" },
  },
  zh: {
    nav: { home: "首页", concept: "概念", prix: "七项大奖", billetterie: "门票", cercle: "核心圈", mecenat: "赞助", partenaires: "合作伙伴", soumettre: "提交", casting: "选角" },
    cta: { confirm: "确认", reserve: "预订席位", join_circle: "加入核心圈", become_patron: "成为赞助人" },
    hero: { chapter: "第一章 · 2026年12月12日 星期六 · 巴黎" },
    footer: { rights: "版权所有", powered: "技术支持", staff_access: "团队入口 ↗" },
  },
  ja: {
    nav: { home: "ホーム", concept: "コンセプト", prix: "7つの賞", billetterie: "チケット", cercle: "サークル", mecenat: "メセナ", partenaires: "パートナー", soumettre: "提出", casting: "キャスティング" },
    cta: { confirm: "確認", reserve: "席を予約", join_circle: "サークルに参加", become_patron: "パトロンになる" },
    hero: { chapter: "第一章 · 2026年12月12日(土) · パリ" },
    footer: { rights: "All Rights Reserved", powered: "Powered by", staff_access: "チーム ↗" },
  },
  hi: {
    nav: { home: "मुख्य", concept: "अवधारणा", prix: "7 पुरस्कार", billetterie: "टिकट", cercle: "मंडल", mecenat: "संरक्षण", partenaires: "साझेदार", soumettre: "प्रस्तुत", casting: "कास्टिंग" },
    cta: { confirm: "पुष्टि", reserve: "स्थान आरक्षित", join_circle: "मंडल में शामिल", become_patron: "संरक्षक बनें" },
    hero: { chapter: "अध्याय I · शनिवार 12 दिसंबर 2026 · पेरिस" },
    footer: { rights: "सर्वाधिकार सुरक्षित", powered: "Powered by", staff_access: "टीम ↗" },
  },
  ht: {
    nav: { home: "Akèy", concept: "Konsèp", prix: "7 Prim yo", billetterie: "Tikèt", cercle: "Sèk", mecenat: "Patwonaj", partenaires: "Patnè", soumettre: "Soumèt", casting: "Kasting" },
    cta: { confirm: "Konfime", reserve: "Rezève plas ou", join_circle: "Rantre nan Sèk la", become_patron: "Vin yon patwon" },
    hero: { chapter: "Chapit I · Samdi 12 Desanm 2026 · Pari" },
    footer: { rights: "Tout dwa rezève", powered: "Powered by", staff_access: "Aksè ekip ↗" },
  },
};

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
    if (v == null) { // fallback to FR
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
