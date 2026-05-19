import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/consultant/")({
  component: ConsultantLanding,
});

function ConsultantLanding() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Espace Consultant
        </p>
        <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Pilotez vos<br />projets clients.
        </h1>
        <p className="mt-8 max-w-xl text-base text-muted-foreground">
          Suivi des projets, indicateurs clés, échanges centralisés. Tout ce dont vous
          avez besoin pour livrer plus vite et avec plus de clarté.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/consultant/inscription"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Créer un compte
          </Link>
          <Link
            to="/consultant/connexion"
            className="rounded-full border border-primary px-6 py-3 text-sm font-medium hover:bg-primary hover:text-primary-foreground"
          >
            Se connecter
          </Link>
        </div>

        <div className="mt-24 grid gap-px bg-border md:grid-cols-3">
          {[
            { t: "Projets", d: "Visualisez vos missions, statuts et jalons." },
            { t: "Indicateurs", d: "KPIs et graphiques sur votre activité." },
            { t: "Échanges", d: "Fil de discussion par projet avec les clients." },
          ].map((b) => (
            <div key={b.t} className="bg-background p-8">
              <h3 className="text-lg font-semibold">{b.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
