import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/consultant/indicateurs")({
  component: () => (
    <AuthGuard role="consultant">
      <Indicators />
    </AuthGuard>
  ),
});

const labels: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  waiting: "En attente",
  done: "Terminé",
};

function Indicators() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("requests")
      .select("status")
      .then(({ data }) => {
        const c: Record<string, number> = {};
        (data ?? []).forEach((r: { status: string }) => {
          c[r.status] = (c[r.status] ?? 0) + 1;
        });
        setCounts(c);
        setLoading(false);
      });
  }, []);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const inProgress = counts.in_progress ?? 0;
  const done = counts.done ?? 0;
  const chartData = Object.entries(labels).map(([k, name]) => ({
    name,
    value: counts[k] ?? 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="consultant" />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Indicateurs
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Vue d'ensemble</h1>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Kpi label="Total projets" value={total} />
              <Kpi label="En cours" value={inProgress} />
              <Kpi label="Terminés" value={done} />
            </div>

            <div className="mt-10 rounded-md border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Répartition par statut</h2>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="oklch(0.12 0 0)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-4 text-4xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
