import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { MessageThread } from "@/components/message-thread";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/consultant/projets/$id")({
  component: () => (
    <AuthGuard role="consultant">
      <ProjectDetail />
    </AuthGuard>
  ),
});

type Detail = {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  budget: string | null;
  deadline: string | null;
  priority: string | null;
  created_at: string;
  company_profiles: { company_name: string } | null;
};

const statusLabel: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  waiting: "En attente",
  done: "Terminé",
};

function ProjectDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Detail | null>(null);

  useEffect(() => {
    supabase
      .from("requests")
      .select(
        "id, title, description, status, type, budget, deadline, priority, created_at, company_profiles(company_name)",
      )
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setProject(data as unknown as Detail));
  }, [id]);

  if (!project || !user) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader role="consultant" />
        <p className="mx-auto max-w-7xl px-6 py-12 text-sm text-muted-foreground">
          Chargement…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="consultant" />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/consultant/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Retour aux projets
        </Link>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {project.company_profiles?.company_name ?? "—"}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{project.title}</h1>
          </div>
          <Badge variant="outline">{statusLabel[project.status] ?? project.status}</Badge>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Info label="Type" value={project.type} />
          <Info label="Échéance" value={project.deadline ? new Date(project.deadline).toLocaleDateString("fr-FR") : "—"} />
          <Info label="Priorité" value={project.priority ?? "—"} />
        </div>

        <div className="mt-10 rounded-md border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Résumé
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm">{project.description}</p>
        </div>

        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Échanges
          </h2>
          <MessageThread requestId={project.id} currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium capitalize">{value}</p>
    </div>
  );
}
