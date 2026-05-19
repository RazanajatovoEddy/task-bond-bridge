import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6">
        {/* HERO */}
        <section className="grid gap-12 py-20 md:grid-cols-12 md:py-32">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Mission // Agence
            </p>
            <div className="mt-12 max-w-sm rounded-md bg-accent p-8">
              <p className="text-sm font-semibold">forge®</p>
              <p className="mt-4 text-sm leading-relaxed">
                Nous concevons et déployons l'IA, l'automatisation et les applications
                sur mesure pour les équipes qui veulent aller vite.
              </p>
              <p className="mt-6 text-sm font-semibold">
                De l'idée au déploiement en moins de 90 jours.
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
              Concevoir<br />des solutions IA<br />qui passent<br />à l'échelle
            </h1>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/consultant"
                className="group inline-flex items-center justify-between gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Espace Consultant
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/entreprise"
                className="group inline-flex items-center justify-between gap-3 rounded-full border border-primary bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:bg-primary hover:text-primary-foreground"
              >
                Espace Entreprise
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Watermark */}
        <div className="-mt-12 hidden select-none overflow-hidden md:block">
          <p className="text-[18vw] font-bold leading-none tracking-tighter text-foreground/5">
            agence
          </p>
        </div>

        {/* SERVICES */}
        <section className="border-t border-border/60 py-20">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Services
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Ce que nous construisons
              </h2>
            </div>
            <div className="grid gap-px bg-border md:col-span-8 md:grid-cols-2">
              {[
                {
                  t: "Automatisation",
                  d: "Workflows internes, intégrations no-code et scripts qui éliminent le travail répétitif.",
                },
                {
                  t: "Applications sur mesure",
                  d: "Web apps, portails clients, outils internes — design + dev livrés en sprints courts.",
                },
                {
                  t: "Intelligence artificielle",
                  d: "Chatbots, assistants documentaires, RAG, scoring — branchés sur vos données.",
                },
                {
                  t: "Data & dashboards",
                  d: "Pipelines, tableaux de bord, indicateurs métier connectés à vos outils.",
                },
              ].map((s) => (
                <div key={s.t} className="bg-background p-8">
                  <h3 className="text-lg font-semibold">{s.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/60 py-20">
          <div className="grid gap-8 md:grid-cols-2">
            <Link
              to="/consultant"
              className="group flex flex-col justify-between rounded-md border border-border bg-card p-8 transition hover:bg-primary hover:text-primary-foreground"
            >
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70">01</p>
                <h3 className="mt-4 text-2xl font-bold">Consultants</h3>
                <p className="mt-2 text-sm opacity-80">
                  Suivez vos projets, vos indicateurs et échangez avec vos clients.
                </p>
              </div>
              <ArrowRight className="mt-8 h-6 w-6 transition group-hover:translate-x-2" />
            </Link>
            <Link
              to="/entreprise"
              className="group flex flex-col justify-between rounded-md border border-border bg-card p-8 transition hover:bg-primary hover:text-primary-foreground"
            >
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70">02</p>
                <h3 className="mt-4 text-2xl font-bold">Entreprises</h3>
                <p className="mt-2 text-sm opacity-80">
                  Déposez un besoin en 2 minutes et suivez son avancement en temps réel.
                </p>
              </div>
              <ArrowRight className="mt-8 h-6 w-6 transition group-hover:translate-x-2" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
