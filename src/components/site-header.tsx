import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-10">
        <Link
          to="/"
          className="relative rounded-md bg-accent px-6 py-3 text-4xl font-bold tracking-tight text-accent-foreground"
        >
          OpsIA
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent-foreground text-[10px] font-bold leading-none text-accent-foreground">
            R
          </span>
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
