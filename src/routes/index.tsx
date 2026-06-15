import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: Index,
});

const STATS = [
  { value: "40+", label: "projets livrés" },
  { value: "90j", label: "délai moyen de mise en prod" },
  { value: "12", label: "consultants experts" },
  { value: "98%", label: "satisfaction client" },
];

const LOGOS = ["Northwind", "Acme Labs", "Helios", "Atlas Group", "Vertex", "Lumen"];

const CASES = [
  {
    sector: "Scale-up SaaS",
    title: "Onboarding client automatisé",
    metric: "-80%",
    metricLabel: "de temps passé par compte",
    summary:
      "Workflow d'onboarding intégré au CRM : création de l'environnement, envoi des accès et suivi en temps réel.",
    tags: ["Automatisation", "Intégrations API"],
  },
  {
    sector: "ETI industrielle",
    title: "Portail fournisseurs sur mesure",
    metric: "6 sem.",
    metricLabel: "de la maquette à la prod",
    summary:
      "Application web pour 200+ fournisseurs : dépôt de devis, suivi commandes, dashboard achat.",
    tags: ["App sur mesure", "Data"],
  },
];

const METHOD = [
  {
    n: "01",
    t: "Cadrage",
    d: "Atelier de découverte, brief structuré, premiers indicateurs de succès.",
  },
  {
    n: "02",
    t: "Prototype",
    d: "Maquette interactive en 1-2 semaines pour valider la valeur avant de coder.",
  },
  {
    n: "03",
    t: "Build",
    d: "Sprints courts, livraisons hebdo, accès permanent au tableau de bord projet.",
  },
  {
    n: "04",
    t: "Déploiement",
    d: "Mise en production, formation des équipes, documentation technique.",
  },
  {
    n: "05",
    t: "Run & itération",
    d: "Monitoring, support et évolutions pilotés par les KPIs définis au cadrage.",
  },
];

const FAQ = [
  {
    q: "Combien de temps prend un projet type ?",
    a: "Entre 2 et 12 semaines selon le périmètre. Une automatisation simple part de 2 semaines, une application sur mesure complète tourne autour de 8 à 12 semaines.",
  },
  {
    q: "Comment êtes-vous rémunérés ?",
    a: "Forfait par phase (cadrage, prototype, build) ou régie selon la nature du projet. Le brief IA disponible dans votre espace entreprise génère un premier ordre de grandeur.",
  },
  {
    q: "À qui appartient le code livré ?",
    a: "100% du code source, des accès et de la documentation vous reviennent. Aucun lock-in propriétaire.",
  },
  {
    q: "Comment garantissez-vous la confidentialité de nos données ?",
    a: "NDA systématique, hébergement européen, aucun entraînement de modèle sur vos données, conformité RGPD.",
  },
  {
    q: "Travaillez-vous avec nos équipes internes ?",
    a: "Oui — la plupart de nos projets sont menés en binôme avec un référent côté client. Vous suivez l'avancement en direct via votre dashboard.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6">
        {/* HERO */}
        <section className="grid gap-12 py-20 md:grid-cols-12 md:py-32">
          <div className="md:col-span-4">
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

          <div className="md:col-span-8">
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Externalisez vos opérations<br />à la génération<br />d'experts nés avec l'IA
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

        {/* STATS */}
        <section className="border-t border-border/60 py-16">
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-background p-8">
                <p className="text-4xl font-bold tracking-tight md:text-5xl">{s.value}</p>
                <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TRUSTED BY */}
        <section className="border-t border-border/60 py-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Ils nous font confiance
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {LOGOS.map((name) => (
              <div
                key={name}
                className="flex h-14 items-center justify-center rounded-md border border-border/60 text-sm font-semibold tracking-tight text-muted-foreground transition hover:text-foreground"
              >
                {name}
              </div>
            ))}
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

        {/* CASE STUDIES */}
        <section className="border-t border-border/60 py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Cas clients
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Des résultats mesurables
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Sélection anonymisée de projets récents. Cas complets disponibles sur demande
              sous NDA.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {CASES.map((c) => (
              <article
                key={c.title}
                className="flex flex-col justify-between rounded-md border border-border bg-card p-8 transition hover:border-primary"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {c.sector}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight">{c.title}</h3>
                  <p className="mt-4 text-sm text-muted-foreground">{c.summary}</p>
                </div>
                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-4xl font-bold tracking-tight">{c.metric}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.metricLabel}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border px-3 py-1 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* METHODOLOGY */}
        <section className="border-t border-border/60 py-20">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Méthodologie
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Cinq étapes,<br />zéro effet tunnel
              </h2>
              <p className="mt-6 text-sm text-muted-foreground">
                Vous suivez chaque étape depuis votre dashboard. Pas de surprise, pas de
                slide de fin de projet.
              </p>
            </div>
            <ol className="md:col-span-8">
              {METHOD.map((s) => (
                <li
                  key={s.n}
                  className="grid grid-cols-[auto_1fr] gap-6 border-t border-border/60 py-6 first:border-t-0"
                >
                  <span className="text-sm font-semibold tracking-widest text-muted-foreground">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.t}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* AI BRIEF TEASER */}
        <section className="border-t border-border/60 py-20">
          <div className="rounded-md bg-accent p-10 md:p-16">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" />
              Nouveau · Brief assisté par IA
            </div>
            <h2 className="mt-6 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
              Décrivez votre besoin en 2 lignes,<br />récupérez un cahier des charges
              structuré.
            </h2>
            <p className="mt-6 max-w-xl text-sm">
              Côté entreprise, notre assistant reformule votre demande en objectif,
              périmètre, livrables et KPIs prêts à partager en interne.
            </p>
            <Link
              to="/entreprise/inscription"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Essayer le brief IA
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* CTA DOUBLE */}
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

        {/* FAQ */}
        <section className="border-t border-border/60 py-20">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                FAQ
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Questions fréquentes
              </h2>
            </div>
            <div className="md:col-span-8">
              <Accordion type="single" collapsible className="w-full">
                {FAQ.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-base font-semibold">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
