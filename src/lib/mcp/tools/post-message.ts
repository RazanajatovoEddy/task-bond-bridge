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
  name: "post_message",
  title: "Publier un message sur un projet",
  description:
    "Poste un message dans le fil de discussion d'un projet/demande. L'utilisateur doit être membre du projet ou l'entreprise propriétaire.",
  inputSchema: {
    request_id: z.string().uuid().describe("ID du projet/demande."),
    content: z.string().trim().min(1).max(4000).describe("Contenu du message."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ request_id, content }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("messages")
      .insert({ request_id, sender_id: ctx.getUserId(), content })
      .select("id, created_at")
      .single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Message publié (id ${data.id})` }],
      structuredContent: data,
    };
  },
});
