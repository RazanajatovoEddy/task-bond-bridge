import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/entreprise/demandes/nouvelle")({
  component: () => (
    <AuthGuard role="entreprise">
      <NouvelleDemande />
    </AuthGuard>
  ),
});

const schema = z.object({
  title: z.string().trim().min(1).max(150),
  type: z.enum(["automation", "app", "other"]),
  description: z.string().trim().min(10).max(4000),
  budget: z.string().max(80).optional(),
  deadline: z.string().optional(),
  priority: z.string().optional(),
});

function NouvelleDemande() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "automation" as "automation" | "app" | "other",
    description: "",
    budget: "",
    deadline: "",
    priority: "normale",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error("Vérifiez les informations saisies");
      return;
    }
    setLoading(true);
    const { data: cp, error: cpErr } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (cpErr || !cp) {
      setLoading(false);
      toast.error("Profil entreprise introuvable");
      return;
    }
    const { data, error } = await supabase
      .from("requests")
      .insert({
        company_id: cp.id,
        title: form.title,
        type: form.type,
        description: form.description,
        budget: form.budget || null,
        deadline: form.deadline || null,
        priority: form.priority || null,
      })
      .select("id")
      .single();
    setLoading(false);
    if (error || !data) {
      toast.error(error?.message ?? "Erreur lors de la création");
      return;
    }
    toast.success("Demande créée");
    navigate({ to: "/entreprise/demandes/$id", params: { id: data.id } });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="entreprise" />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Nouvelle demande
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Décrire un besoin</h1>
        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div>
            <Label htmlFor="title">Titre du besoin</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              maxLength={150}
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automation">Automatisation</SelectItem>
                <SelectItem value="app">Création d'app</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={6}
              maxLength={4000}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="budget">Budget (optionnel)</Label>
              <Input
                id="budget"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="Ex. 5 000 €"
              />
            </div>
            <div>
              <Label htmlFor="deadline">Échéance</Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div>
              <Label>Priorité</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basse">Basse</SelectItem>
                  <SelectItem value="normale">Normale</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? "Envoi…" : "Soumettre la demande"}
          </Button>
        </form>
      </main>
    </div>
  );
}
