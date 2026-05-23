## Page d'administration — Proposition détaillée

### 1. Rôle « admin »

Ajouter une 3ᵉ valeur à l'enum `app_role` : `admin`. Un admin est créé manuellement (insert SQL) — pas d'inscription publique. Les pages `/admin/*` sont protégées par un guard qui vérifie `has_role(auth.uid(), 'admin')`.

### 2. Arborescence des écrans

```
/admin                       → tableau de bord (KPIs : nb consultants, entreprises, projets actifs, en attente)
/admin/consultants           → liste + recherche + filtre spécialités / dispo
/admin/consultants/$id       → fiche détaillée, édition, historique projets
/admin/entreprises           → liste + recherche
/admin/entreprises/$id       → fiche, projets associés
/admin/projets               → liste globale (filtres statut / type / entreprise / consultant)
/admin/projets/$id           → détail complet : infos confidentielles, affectations, documents, messagerie
```

Menu latéral (shadcn Sidebar) avec ces 4 entrées + lien « Mon compte » et déconnexion.

### 3. Gestion des consultants et entreprises

- Lecture/édition de tous les champs (admin bypasse les RLS « own only »).
- Possibilité de désactiver un compte (champ `is_active boolean` ajouté sur `consultant_profiles` et `company_profiles`).
- Vue d'historique : projets passés et en cours.

### 4. Gestion des projets et affectations

- Sur `/admin/projets/$id` : tous les champs visibles (incl. **budget**, **priorité**, **deadline**).
- Section « Équipe » : multi-sélection de consultants → écrit dans `project_members` (insert/delete). Aujourd'hui la table n'a pas de policy admin INSERT/DELETE — à ajouter.
- Changement de statut (`new` → `in_progress` → `waiting` → `done`).

### 5. Confidentialité entreprise → consultant

Distinction claire entre :
- **Infos partagées** (visibles par les consultants affectés) : `title`, `description`, `type`, `deadline`, `priority`, `status`, documents de type `brief`/`livrable`/`specification`.
- **Infos confidentielles** (admin + entreprise uniquement) : `budget`, documents de type `contrat`/`devis`/`facture`/`bon_de_commande`.

Mise en œuvre :
- RLS `requests` consultant : déjà OK pour le SELECT, mais le champ `budget` reste visible. → Créer une **vue `requests_consultant_view`** sans `budget` et adapter le code consultant pour ne lire que cette vue. Politique sur `requests` : refuser SELECT direct aux consultants, autoriser via la vue (security_invoker).
- Pour les documents : filtrage par `document_type` selon le rôle (voir §6).

### 6. Documents par projet (nouveau)

Nouvelle table `project_documents` :

| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| request_id | uuid FK → requests | |
| uploaded_by | uuid | auth.uid() |
| document_type | enum `document_type` | `brief`, `specification`, `livrable`, `contrat`, `devis`, `facture`, `bon_de_commande`, `autre` |
| name | text | nom affiché |
| file_path | text | chemin dans le bucket Storage |
| mime_type | text | |
| size_bytes | bigint | |
| created_at | timestamptz | |

Enum `document_visibility` dérivé du `document_type` via une fonction `is_document_shared(document_type)` :
- partagés : `brief`, `specification`, `livrable`, `autre`
- confidentiels : `contrat`, `devis`, `facture`, `bon_de_commande`

**Storage** : bucket privé `project-documents`, chemin `{request_id}/{document_id}-{nom}`.

**RLS `project_documents`** :
- Admin : tout.
- Entreprise propriétaire (via `requests.company_id`) : tout.
- Consultant membre (via `project_members`) : SELECT uniquement si `is_document_shared(document_type)`.

**RLS Storage** : mêmes règles via jointure sur `project_documents.file_path`.

UI :
- Onglet « Documents » sur la page projet (admin, entreprise, consultant).
- Upload avec sélection du type (dropdown).
- Liste avec icône, nom, type (badge), taille, date, bouton télécharger/supprimer.
- Côté consultant : seuls les documents partagés apparaissent.

### 7. Migrations DB requises

1. `ALTER TYPE app_role ADD VALUE 'admin'`.
2. `CREATE TYPE document_type AS ENUM (...)`.
3. `CREATE TABLE project_documents (...)` + RLS.
4. `CREATE FUNCTION is_document_shared(document_type) RETURNS boolean`.
5. `ALTER TABLE consultant_profiles ADD COLUMN is_active boolean DEFAULT true`.
6. `ALTER TABLE company_profiles ADD COLUMN is_active boolean DEFAULT true`.
7. Policies admin (SELECT/UPDATE all) sur `consultant_profiles`, `company_profiles`, `requests`, `project_members`, `messages` via `has_role(auth.uid(),'admin')`.
8. Policies admin INSERT/DELETE sur `project_members`.
9. `CREATE VIEW requests_consultant_view` (sans `budget`) + révocation SELECT direct pour consultants sur la colonne budget — option simple : modifier la policy `req_consultant_select` pour la conserver mais migrer le code consultant à la vue, et garder `budget` techniquement visible (à valider avec toi : strict ou souple ?).
10. Bucket Storage `project-documents` + policies.

### 8. Création du premier admin

Une fois la migration passée : insertion manuelle via l'outil `insert` après que tu auras créé un compte standard.

---

### Points à valider avant implémentation

1. **Budget consultant** : strict (vue + colonne masquée techniquement) ou souple (juste masquée dans l'UI) ?
2. **Types de documents** : la liste proposée te convient-elle ? À ajouter/retirer ?
3. **Suppression de documents** : qui peut supprimer ? (admin only, ou aussi l'uploader, ou l'entreprise propriétaire ?)
4. **Désactivation de compte** : on garde l'idée du `is_active` ou pas nécessaire pour la v1 ?
5. **Premier admin** : tu me donnes l'email du compte à promouvoir une fois la migration faite ?
