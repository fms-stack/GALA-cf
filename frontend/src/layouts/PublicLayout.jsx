import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { LangSwitcher, useI18n } from "@/lib/i18n";
import { List, X } from "@phosphor-icons/react";

// Adresse de contact affichée sur le site · à confirmer (le domaine .gala ne semble pas exister)
const CONTACT_EMAIL = "contact@cookandfood.gala";

// primary: affiché dans la barre sur grand écran · les autres restent dans le menu (bouton toujours visible)
const NAV_KEYS = [
  { to: "/", key: "home", end: true },
  { to: "/concept", key: "concept", primary: true },
  { to: "/prix", key: "prix", primary: true },
  { to: "/concours", key: "concours", primary: true },
  { to: "/billetterie", key: "billetterie", primary: true },
  { to: "/founders-circle", key: "cercle", primary: true },
  { to: "/mecenat", key: "mecenat", primary: true },
  { to: "/sponsoring", key: "partenaires", primary: true },
  { to: "/candidatures", key: "soumettre" },
  { to: "/casting", key: "casting" },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const NAV = NAV_KEYS.map((n) => ({ ...n, label: t(`nav.${n.key}`) }));
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-noir text-ivoire">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-noir/70 border-b border-ivoire/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 text-ivoire group shrink-0" data-testid="public-logo-link">
            <Logo size={32} className="transition-transform duration-700 group-hover:rotate-180" />
            <div className="leading-tight">
              <div className="serif-display text-xl whitespace-nowrap">Cook &amp; Food</div>
              <div className="label-eyebrow opacity-70">Gala · 2027</div>
            </div>
          </Link>
          <nav className="hidden min-[1360px]:flex items-center gap-6 2xl:gap-8">
            {NAV.filter((n) => n.primary).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                data-testid={`public-nav-${n.to.replace("/", "") || "home"}`}
                className={({ isActive }) =>
                  `label-eyebrow whitespace-nowrap transition-opacity hover:opacity-100 ${isActive ? "text-or opacity-100" : "opacity-60"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <Link
              to="/billetterie"
              data-testid="public-cta-billetterie"
              className="hidden md:inline-flex whitespace-nowrap border border-or px-5 py-2 text-or label-eyebrow hover:bg-or hover:text-noir transition-colors"
            >
              {t("cta.reserve")}
            </Link>
            <LangSwitcher />
            <button
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              aria-expanded={open}
              data-testid="public-mobile-burger"
              className="text-ivoire p-2"
            >
              {open ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-ivoire/10 bg-noir px-6 lg:px-12 py-6 flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-y-auto" data-testid="public-mobile-menu">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `label-eyebrow ${isActive ? "text-or" : "text-ivoire/70"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link to="/billetterie" onClick={() => setOpen(false)} data-testid="mobile-cta-billetterie"
              className="mt-2 bg-or text-noir text-center py-3 label-eyebrow">{t("cta.reserve")}</Link>
            <Link to="/rsvp" onClick={() => setOpen(false)} data-testid="mobile-cta-rsvp"
              className="border border-or text-or text-center py-3 label-eyebrow">{t("cta.guest_confirm")}</Link>
          </div>
        )}
      </header>
      <main className="pt-20">
        <AnimatedOutlet />
      </main>
      <footer className="border-t border-ivoire/10 mt-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 grid md:grid-cols-3 gap-12">
          <div>
            <Logo size={36} />
            <p className="mt-6 text-sable text-sm leading-relaxed max-w-xs">{t("footer.baseline")}</p>
            <p className="mt-6 label-eyebrow opacity-50">{t("footer.date_place")}</p>
          </div>
          <div>
            <div className="label-eyebrow opacity-60 mb-4">{t("footer.powered_by_label")}</div>
            <ul className="space-y-2 text-sm">
              <li>CVLN Holding</li>
              <li>Factory Maker Studio</li>
              <li>CVL Culinary Innovations</li>
            </ul>
            <Link to="/partenaires" className="label-eyebrow text-or mt-4 inline-block" data-testid="footer-organisation">{t("footer.organisation")} →</Link>
          </div>
          <div>
            <div className="label-eyebrow opacity-60 mb-4">{t("footer.contact")}</div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm hover:text-or">{CONTACT_EMAIL}</a>
            <p className="text-sm mt-1 opacity-70">Martinique · France</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link to="/contact" className="label-eyebrow text-or" data-testid="footer-contact">{t("footer.contact_page")} →</Link>
              <Link to="/cercle-restreint" className="label-eyebrow text-or" data-testid="footer-cercle">{t("footer.join_circle")} →</Link>
              <Link to="/rsvp" className="label-eyebrow text-or" data-testid="footer-rsvp">{t("cta.guest_confirm")} →</Link>
            </div>
            <Link to="/login" className="text-xs opacity-50 hover:opacity-100 mt-6 inline-block" data-testid="public-staff-login">
              {t("footer.staff_access")}
            </Link>
          </div>
        </div>
        <div className="border-t border-ivoire/5 py-6 flex items-center justify-between px-6 lg:px-12 flex-wrap gap-4">
          <div className="label-eyebrow opacity-40">© 2026 CVLN Holding · {t("footer.rights")}</div>
          <a
            href="https://www.factorymakerstudio.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="powered-by-fms"
            className="flex items-center gap-3 group"
          >
            <span className="label-eyebrow opacity-40 group-hover:opacity-70 transition-opacity">{t("footer.powered")}</span>
            <span className="serif-display text-base text-or group-hover:text-ivoire transition-colors tracking-wide">Factory Maker Studio</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
