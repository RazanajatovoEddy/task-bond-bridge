import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-10">
        <Link
          to="/"
          className="rounded-md bg-accent px-4 py-2 text-xl font-bold tracking-tight text-accent-foreground"
        >
          OpsIA
        </Link>
        <nav className="hidden items-center gap-8 text-lg font-bold md:flex">
          <Link to="/entreprise" className="text-foreground/70 hover:text-foreground">
            Espace Entreprises
          </Link>
          <Link to="/consultant" className="text-foreground/70 hover:text-foreground">
            Espace Consultants
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/consultant/connexion"
            className="hidden text-lg font-bold text-foreground/70 hover:text-foreground sm:inline"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </header>
  );
}
