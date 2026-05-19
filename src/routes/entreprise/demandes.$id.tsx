import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { MessageThread } from "@/components/message-thread";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/entreprise/demandes/$id")({
  component: () => (
    <AuthGuard role="entreprise">
      <DemandeDetail />
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
};

const statusLabel: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  waiting: "En attente",
  done: "Terminé",
};

const typeLabel: Record<string, string> = {
  automation: "Automatisation",
  app: "Création d'app",
  other: "Autre",
};

function DemandeDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [req, setReq] = useState<Detail | null>(null);

  useEffect(() => {
    supabase
      .from("requests")
      .select("id, title, description, status, type, budget, deadline, priority, created_at")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setReq(data as Detail));
  }, [id]);

  if (!req || !user) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader role="entreprise" />
        <p className="mx-auto max-w-7xl px-6 py-12 text-sm text-muted-foreground">
          Chargement…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="entreprise" />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/entreprise/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Retour aux demandes
        </Link>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {typeLabel[req.type] ?? req.type}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{req.title}</h1>
          </div>
          <Badge variant="outline">{statusLabel[req.status] ?? req.status}</Badge>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Info label="Budget" value={req.budget ?? "—"} />
          <Info label="Échéance" value={req.deadline ? new Date(req.deadline).toLocaleDateString("fr-FR") : "—"} />
          <Info label="Priorité" value={req.priority ?? "—"} />
        </div>

        <div className="mt-10 rounded-md border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Description
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm">{req.description}</p>
        </div>

        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Échanges
          </h2>
          <MessageThread requestId={req.id} currentUserId={user.id} />
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
