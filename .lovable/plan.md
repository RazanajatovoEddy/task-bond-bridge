## Objectif

Ajouter une page **« Mon Compte »** accessible depuis un menu utilisateur dans les deux portails (Consultant et Entreprise) pour permettre la modification des informations du profil, et corriger en base le champ **Spécialité(s)** pour qu'il soit nativement multi-valeurs.

---

## 1. Base de données — Spécialité(s) en multi-valeurs

Aujourd'hui `consultant_profiles.specialty` est un `text` (les valeurs sont stockées concaténées avec des virgules). On le passe en `text[]`.

Migration :
- `ALTER TABLE consultant_profiles ADD COLUMN specialties text[] NOT NULL DEFAULT '{}'`
- Backfill : `UPDATE consultant_profiles SET specialties = string_to_array(specialty, ',')`
- `ALTER TABLE consultant_profiles DROP COLUMN specialty`

Les politiques RLS existantes restent valides (pas de changement de scope).

---

## 2. Menu utilisateur (header connecté)

Mise à jour de `src/components/dashboard-header.tsx` :
- Remplacer le bouton « Déconnexion » seul par un **menu déroulant** (DropdownMenu shadcn) avec l'email/nom de l'utilisateur.
- Entrées : **Mon Compte** → `/consultant/compte` ou `/entreprise/compte` selon le rôle, séparateur, **Déconnexion**.
- Conserver le reste de la navigation existante.

---

## 3. Page « Mon Compte » — Consultant

Nouveau fichier `src/routes/consultant/compte.tsx` (protégé par `AuthGuard` rôle consultant) :
- Charge `consultant_profiles` du user via le client Supabase navigateur (RLS = `auth.uid() = user_id`).
- Formulaire avec : Prénom, Nom, Email (lecture seule), **Spécialité(s)** (cases à cocher multi-sélection, mêmes options que l'inscription), Disponibilité.
- Bouton **Enregistrer** → `update` sur `consultant_profiles` (specialties en `text[]`).
- Toast succès/erreur.

---

## 4. Page « Mon Compte » — Entreprise

Nouveau fichier `src/routes/entreprise/compte.tsx` (protégé par `AuthGuard` rôle entreprise) :
- Charge `company_profiles` du user.
- Formulaire : Nom de l'entreprise, Nom du contact, Email (lecture seule), Téléphone.
- Bouton **Enregistrer** → `update` sur `company_profiles`.

---

## 5. Mise à jour des écrans existants liés à `specialty`

- `src/routes/consultant/inscription.tsx` : insert utilise `specialties: form.specialty` (array) au lieu de `specialty: join(",")`.
- Tout autre affichage de la spécialité côté consultant (dashboard, indicateurs) : remplacer `specialty` par `specialties.join(", ")` pour l'affichage.

---

## Détails techniques

- Pas de nouveau composant lourd : DropdownMenu shadcn déjà disponible.
- Routes ajoutées en `src/routes/consultant/compte.tsx` et `src/routes/entreprise/compte.tsx` (le `routeTree.gen.ts` se régénère automatiquement).
- Aucune modification du schéma `company_profiles`.
- La migration est non destructive jusqu'au DROP COLUMN (fait après backfill dans la même transaction).
