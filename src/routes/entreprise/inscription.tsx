import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { toast } from "sonner";

export const Route = createFileRoute("/entreprise/inscription")({
  component: EntrepriseSignup,
});

const schema = z.object({
  companyName: z.string().trim().min(1).max(150),
  contactName: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  phone: z.string().max(40).optional().or(z.literal("")),
});

function EntrepriseSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    phone: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error("Vérifiez les informations saisies");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/entreprise/dashboard`,
        data: {
          signup_role: "entreprise",
          company_name: form.companyName,
          contact_name: form.contactName,
          phone: form.phone || null,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Compte créé. Vérifiez votre email pour confirmer.");
    navigate({ to: "/entreprise/connexion" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Espace Entreprise
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Créer mon compte</h1>
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
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone (optionnel)</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création…" : "Créer mon compte"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/entreprise/connexion" className="underline">
              Se connecter
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
