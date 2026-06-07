import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { List, X } from "@phosphor-icons/react";

const NAV = [
  { to: "/", label: "Accueil", end: true },
  { to: "/concept", label: "Concept" },
  { to: "/prix", label: "Les 7 Prix" },
  { to: "/billetterie", label: "Billetterie" },
  { to: "/candidatures", label: "Soumettre" },
  { to: "/casting", label: "Casting" },
  { to: "/sponsoring", label: "Partenaires" },
  { to: "/rsvp", label: "RSVP VIP" },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-noir text-ivoire">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-noir/70 border-b border-ivoire/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-ivoire group" data-testid="public-logo-link">
            <Logo size={32} className="transition-transform duration-700 group-hover:rotate-180" />
            <div className="leading-tight">
              <div className="serif-display text-xl">Cook &amp; Food</div>
              <div className="label-eyebrow opacity-70">Gala · 2026</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                data-testid={`public-nav-${n.to.replace("/", "") || "home"}`}
                className={({ isActive }) =>
                  `label-eyebrow transition-opacity hover:opacity-100 ${isActive ? "text-or opacity-100" : "opacity-60"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link
            to="/rsvp"
            data-testid="public-cta-rsvp"
            className="hidden md:inline-flex border border-or px-5 py-2 text-or label-eyebrow hover:bg-or hover:text-noir transition-colors"
          >
            Confirmer
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            data-testid="public-mobile-burger"
            className="lg:hidden text-ivoire p-2"
          >
            {open ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t border-ivoire/10 bg-noir px-6 py-6 flex flex-col gap-4" data-testid="public-mobile-menu">
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
            <p className="mt-6 text-sable text-sm leading-relaxed max-w-xs">
              Cook &amp; Food Gala — plus qu'un événement, une empreinte culturelle.
            </p>
            <p className="mt-6 label-eyebrow opacity-50">12 Décembre 2026 · Paris</p>
          </div>
          <div>
            <div className="label-eyebrow opacity-60 mb-4">Propulsé par</div>
            <ul className="space-y-2 text-sm">
              <li>CVLN Holding</li>
              <li>Factory Maker Studio</li>
              <li>CVL Culinary Innovations</li>
            </ul>
          </div>
          <div>
            <div className="label-eyebrow opacity-60 mb-4">Contact</div>
            <p className="text-sm">contact@cookandfood.gala</p>
            <p className="text-sm mt-1 opacity-70">Martinique — France</p>
            <Link to="/login" className="text-xs opacity-50 hover:opacity-100 mt-6 inline-block" data-testid="public-staff-login">
              Accès équipe ↗
            </Link>
          </div>
        </div>
        <div className="border-t border-ivoire/5 py-6 flex items-center justify-between px-6 lg:px-12 flex-wrap gap-4">
          <div className="label-eyebrow opacity-40">© 2026 CVLN Holding · Tous droits réservés</div>
          <a
            href="https://www.factorymakerstudio.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="powered-by-fms"
            className="flex items-center gap-3 group"
          >
            <span className="label-eyebrow opacity-40 group-hover:opacity-70 transition-opacity">Powered by</span>
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
