import { Outlet, NavLink, Link } from "react-router-dom";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";

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
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-noir text-ivoire">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-noir/70 border-b border-ivoire/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-ivoire" data-testid="public-logo-link">
            <Logo size={32} />
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
        </div>
      </header>
      <main className="pt-20">
        <Outlet />
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
        <div className="border-t border-ivoire/5 py-6 text-center label-eyebrow opacity-40">
          © 2026 CVLN Holding · Tous droits réservés
        </div>
      </footer>
    </div>
  );
}
