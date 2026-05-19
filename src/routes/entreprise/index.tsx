import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/entreprise/")({
  component: EntrepriseLanding,
});

function EntrepriseLanding() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Espace Entreprise
        </p>
        <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Déposez un besoin<br />en 2 minutes.
        </h1>
        <p className="mt-8 max-w-xl text-base text-muted-foreground">
          Décrivez votre projet — automatisation, application ou solution IA — et suivez
          son avancement avec nos consultants depuis votre tableau de bord.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/entreprise/inscription"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Créer un compte
          </Link>
          <Link
            to="/entreprise/connexion"
            className="rounded-full border border-primary px-6 py-3 text-sm font-medium hover:bg-primary hover:text-primary-foreground"
          >
            Se connecter
          </Link>
        </div>

        <div className="mt-24 rounded-md bg-accent p-10">
          <p className="text-sm font-semibold">// Comment ça marche</p>
          <ol className="mt-6 grid gap-4 text-sm md:grid-cols-3">
            <li><strong>1.</strong> Créez votre compte entreprise.</li>
            <li><strong>2.</strong> Décrivez votre besoin via le formulaire.</li>
            <li><strong>3.</strong> Échangez avec nos consultants et suivez l'avancement.</li>
          </ol>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
