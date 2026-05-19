import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/entreprise/dashboard")({
  component: () => (
    <AuthGuard role="entreprise">
      <EntrepriseDashboard />
    </AuthGuard>
  ),
});

type Req = {
  id: string;
  title: string;
  type: string;
  status: string;
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

function EntrepriseDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("requests")
      .select("id, title, type, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRequests((data as Req[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="entreprise" />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Mes demandes
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">Suivi des demandes</h1>
          </div>
          <Link to="/entreprise/demandes/nouvelle">
            <Button>Créer une demande</Button>
          </Link>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
        ) : requests.length === 0 ? (
          <div className="mt-10 rounded-md border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas encore déposé de demande.
            </p>
            <Link to="/entreprise/demandes/nouvelle" className="mt-4 inline-block">
              <Button>Créer ma première demande</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((r) => (
              <Link
                key={r.id}
                to="/entreprise/demandes/$id"
                params={{ id: r.id }}
                className="group flex flex-col justify-between rounded-md border border-border bg-card p-6 transition hover:border-primary"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">{r.title}</h3>
                    <Badge variant="outline">{statusLabel[r.status] ?? r.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {typeLabel[r.type] ?? r.type}
                  </p>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Créée le {new Date(r.created_at).toLocaleDateString("fr-FR")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
