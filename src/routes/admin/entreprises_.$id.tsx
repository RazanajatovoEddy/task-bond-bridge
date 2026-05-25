import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { AdminHeader } from "@/components/admin-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/entreprises/$id")({
  component: () => (
    <AuthGuard role="admin">
      <EntrepriseDetail />
    </AuthGuard>
  ),
});

type Company = {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  is_active: boolean;
};

type Project = { id: string; title: string; status: string };

function EntrepriseDetail() {
  const { id } = Route.useParams();
  const [c, setC] = useState<Company | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("company_profiles")
      .select("id, company_name, contact_name, phone, is_active")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setC(data as Company | null));
    supabase
      .from("requests")
      .select("id, title, status")
      .eq("company_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setProjects((data as Project[] | null) ?? []));
  }, [id]);

  const save = async () => {
    if (!c) return;
    setSaving(true);
    const { error } = await supabase
      .from("company_profiles")
      .update({
        company_name: c.company_name,
        contact_name: c.contact_name,
        phone: c.phone,
        is_active: c.is_active,
      })
      .eq("id", c.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Enregistré");
  };

  if (!c) return <div className="p-12 text-sm text-muted-foreground">Chargement…</div>;

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/admin/entreprises" className="text-sm text-muted-foreground hover:text-foreground">
          ← Retour
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{c.company_name}</h1>

        <div className="mt-8 space-y-4 rounded-md border border-border bg-card p-6">
          <div>
            <Label>Nom de l'entreprise</Label>
            <Input
              value={c.company_name}
              onChange={(e) => setC({ ...c, company_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Contact</Label>
            <Input
              value={c.contact_name}
              onChange={(e) => setC({ ...c, contact_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input
              value={c.phone ?? ""}
              onChange={(e) => setC({ ...c, phone: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Compte actif</p>
            </div>
            <Switch checked={c.is_active} onCheckedChange={(v) => setC({ ...c, is_active: v })} />
          </div>
          <Button onClick={save} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Projets ({projects.length})
          </h2>
          <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <Link
                  to="/admin/projets/$id"
                  params={{ id: p.id }}
                  className="text-sm font-medium hover:underline"
                >
                  {p.title}
                </Link>
                <Badge variant="outline">{p.status}</Badge>
              </li>
            ))}
            {projects.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Aucun projet.
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
