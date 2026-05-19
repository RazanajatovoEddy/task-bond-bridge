import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/hooks/use-auth";

export function AuthGuard({
  role: requiredRole,
  children,
}: {
  role: AppRole;
  children: ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({
        to: requiredRole === "consultant" ? "/consultant/connexion" : "/entreprise/connexion",
      });
      return;
    }
    if (role && role !== requiredRole) {
      navigate({
        to: role === "consultant" ? "/consultant/dashboard" : "/entreprise/dashboard",
      });
    }
  }, [user, role, loading, requiredRole, navigate]);

  if (loading || !user || role !== requiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }

  return <>{children}</>;
}
