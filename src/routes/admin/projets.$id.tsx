import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { AdminHeader } from "@/components/admin-header";
import { useAuth } from "@/hooks/use-auth";
import { ProjectDocuments } from "@/components/project-documents";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/projets/$id")({
  component: () => (
    <AuthGuard role="admin">
      <ProjectAdminDetail />
    </AuthGuard>
  ),
});

type Project = {
  id: string;
  title: string;
  description: string;
  status: "new" | "in_progress" | "waiting" | "done";
  type: string;
  budget: string | null;
  deadline: string | null;
  priority: string | null;
  company_profiles: { id: string; company_name: string; contact_name: string } | null;
};

type Consultant = { id: string; first_name: string; last_name: string };

const STATUS_LABEL: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  waiting: "En attente",
  done: "Terminé",
};

function ProjectAdminDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());
  const [savingTeam, setSavingTeam] = useState(false);

  const load = async () => {
    const { data: p } = await supabase
      .from("requests")
      .select(
        "id, title, description, status, type, budget, deadline, priority, company_profiles(id, company_name, contact_name)",
      )
      .eq("id", id)
      .maybeSingle();
    setProject(p as unknown as Project);

    const { data: c } = await supabase
      .from("consultant_profiles")
      .select("id, first_name, last_name")
      .eq("is_active", true)
      .order("last_name");
    setConsultants((c as Consultant[] | null) ?? []);

    const { data: m } = await supabase
      .from("project_members")
      .select("consultant_id")
      .eq("request_id", id);
    setMemberIds(new Set((m ?? []).map((x: { consultant_id: string }) => x.consultant_id)));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleMember = (cid: string) => {
    const next = new Set(memberIds);
    if (next.has(cid)) next.delete(cid);
    else next.add(cid);
    setMemberIds(next);
  };

  const saveTeam = async () => {
    setSavingTeam(true);
    const { data: existing } = await supabase
      .from("project_members")
      .select("consultant_id")
      .eq("request_id", id);
    const existingIds = new Set((existing ?? []).map((x: { consultant_id: string }) => x.consultant_id));
    const toAdd = [...memberIds].filter((x) => !existingIds.has(x));
    const toRemove = [...existingIds].filter((x) => !memberIds.has(x));

    if (toAdd.length) {
      const { error } = await supabase
        .from("project_members")
        .insert(toAdd.map((cid) => ({ request_id: id, consultant_id: cid })));
      if (error) {
        toast.error(error.message);
        setSavingTeam(false);
        return;
      }
    }
    if (toRemove.length) {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("request_id", id)
        .in("consultant_id", toRemove);
      if (error) {
        toast.error(error.message);
        setSavingTeam(false);
        return;
      }
    }
    setSavingTeam(false);
    toast.success("Équipe mise à jour");
  };

  const updateStatus = async (status: Project["status"]) => {
    if (!project) return;
    const { error } = await supabase.from("requests").update({ status }).eq("id", project.id);
    if (error) toast.error(error.message);
    else {
      setProject({ ...project, status });
      toast.success("Statut mis à jour");
    }
  };

  if (!project || !user) {
    return <div className="p-12 text-sm text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/admin/projets" className="text-sm text-muted-foreground hover:text-foreground">
          ← Retour aux projets
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {project.company_profiles?.company_name ?? "—"}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{project.title}</h1>
          </div>
          <Badge variant="outline">{STATUS_LABEL[project.status] ?? project.status}</Badge>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Type" value={project.type} />
          <Info label="Budget" value={project.budget ?? "—"} confidential />
          <Info label="Échéance" value={project.deadline ? new Date(project.deadline).toLocaleDateString("fr-FR") : "—"} />
          <Info label="Priorité" value={project.priority ?? "—"} />
        </div>

        <div className="mt-8 rounded-md border border-border bg-card p-6">
          <Label>Statut</Label>
          <Select value={project.status} onValueChange={(v) => updateStatus(v as Project["status"])}>
            <SelectTrigger className="mt-2 w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Nouveau</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="waiting">En attente</SelectItem>
              <SelectItem value="done">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 rounded-md border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Description
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm">{project.description}</p>
        </div>

        <div className="mt-6 rounded-md border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Équipe affectée
            </h2>
            <Button size="sm" onClick={saveTeam} disabled={savingTeam}>
              {savingTeam ? "Enregistrement…" : "Enregistrer l'équipe"}
            </Button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {consultants.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                <Checkbox
                  checked={memberIds.has(c.id)}
                  onCheckedChange={() => toggleMember(c.id)}
                />
                {c.first_name} {c.last_name}
              </label>
            ))}
            {consultants.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun consultant actif.</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <ProjectDocuments
            requestId={project.id}
            currentUserId={user.id}
            canUpload
            allowConfidential
          />
        </div>
      </main>
    </div>
  );
}

function Info({ label, value, confidential }: { label: string; value: string; confidential?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        {confidential && <Badge variant="secondary" className="text-[10px]">Confidentiel</Badge>}
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
