import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string; client_uri?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: unknown }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: unknown }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: unknown }>;
};

function oauthNs(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  component: ConsentPage,
});

function ConsentPage() {
  const { authorization_id } = Route.useSearch();
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "needs-auth" }
    | { kind: "ready"; details: AuthorizationDetails }
    | { kind: "error"; message: string }
  >({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      if (!authorization_id) {
        setState({ kind: "error", message: "authorization_id manquant." });
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setState({ kind: "needs-auth" });
        return;
      }
      try {
        const { data, error } = await oauthNs().getAuthorizationDetails(authorization_id);
        if (error) throw error;
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setState({ kind: "ready", details: data ?? {} });
      } catch (e) {
        setState({ kind: "error", message: (e as Error)?.message ?? "Erreur inattendue." });
      }
    })();
  }, [authorization_id]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setState({ kind: "error", message: error.message });
      return;
    }
    setState({ kind: "loading" });
    // Trigger the effect again by reloading the same URL.
    window.location.reload();
  }

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauthNs().approveAuthorization(authorization_id)
      : await oauthNs().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setState({ kind: "error", message: (error as Error)?.message ?? "Erreur." });
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setState({ kind: "error", message: "Redirection manquante." });
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">OpsIA — Autorisation</p>

      {state.kind === "loading" && <p className="mt-6 text-sm text-muted-foreground">Chargement…</p>}

      {state.kind === "error" && (
        <div className="mt-6">
          <h1 className="text-xl font-semibold">Erreur</h1>
          <p className="mt-2 text-sm text-destructive">{state.message}</p>
        </div>
      )}

      {state.kind === "needs-auth" && (
        <div className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight">Connectez-vous pour continuer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Une application demande à se connecter à votre compte OpsIA.
          </p>
          <form onSubmit={signIn} className="mt-6 space-y-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              required
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      )}

      {state.kind === "ready" && (
        <div className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Connecter {state.details.client?.name ?? "cette application"} à votre compte
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Cette application pourra appeler les outils OpsIA en votre nom. Les règles d'accès
            (RLS) de votre compte restent appliquées.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => decide(true)}
              disabled={busy}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Autoriser
            </button>
            <button
              type="button"
              onClick={() => decide(false)}
              disabled={busy}
              className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Refuser
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
