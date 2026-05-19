import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          Portail Agence
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/consultant" className="text-foreground/70 hover:text-foreground">
            Consultants
          </Link>
          <Link to="/entreprise" className="text-foreground/70 hover:text-foreground">
            Entreprises
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/consultant/connexion"
            className="hidden text-sm text-foreground/70 hover:text-foreground sm:inline"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </header>
  );
}
