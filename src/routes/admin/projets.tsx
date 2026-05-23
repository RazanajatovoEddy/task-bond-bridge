import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth-guard";
import { AdminHeader } from "@/components/admin-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/projets")({
  component: () => (
    <AuthGuard role="admin">
      <ProjectsList />
    </AuthGuard>
  ),
});

type Row = {
  id: string;
  title: string;
  status: string;
  type: string;
  deadline: string | null;
  created_at: string;
  company_profiles: { company_name: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  waiting: "En attente",
  done: "Terminé",
};

function ProjectsList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    supabase
      .from("requests")
      .select("id, title, status, type, deadline, created_at, company_profiles(company_name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as unknown as Row[] | null) ?? []));
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!term) return true;
      return (
        r.title.toLowerCase().includes(term) ||
        (r.company_profiles?.company_name ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, q, statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Projets</h1>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Rechercher…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="new">Nouveau</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="waiting">En attente</SelectItem>
              <SelectItem value="done">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{r.company_profiles?.company_name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{r.type}</TableCell>
                  <TableCell className="text-sm">
                    {r.deadline ? new Date(r.deadline).toLocaleDateString("fr-FR") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/admin/projets/$id"
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
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Aucun projet.
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
