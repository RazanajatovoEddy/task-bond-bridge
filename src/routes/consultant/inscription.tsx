import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteHeader } from "@/components/site-header";
import { toast } from "sonner";

const SPECIALTIES = [
  { value: "automation", label: "Automatisation" },
  { value: "dev", label: "Développement" },
  { value: "data", label: "Data" },
  { value: "ia", label: "IA" },
  { value: "nocode", label: "No-code" },
];

export const Route = createFileRoute("/consultant/inscription")({
  component: ConsultantSignup,
});

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  specialty: z.array(z.string()).min(1),
  availability: z.string().max(80).optional().or(z.literal("")),
});

function ConsultantSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    specialty: string[];
    availability: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialty: [],
    availability: "",
  });

  const toggleSpecialty = (value: string, checked: boolean) => {
    setForm((f) => ({
      ...f,
      specialty: checked
        ? [...f.specialty, value]
        : f.specialty.filter((v) => v !== value),
    }));
  };

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
        emailRedirectTo: `${window.location.origin}/consultant/dashboard`,
        data: {
          signup_role: "consultant",
          first_name: form.firstName,
          last_name: form.lastName,
          specialties: form.specialty,
          availability: form.availability || null,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Compte créé. Vérifiez votre email pour confirmer.");
    navigate({ to: "/consultant/connexion" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Espace Consultant
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Créer mon compte</h1>
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
            <Label>Spécialité(s)</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SPECIALTIES.map((s) => {
                const checked = form.specialty.includes(s.value);
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
            <Label htmlFor="availability">Disponibilité (optionnel)</Label>
            <Input
              id="availability"
              placeholder="Ex. 3j/semaine"
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création…" : "Créer mon compte"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/consultant/connexion" className="underline">
              Se connecter
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
