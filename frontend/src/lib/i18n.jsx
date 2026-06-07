import { createContext, useContext, useEffect, useState } from "react";

// Lightweight i18n: dictionary-based, no external dep needed at this scale.
const DICTS = {
  fr: {
    nav: { home: "Accueil", concept: "Concept", prix: "Les 7 Prix", billetterie: "Billetterie", cercle: "Cercle", mecenat: "Mécénat", partenaires: "Partenaires", soumettre: "Soumettre", casting: "Casting" },
    cta: { confirm: "Confirmer", reserve: "Réserver une place", join_circle: "Rejoindre le Cercle", become_patron: "Devenir mécène", confirm_presence: "Confirmer ma présence", public_billet: "Billetterie publique", discover: "Découvrir" },
    hero: { chapter: "Chapitre I · Samedi 12 Décembre 2026 · Paris", tagline: "Une expérience gastronomique & culturelle immersive — Cuisine, Culture, Musique, Art, Mode, Cinéma & Littérature.", note: "Plus qu'un événement, une empreinte culturelle." },
    footer: { rights: "Tous droits réservés", powered: "Powered by", staff_access: "Accès équipe ↗" },
    invitation: { title: "120 sièges à la table.", body: "Les invitations partent en septembre 2026.\nSur cooptation uniquement.", manifest: "Manifester son intérêt — confidentiel", signal_ok: "Signal reçu. La direction reviendra vers vous." },
  },
  en: {
    nav: { home: "Home", concept: "Concept", prix: "The 7 Awards", billetterie: "Tickets", cercle: "Circle", mecenat: "Patronage", partenaires: "Partners", soumettre: "Submit", casting: "Casting" },
    cta: { confirm: "Confirm", reserve: "Reserve a seat", join_circle: "Join the Circle", become_patron: "Become a patron", confirm_presence: "Confirm my presence", public_billet: "Public tickets", discover: "Discover" },
    hero: { chapter: "Chapter I · Saturday December 12, 2026 · Paris", tagline: "An immersive gastronomic & cultural experience — Cuisine, Culture, Music, Art, Fashion, Cinema & Literature.", note: "More than an event. A cultural imprint." },
    footer: { rights: "All rights reserved", powered: "Powered by", staff_access: "Team access ↗" },
    invitation: { title: "120 seats at the table.", body: "Invitations are sent out in September 2026.\nBy co-option only.", manifest: "Signal your interest — confidential", signal_ok: "Signal received. The team will reach out to you." },
  },
  es: {
    nav: { home: "Inicio", concept: "Concepto", prix: "Los 7 Premios", billetterie: "Entradas", cercle: "Círculo", mecenat: "Mecenazgo", partenaires: "Socios", soumettre: "Proponer", casting: "Casting" },
    cta: { confirm: "Confirmar", reserve: "Reservar plaza", join_circle: "Unirse al Círculo", become_patron: "Ser mecenas", confirm_presence: "Confirmar mi presencia", public_billet: "Entradas públicas", discover: "Descubrir" },
    hero: { chapter: "Capítulo I · Sábado 12 de diciembre de 2026 · París", tagline: "Una experiencia gastronómica y cultural inmersiva — Cocina, Cultura, Música, Arte, Moda, Cine y Literatura.", note: "Más que un evento. Una huella cultural." },
    footer: { rights: "Todos los derechos reservados", powered: "Impulsado por", staff_access: "Acceso equipo ↗" },
    invitation: { title: "120 plazas a la mesa.", body: "Las invitaciones se envían en septiembre 2026.\nÚnicamente por cooptación.", manifest: "Manifestar su interés — confidencial", signal_ok: "Señal recibida. La dirección le responderá." },
  },
  pt: {
    nav: { home: "Início", concept: "Conceito", prix: "Os 7 Prémios", billetterie: "Bilheteira", cercle: "Círculo", mecenat: "Mecenato", partenaires: "Parceiros", soumettre: "Submeter", casting: "Casting" },
    cta: { confirm: "Confirmar", reserve: "Reservar lugar", join_circle: "Juntar-se ao Círculo", become_patron: "Tornar-se mecenas", confirm_presence: "Confirmar a minha presença", public_billet: "Bilhetes públicos", discover: "Descobrir" },
    hero: { chapter: "Capítulo I · Sábado 12 de dezembro de 2026 · Paris", tagline: "Uma experiência gastronómica e cultural imersiva — Cozinha, Cultura, Música, Arte, Moda, Cinema e Literatura.", note: "Mais do que um evento. Uma marca cultural." },
    footer: { rights: "Todos os direitos reservados", powered: "Powered by", staff_access: "Acesso equipa ↗" },
    invitation: { title: "120 lugares à mesa.", body: "Os convites são enviados em setembro 2026.\nApenas por cooptação.", manifest: "Manifestar interesse — confidencial", signal_ok: "Sinal recebido. A direção entrará em contacto." },
  },
  ru: {
    nav: { home: "Главная", concept: "Концепция", prix: "7 Премий", billetterie: "Билеты", cercle: "Круг", mecenat: "Меценатство", partenaires: "Партнёры", soumettre: "Подать", casting: "Кастинг" },
    cta: { confirm: "Подтвердить", reserve: "Забронировать место", join_circle: "Войти в Круг", become_patron: "Стать меценатом", confirm_presence: "Подтвердить участие", public_billet: "Публичные билеты", discover: "Открыть" },
    hero: { chapter: "Глава I · Суббота, 12 декабря 2026 · Париж", tagline: "Иммерсивное гастрономическое и культурное событие — Кухня, Культура, Музыка, Искусство, Мода, Кино и Литература.", note: "Больше, чем событие. Культурный след." },
    footer: { rights: "Все права защищены", powered: "Powered by", staff_access: "Команда ↗" },
    invitation: { title: "120 мест за столом.", body: "Приглашения рассылаются в сентябре 2026.\nТолько по кооптации.", manifest: "Выразить интерес — конфиденциально", signal_ok: "Сигнал получен. Дирекция свяжется с вами." },
  },
  zh: {
    nav: { home: "首页", concept: "概念", prix: "七项大奖", billetterie: "门票", cercle: "核心圈", mecenat: "赞助", partenaires: "合作伙伴", soumettre: "提交", casting: "选角" },
    cta: { confirm: "确认", reserve: "预订席位", join_circle: "加入核心圈", become_patron: "成为赞助人", confirm_presence: "确认出席", public_billet: "公众门票", discover: "探索" },
    hero: { chapter: "第一章 · 2026年12月12日 星期六 · 巴黎", tagline: "沉浸式美食与文化体验 — 烹饪、文化、音乐、艺术、时尚、电影与文学。", note: "不仅是活动,更是文化印记。" },
    footer: { rights: "版权所有", powered: "技术支持", staff_access: "团队入口 ↗" },
    invitation: { title: "餐桌上的 120 个席位。", body: "邀请函将于 2026 年 9 月发出。\n仅限推荐。", manifest: "表达兴趣 — 保密", signal_ok: "信号已收到,负责团队将与您联系。" },
  },
  ja: {
    nav: { home: "ホーム", concept: "コンセプト", prix: "7つの賞", billetterie: "チケット", cercle: "サークル", mecenat: "メセナ", partenaires: "パートナー", soumettre: "提出", casting: "キャスティング" },
    cta: { confirm: "確認", reserve: "席を予約", join_circle: "サークルに参加", become_patron: "パトロンになる", confirm_presence: "出席を確定", public_billet: "一般チケット", discover: "発見" },
    hero: { chapter: "第一章 · 2026年12月12日(土) · パリ", tagline: "没入型のガストロノミック&カルチュラル体験 — 料理、文化、音楽、芸術、ファッション、映画、文学。", note: "イベントを超えた、文化の刻印。" },
    footer: { rights: "All Rights Reserved", powered: "Powered by", staff_access: "チーム ↗" },
    invitation: { title: "テーブルに 120 席。", body: "招待状は 2026 年 9 月に発送されます。\n推薦制のみ。", manifest: "関心を表明 — 機密", signal_ok: "シグナルを受信しました。事務局よりご連絡いたします。" },
  },
  hi: {
    nav: { home: "मुख्य", concept: "अवधारणा", prix: "7 पुरस्कार", billetterie: "टिकट", cercle: "मंडल", mecenat: "संरक्षण", partenaires: "साझेदार", soumettre: "प्रस्तुत", casting: "कास्टिंग" },
    cta: { confirm: "पुष्टि", reserve: "स्थान आरक्षित", join_circle: "मंडल में शामिल", become_patron: "संरक्षक बनें", confirm_presence: "उपस्थिति की पुष्टि", public_billet: "सार्वजनिक टिकट", discover: "खोजें" },
    hero: { chapter: "अध्याय I · शनिवार 12 दिसंबर 2026 · पेरिस", tagline: "एक immersive पाककला और सांस्कृतिक अनुभव — पाक, संस्कृति, संगीत, कला, फैशन, सिनेमा और साहित्य।", note: "एक आयोजन से अधिक। एक सांस्कृतिक छाप।" },
    footer: { rights: "सर्वाधिकार सुरक्षित", powered: "Powered by", staff_access: "टीम ↗" },
    invitation: { title: "मेज पर 120 स्थान।", body: "निमंत्रण सितंबर 2026 में भेजे जाएंगे।\nकेवल सिफारिश से।", manifest: "रुचि व्यक्त करें — गोपनीय", signal_ok: "संकेत प्राप्त। निदेशालय जल्द संपर्क करेगा।" },
  },
  ht: {
    nav: { home: "Akèy", concept: "Konsèp", prix: "7 Prim yo", billetterie: "Tikèt", cercle: "Sèk", mecenat: "Patwonaj", partenaires: "Patnè", soumettre: "Soumèt", casting: "Kasting" },
    cta: { confirm: "Konfime", reserve: "Rezève plas ou", join_circle: "Rantre nan Sèk la", become_patron: "Vin yon patwon", confirm_presence: "Konfime prezans mwen", public_billet: "Tikèt piblik", discover: "Dekouvri" },
    hero: { chapter: "Chapit I · Samdi 12 Desanm 2026 · Pari", tagline: "Yon eksperyans gastwonomik ak kiltirèl ki imèsif — Kwizin, Kilti, Mizik, Atizay, Lamòd, Sinema ak Literati.", note: "Plis pase yon evènman. Yon mak kiltirèl." },
    footer: { rights: "Tout dwa rezève", powered: "Powered by", staff_access: "Aksè ekip ↗" },
    invitation: { title: "120 plas nan tab la.", body: "Envitasyon yo ap pati nan Septanm 2026.\nSèlman pa rekòmandasyon.", manifest: "Eksprime enterè ou — konfidansyèl", signal_ok: "Siyal resevwa. Direksyon an ap kontakte ou." },
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
