import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_my_requests",
  title: "Lister mes demandes (entreprise)",
  description:
    "Liste les demandes (projets) créées par l'entreprise de l'utilisateur connecté. Retourne titre, type, statut, priorité, dates.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Nombre max de demandes (défaut 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: cp } = await supabase
      .from("company_profiles")
      .select("id, company_name")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (!cp) {
      return {
        content: [{ type: "text", text: "Aucun profil entreprise associé à ce compte." }],
      };
    }
    const { data, error } = await supabase
      .from("requests")
      .select("id, title, type, status, priority, budget, deadline, created_at")
      .eq("company_id", cp.id)
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify({ company: cp.company_name, requests: data }, null, 2) }],
      structuredContent: { company: cp.company_name, requests: data },
    };
  },
});
