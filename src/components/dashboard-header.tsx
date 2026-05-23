import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function DashboardHeader({ role }: { role: AppRole }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const accountPath = role === "consultant" ? "/consultant/compte" : "/entreprise/compte";

  return (
    <header className="border-b border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          Portail Agence
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <span className="max-w-[180px] truncate">{user?.email ?? "Mon compte"}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={accountPath}>Mon Compte</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
