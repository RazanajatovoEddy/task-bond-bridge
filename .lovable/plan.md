# Portail Agence IA — Plan d'implémentation

Application web responsive (mobile-first) avec deux portails distincts (Consultant / Entreprise), authentification par rôle, suivi de projets/demandes, KPIs et messagerie par projet.

## Stack & fondations

- Scaffold `web_app:portail-agence-ia` (template TanStack Start moderne)
- Lovable Cloud activé pour : Auth email/mot de passe, base de données Postgres, RLS
- Design tokens dans `index.css` :
  - Primaire `#E6E4E0` (fond clair), Secondaire `#0A0A0A` (texte/contrastes)
  - Accent jaune optionnel (clin d'œil à la réf Dribbble)
  - Typo forte, large whitespace, layout minimaliste
- Langue : interface en **français**

## Pages & routes

Routes publiques :
- `/` — Accueil "Qui sommes-nous : Agence IA" (hero, services, 2 CTA vers portails, footer)
- `/consultant` — Landing Portail Consultant
- `/consultant/inscription`, `/consultant/connexion`
- `/entreprise` — Landing Portail Entreprise
- `/entreprise/inscription`, `/entreprise/connexion`

Routes protégées (rôle = `consultant`) :
- `/consultant/dashboard` — Liste des projets assignés (cards + statut)
- `/consultant/projets/:id` — Détail projet (résumé, timeline, onglet Échanges)
- `/consultant/indicateurs` — KPIs + graphiques (Recharts)
- `/consultant/profil`

Routes protégées (rôle = `entreprise`) :
- `/entreprise/dashboard` — Liste des demandes
- `/entreprise/demandes/nouvelle` — Formulaire création demande
- `/entreprise/demandes/:id` — Détail + fil de messages
- `/entreprise/profil`

Garde de route : redirection selon `role` du user connecté.

## Modèle de données (Lovable Cloud)

- `profiles` (lié à `auth.users`) : `id`, `email`, `created_at`
- `user_roles` : `user_id`, `role` (`consultant` | `entreprise`) — **table séparée** (sécurité)
- `consultant_profiles` : `user_id`, `first_name`, `last_name`, `specialty`, `availability`
- `company_profiles` : `user_id`, `company_name`, `contact_name`, `phone`
- `requests` : `id`, `company_id`, `title`, `type`, `description`, `budget`, `deadline`, `priority`, `status` (`new|in_progress|waiting|done`), `created_at`
- `project_members` : `request_id`, `consultant_id` (assignation consultants ↔ demande)
- `messages` : `id`, `request_id`, `sender_user_id`, `content`, `created_at`

MVP : on traite `requests` comme "projet" (pas de table `projects` séparée pour démarrer).

Fonction SECURITY DEFINER `has_role(user_id, role)` + policies RLS :
- Entreprise voit/édite uniquement ses `requests`
- Consultant voit uniquement les `requests` où il est dans `project_members`
- Messages visibles uniquement aux membres du projet + l'entreprise propriétaire

## Étapes d'implémentation

1. Scaffold web_app + activation Lovable Cloud
2. Design system (tokens couleurs, typo, composants de base header/footer/button/card)
3. Migration DB : enum role, tables, RLS, trigger auto-création profil + role à l'inscription
4. Auth : pages inscription/connexion Consultant et Entreprise (création du bon profil selon flux)
5. Landing publique + landings portails
6. Dashboard Consultant + détail projet + page Indicateurs (Recharts sur données réelles)
7. Dashboard Entreprise + formulaire nouvelle demande + détail demande
8. Module Messagerie (fil par demande, realtime optionnel)
9. Responsive pass + polish UI

## Détails techniques

- Validation formulaires : `zod` + `react-hook-form`
- Graphiques : `recharts`
- Realtime messages : Supabase Realtime sur `messages` (optionnel MVP)
- Inscription : un seul `signUp` puis insertion dans `user_roles` + table profil correspondante (via trigger DB ou côté client après confirmation)
- Pas de Google/Apple sign-in pour le MVP (email/mot de passe uniquement, comme spécifié)

## Hors scope MVP

- Upload de pièces jointes dans les messages
- Notifications email
- Admin global
- Cycle projet avancé (table `projects` séparée)
