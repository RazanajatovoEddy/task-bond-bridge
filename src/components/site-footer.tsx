export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-10 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Portail Agence IA — Studio IA & Automatisation</p>
        <p>// agence-ia</p>
      </div>
    </footer>
  );
}
