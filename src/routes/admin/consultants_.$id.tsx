import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { AdminHeader } from "@/components/admin-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/consultants_/$id")({
  component: () => (
    <AuthGuard role="admin">
      <ConsultantDetail />
    </AuthGuard>
  ),
});

const ALL_SPECIALTIES = [
  "IA Générative",
  "Data Engineering",
  "Data Science",
  "Automatisation",
  "Développement",
  "Cloud",
  "MLOps",
  "Conseil",
];

type Profile = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  specialties: string[];
  availability: string | null;
  is_active: boolean;
};

function ConsultantDetail() {
  const { id } = Route.useParams();
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("consultant_profiles")
      .select("id, user_id, first_name, last_name, specialties, availability, is_active")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setP(data as Profile | null));
  }, [id]);

  const save = async () => {
    if (!p) return;
    setSaving(true);
    const { error } = await supabase
      .from("consultant_profiles")
      .update({
        first_name: p.first_name,
        last_name: p.last_name,
        specialties: p.specialties,
        availability: p.availability,
        is_active: p.is_active,
      })
      .eq("id", p.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Enregistré");
  };

  const toggleSpec = (s: string) => {
    if (!p) return;
    setP({
      ...p,
      specialties: p.specialties.includes(s)
        ? p.specialties.filter((x) => x !== s)
        : [...p.specialties, s],
    });
  };

  if (!p) return <div className="p-12 text-sm text-muted-foreground">Chargement…</div>;

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/admin/consultants" className="text-sm text-muted-foreground hover:text-foreground">
          ← Retour
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          {p.first_name} {p.last_name}
        </h1>

        <div className="mt-8 space-y-6 rounded-md border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Prénom</Label>
              <Input
                value={p.first_name}
                onChange={(e) => setP({ ...p, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Nom</Label>
              <Input
                value={p.last_name}
                onChange={(e) => setP({ ...p, last_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Spécialités</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_SPECIALTIES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={p.specialties.includes(s)}
                    onCheckedChange={() => toggleSpec(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Disponibilité</Label>
            <Input
              value={p.availability ?? ""}
              onChange={(e) => setP({ ...p, availability: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Compte actif</p>
              <p className="text-xs text-muted-foreground">
                Désactiver empêche l'accès au portail.
              </p>
            </div>
            <Switch
              checked={p.is_active}
              onCheckedChange={(v) => setP({ ...p, is_active: v })}
            />
          </div>

          <Button onClick={save} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </main>
    </div>
  );
}
