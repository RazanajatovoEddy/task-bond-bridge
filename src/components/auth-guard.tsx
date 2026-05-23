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
      const target =
        requiredRole === "consultant"
          ? "/consultant/connexion"
          : requiredRole === "entreprise"
            ? "/entreprise/connexion"
            : "/entreprise/connexion";
      navigate({ to: target });
      return;
    }
    if (role && role !== requiredRole) {
      const fallback =
        role === "admin"
          ? "/admin"
          : role === "consultant"
            ? "/consultant/dashboard"
            : "/entreprise/dashboard";
      navigate({ to: fallback });
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
