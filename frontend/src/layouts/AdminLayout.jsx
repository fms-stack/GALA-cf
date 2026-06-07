import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { House, Users, IdentificationCard, Briefcase, Envelope, SignOut, Tray } from "@phosphor-icons/react";

const NAV = [
  { to: "/admin", label: "Tableau de bord", icon: House, end: true },
  { to: "/admin/positions", label: "Postes", icon: Briefcase },
  { to: "/admin/people", label: "Personnes", icon: IdentificationCard },
  { to: "/admin/assignments", label: "Affectations", icon: Users },
  { to: "/admin/invitations", label: "Invitations VIP", icon: Envelope },
  { to: "/admin/submissions", label: "Réceptions publiques", icon: Tray },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ivoire text-noir flex">
      <aside className="w-64 bg-ivoire border-r border-sable/40 flex flex-col fixed inset-y-0 left-0">
        <div className="px-6 py-7 border-b border-sable/40">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <div className="leading-tight">
              <div className="serif-display text-lg">Gala OS</div>
              <div className="label-eyebrow opacity-60">CVLN · Back-office</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={`admin-nav-${n.to.replace("/admin/", "").replace("/admin", "dashboard") || "dashboard"}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isActive ? "bg-noir text-ivoire" : "text-noir/70 hover:bg-sable/40"
                }`
              }
            >
              <n.icon size={18} weight="light" />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-sable/40">
          <div className="label-eyebrow opacity-60 mb-1">Connecté</div>
          <div className="text-sm font-medium truncate" data-testid="admin-current-user">{user?.name}</div>
          <div className="text-xs opacity-60 capitalize">{user?.role}</div>
          <button
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="mt-4 w-full flex items-center justify-center gap-2 border border-noir/30 px-3 py-2 text-xs uppercase tracking-[0.2em] hover:bg-noir hover:text-ivoire transition-colors"
          >
            <SignOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
