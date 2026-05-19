import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ role }: { role: AppRole }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="border-b border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          Portail Agence IA
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {role === "consultant" ? (
            <>
              <Link to="/consultant/dashboard" className="text-foreground/70 hover:text-foreground">
                Projets
              </Link>
              <Link to="/consultant/indicateurs" className="text-foreground/70 hover:text-foreground">
                Indicateurs
              </Link>
            </>
          ) : (
            <>
              <Link to="/entreprise/dashboard" className="text-foreground/70 hover:text-foreground">
                Mes demandes
              </Link>
              <Link
                to="/entreprise/demandes/nouvelle"
                className="text-foreground/70 hover:text-foreground"
              >
                Nouvelle demande
              </Link>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Déconnexion
          </Button>
        </nav>
      </div>
    </header>
  );
}
