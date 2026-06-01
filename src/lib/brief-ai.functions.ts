import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  type: z.enum(["automation", "app", "other"]),
  description: z.string().trim().min(5).max(4000),
});

const SYSTEM_PROMPT = `Tu es un consultant senior d'une agence IA & automatisation. Tu reformules un besoin brut d'entreprise en cahier des charges clair, structuré et actionnable.

Réponds en français, en Markdown, dans EXACTEMENT cette structure :

## Objectif
Une phrase qui capture le résultat business visé.

## Contexte & enjeux
2-3 puces sur le pourquoi et la valeur attendue.

## Périmètre fonctionnel
4-6 puces décrivant les fonctionnalités / étapes clés. Sois concret.

## Livrables
3-5 puces (ex: application web, intégration API X, documentation, formation…).

## Indicateurs de succès (KPIs)
3 puces mesurables (chiffres, %, temps gagné…).

## Questions à clarifier
3-4 questions ouvertes utiles à poser à l'entreprise avant de chiffrer.

Reste factuel, évite le jargon marketing, n'invente pas de chiffres précis si non fournis.`;

export const generateBrief = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY manquant");
    }

    const typeLabel =
      data.type === "automation"
        ? "Automatisation"
        : data.type === "app"
          ? "Création d'application"
          : "Autre";

    const userPrompt = `Titre du besoin : ${data.title}
Type : ${typeLabel}

Description brute fournie par l'entreprise :
"""
${data.description}
"""

Génère le brief structuré.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (response.status === 429) {
      throw new Error("Trop de requêtes. Réessayez dans quelques instants.");
    }
    if (response.status === 402) {
      throw new Error("Crédits IA épuisés. Contactez l'administrateur.");
    }
    if (!response.ok) {
      const txt = await response.text();
      console.error("AI Gateway error", response.status, txt);
      throw new Error("Impossible de générer le brief pour le moment.");
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Réponse IA vide");

    return { brief: content };
  });
