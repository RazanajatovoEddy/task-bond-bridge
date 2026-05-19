import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/consultant/dashboard")({
  component: () => (
    <AuthGuard role="consultant">
      <ConsultantDashboard />
    </AuthGuard>
  ),
});

type Project = {
  id: string;
  title: string;
  status: string;
  type: string;
  created_at: string;
  company_profiles: { company_name: string } | null;
};

const statusLabel: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  waiting: "En attente",
  done: "Terminé",
};

function ConsultantDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("requests")
      .select("id, title, status, type, created_at, company_profiles(company_name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProjects((data as unknown as Project[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="consultant" />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Mes projets
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">Suivi des projets</h1>
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
        ) : projects.length === 0 ? (
          <div className="mt-10 rounded-md border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun projet ne vous est encore assigné.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                to="/consultant/projets/$id"
                params={{ id: p.id }}
                className="group flex flex-col justify-between rounded-md border border-border bg-card p-6 transition hover:border-primary"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                    <Badge variant="outline">{statusLabel[p.status] ?? p.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {p.company_profiles?.company_name ?? "—"}
                  </p>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Créé le {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
