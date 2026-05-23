import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const SPECIALTIES = [
  { value: "automation", label: "Automatisation" },
  { value: "dev", label: "Développement" },
  { value: "data", label: "Data" },
  { value: "ia", label: "IA" },
  { value: "nocode", label: "No-code" },
];

export const Route = createFileRoute("/consultant/compte")({
  component: () => (
    <AuthGuard role="consultant">
      <ConsultantAccount />
    </AuthGuard>
  ),
});

function ConsultantAccount() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    specialties: [] as string[],
    availability: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("consultant_profiles")
      .select("first_name, last_name, specialties, availability")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            firstName: data.first_name ?? "",
            lastName: data.last_name ?? "",
            specialties: (data.specialties as string[] | null) ?? [],
            availability: data.availability ?? "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const toggleSpecialty = (value: string, checked: boolean) => {
    setForm((f) => ({
      ...f,
      specialties: checked
        ? [...f.specialties, value]
        : f.specialties.filter((v) => v !== value),
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.specialties.length === 0) {
      toast.error("Sélectionnez au moins une spécialité");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("consultant_profiles")
      .update({
        first_name: form.firstName,
        last_name: form.lastName,
        specialties: form.specialties,
        availability: form.availability || null,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la mise à jour");
      return;
    }
    toast.success("Profil mis à jour");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="consultant" />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Espace Consultant</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Mon Compte</h1>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div>
              <Label>Spécialité(s)</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {SPECIALTIES.map((s) => {
                  const checked = form.specialties.includes(s.value);
                  return (
                    <label
                      key={s.value}
                      className="flex items-center gap-2 rounded-md border border-input px-3 py-2 cursor-pointer hover:bg-muted"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => toggleSpecialty(s.value, c === true)}
                      />
                      <span className="text-sm">{s.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <Label htmlFor="availability">Disponibilité</Label>
              <Input
                id="availability"
                placeholder="Ex. 3j/semaine"
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
