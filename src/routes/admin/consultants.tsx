import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { AdminHeader } from "@/components/admin-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/consultants")({
  component: () => (
    <AuthGuard role="admin">
      <ConsultantsList />
    </AuthGuard>
  ),
});

type Row = {
  id: string;
  first_name: string;
  last_name: string;
  specialties: string[];
  availability: string | null;
  is_active: boolean;
  created_at: string;
};

function ConsultantsList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("consultant_profiles")
      .select("id, first_name, last_name, specialties, availability, is_active, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Row[] | null) ?? []));
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        `${r.first_name} ${r.last_name}`.toLowerCase().includes(term) ||
        r.specialties.some((s) => s.toLowerCase().includes(term)),
    );
  }, [rows, q]);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Consultants</h1>
          <Input
            placeholder="Rechercher…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="mt-6 rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Spécialités</TableHead>
                <TableHead>Disponibilité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.first_name} {r.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.specialties.map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{r.availability ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.is_active ? "outline" : "secondary"}>
                      {r.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/admin/consultants/$id"
                      params={{ id: r.id }}
                      className="text-sm text-primary hover:underline"
                    >
                      Ouvrir
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Aucun consultant.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
