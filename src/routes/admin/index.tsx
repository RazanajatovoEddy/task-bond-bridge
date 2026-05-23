import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { AdminHeader } from "@/components/admin-header";

export const Route = createFileRoute("/admin/")({
  component: () => (
    <AuthGuard role="admin">
      <AdminDashboard />
    </AuthGuard>
  ),
});

function AdminDashboard() {
  const [stats, setStats] = useState({
    consultants: 0,
    entreprises: 0,
    projetsActifs: 0,
    projetsNouveaux: 0,
  });

  useEffect(() => {
    (async () => {
      const [c, e, actifs, nouveaux] = await Promise.all([
        supabase.from("consultant_profiles").select("id", { count: "exact", head: true }),
        supabase.from("company_profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .in("status", ["new", "in_progress", "waiting"]),
        supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
      ]);
      setStats({
        consultants: c.count ?? 0,
        entreprises: e.count ?? 0,
        projetsActifs: actifs.count ?? 0,
        projetsNouveaux: nouveaux.count ?? 0,
      });
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="mt-2 text-sm text-muted-foreground">Vue d'ensemble de l'activité.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Consultants" value={stats.consultants} />
          <StatCard label="Entreprises" value={stats.entreprises} />
          <StatCard label="Projets actifs" value={stats.projetsActifs} />
          <StatCard label="Nouveaux projets" value={stats.projetsNouveaux} />
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
