import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function Stat({ label, value, hint, testid }) {
  return (
    <div className="border border-sable bg-white/40 p-6" data-testid={testid}>
      <div className="label-eyebrow opacity-60">{label}</div>
      <div className="serif-display text-5xl mt-3">{value}</div>
      {hint && <div className="text-xs opacity-60 mt-2">{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-10" data-testid="admin-dashboard">
      <div className="mb-12">
        <p className="label-eyebrow opacity-60">Bienvenue {user?.name?.split(" ")[0]}</p>
        <h1 className="serif-display text-5xl mt-2">Tableau de bord.</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Stat label="Postes" value={stats?.positions ?? "—"} testid="stat-positions" />
        <Stat label="Personnes" value={stats?.people ?? "—"} testid="stat-people" />
        <Stat label="Affectations" value={stats?.assignments ?? "—"} testid="stat-assignments" />
        <Stat label="Compte à rebours" value={stats ? `J-${stats.days_to_gala}` : "—"} hint="12 décembre 2026" testid="stat-countdown" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-sable bg-white/40 p-8" data-testid="card-invitations">
          <div className="label-eyebrow opacity-60 mb-4">Invitations VIP</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="serif-display text-4xl">{stats?.invitations?.total ?? 0}</div>
              <div className="text-xs opacity-60 mt-1">Total</div>
            </div>
            <div>
              <div className="serif-display text-4xl text-brun">{stats?.invitations?.pending ?? 0}</div>
              <div className="text-xs opacity-60 mt-1">En attente</div>
            </div>
            <div>
              <div className="serif-display text-4xl text-sauge">{stats?.invitations?.confirmed ?? 0}</div>
              <div className="text-xs opacity-60 mt-1">Confirmées</div>
            </div>
          </div>
        </div>

        <div className="border border-sable bg-white/40 p-8" data-testid="card-contracts">
          <div className="label-eyebrow opacity-60 mb-4">Contrats (Phase 4 à venir)</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="serif-display text-4xl">{stats?.contracts?.signed ?? 0}</div>
              <div className="text-xs opacity-60 mt-1">Signés</div>
            </div>
            <div>
              <div className="serif-display text-4xl">{stats?.contracts?.pending ?? 0}</div>
              <div className="text-xs opacity-60 mt-1">En attente</div>
            </div>
            <div>
              <div className="serif-display text-4xl">{stats?.contracts?.refused ?? 0}</div>
              <div className="text-xs opacity-60 mt-1">Refusés</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-sable pt-10">
        <p className="label-eyebrow opacity-60 mb-3">Timeline · Chapter I</p>
        <div className="serif-display text-2xl leading-relaxed max-w-3xl">
          18h30 ouverture publique · 20h00 discours fondateur · 22h00 cérémonie awards CF-GAP · 00h00 networking stratégique.
        </div>
      </div>
    </div>
  );
}
