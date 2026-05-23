import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Trash2, Upload, FileText } from "lucide-react";

export type DocumentType =
  | "brief"
  | "specification"
  | "livrable"
  | "contrat"
  | "devis"
  | "facture"
  | "bon_de_commande"
  | "autre";

const TYPE_LABEL: Record<DocumentType, string> = {
  brief: "Brief",
  specification: "Spécification",
  livrable: "Livrable",
  contrat: "Contrat",
  devis: "Devis",
  facture: "Facture",
  bon_de_commande: "Bon de commande",
  autre: "Autre",
};

const SHARED: DocumentType[] = ["brief", "specification", "livrable", "autre"];

type Doc = {
  id: string;
  request_id: string;
  uploaded_by: string;
  document_type: DocumentType;
  name: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export function ProjectDocuments({
  requestId,
  currentUserId,
  canUpload,
  allowConfidential,
}: {
  requestId: string;
  currentUserId: string;
  canUpload: boolean;
  /** If false, the upload type selector only shows shared types (used by consultants — though they typically can't upload). */
  allowConfidential: boolean;
}) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<DocumentType>("autre");
  const fileInput = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_documents")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setDocs((data as Doc[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const docId = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${requestId}/${docId}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("project-documents")
      .upload(filePath, file, { contentType: file.type });
    if (upErr) {
      toast.error(`Upload : ${upErr.message}`);
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    const { error: insErr } = await supabase.from("project_documents").insert({
      id: docId,
      request_id: requestId,
      uploaded_by: currentUserId,
      document_type: docType,
      name: file.name,
      file_path: filePath,
      mime_type: file.type || null,
      size_bytes: file.size,
    });
    if (insErr) {
      await supabase.storage.from("project-documents").remove([filePath]);
      toast.error(insErr.message);
    } else {
      toast.success("Document ajouté");
      await fetchDocs();
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const onDownload = async (doc: Doc) => {
    const { data, error } = await supabase.storage
      .from("project-documents")
      .createSignedUrl(doc.file_path, 60);
    if (error || !data) return toast.error(error?.message ?? "Erreur");
    window.open(data.signedUrl, "_blank");
  };

  const onDelete = async (doc: Doc) => {
    if (!confirm(`Supprimer "${doc.name}" ?`)) return;
    const { error } = await supabase.from("project_documents").delete().eq("id", doc.id);
    if (error) return toast.error(error.message);
    await supabase.storage.from("project-documents").remove([doc.file_path]);
    toast.success("Supprimé");
    fetchDocs();
  };

  const availableTypes = allowConfidential
    ? (Object.keys(TYPE_LABEL) as DocumentType[])
    : SHARED;

  const formatSize = (b: number | null) => {
    if (!b) return "—";
    if (b < 1024) return `${b} o`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`;
    return `${(b / 1024 / 1024).toFixed(1)} Mo`;
  };

  return (
    <div className="rounded-md border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Documents
        </h2>
        {canUpload && (
          <div className="flex items-center gap-2">
            <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input ref={fileInput} type="file" className="hidden" onChange={onUpload} />
            <Button
              size="sm"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Envoi…" : "Ajouter"}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun document.</p>
        ) : (
          <ul className="divide-y divide-border">
            {docs.map((d) => {
              const isShared = SHARED.includes(d.document_type);
              const canDelete = d.uploaded_by === currentUserId || canUpload;
              return (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString("fr-FR")} · {formatSize(d.size_bytes)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isShared ? "outline" : "secondary"}>
                      {TYPE_LABEL[d.document_type]}
                      {!isShared ? " · Confidentiel" : ""}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => onDownload(d)} aria-label="Télécharger">
                      <Download className="h-4 w-4" />
                    </Button>
                    {canDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(d)} aria-label="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
