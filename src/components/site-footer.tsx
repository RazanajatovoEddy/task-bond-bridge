import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-lg font-semibold tracking-tight">Portail Agence</p>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Studio IA, automatisation et applications sur mesure. De l'idée au
              déploiement en moins de 90 jours.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/entreprise/inscription"
                className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Déposer un besoin
              </Link>
              <Link
                to="/consultant/inscription"
                className="rounded-full border border-primary px-4 py-2 text-xs font-medium hover:bg-primary hover:text-primary-foreground"
              >
                Rejoindre les consultants
              </Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Plateforme
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/entreprise" className="hover:underline">
                  Espace Entreprise
                </Link>
              </li>
              <li>
                <Link to="/consultant" className="hover:underline">
                  Espace Consultant
                </Link>
              </li>
              <li>
                <Link to="/entreprise/connexion" className="hover:underline">
                  Se connecter
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Expertises
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Automatisation</li>
              <li>Applications sur mesure</li>
              <li>Intelligence artificielle</li>
              <li>Data & dashboards</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Contact
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="mailto:hello@agence.ai" className="hover:underline">
                  hello@agence.ai
                </a>
              </li>
              <li className="text-muted-foreground">Paris · Remote</li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Disponibles pour de nouveaux projets
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {year} Portail Agence — Studio IA & Automatisation</p>
          <div className="flex gap-4">
            <span>Mentions légales</span>
            <span>Confidentialité</span>
            <span>// agence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
