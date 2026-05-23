import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/entreprise/compte")({
  component: () => (
    <AuthGuard role="entreprise">
      <EntrepriseAccount />
    </AuthGuard>
  ),
});

function EntrepriseAccount() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("company_profiles")
      .select("company_name, contact_name, phone")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            companyName: data.company_name ?? "",
            contactName: data.contact_name ?? "",
            phone: data.phone ?? "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("company_profiles")
      .update({
        company_name: form.companyName,
        contact_name: form.contactName,
        phone: form.phone || null,
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
      <DashboardHeader role="entreprise" />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Espace Entreprise</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Mon Compte</h1>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactName">Nom du contact</Label>
              <Input
                id="contactName"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
