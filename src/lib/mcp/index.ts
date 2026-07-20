import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyRequests from "./tools/list-my-requests";
import listMyProjects from "./tools/list-my-projects";
import getProject from "./tools/get-project";
import postMessage from "./tools/post-message";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "opsia-mcp",
  title: "OpsIA — Portail Agence",
  version: "0.1.0",
  instructions:
    "Outils pour interagir avec OpsIA en tant qu'utilisateur connecté (consultant ou entreprise). Permet de lister ses projets/demandes, consulter les détails et poster des messages. Les données restent filtrées par les règles RLS selon le rôle.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMyRequests, listMyProjects, getProject, postMessage],
});
