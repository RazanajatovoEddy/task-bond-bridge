# Correction du chargement du compte consultant

## Problème identifié

Le compte `e.razanajatovo@gmail.com` possède désormais **deux rôles** dans `user_roles` : `consultant` ET `admin` (cf. réponse réseau `/rest/v1/user_roles` qui renvoie `[{"role":"consultant"},{"role":"admin"}]`).

Or, dans `src/hooks/use-auth.tsx`, on appelle :

```ts
.from("user_roles").select("role").eq("user_id", user.id).maybeSingle()
```

`maybeSingle()` **échoue dès qu'il y a plus d'une ligne** → `data` est `null`, `role` reste `null`, et `AuthGuard` redirige / bloque sur "Chargement…" indéfiniment. Le portail consultant ne se charge donc plus.

## Correctif

### 1. `src/hooks/use-auth.tsx`
- Remplacer `.maybeSingle()` par un `select` qui retourne toutes les lignes.
- Choisir le rôle "actif" avec une priorité claire :
  1. `admin` (si présent) → accès `/admin`
  2. sinon `consultant`
  3. sinon `entreprise`
- Ainsi un utilisateur cumulant `consultant + admin` est traité comme admin (et la redirection vers `/admin` reste cohérente avec `AuthGuard`).

### 2. (Optionnel mais recommandé) Permettre la bascule
Pour ce projet, on garde simple : un seul rôle "actif" à la fois selon la priorité ci-dessus. Pas d'UI de switch dans cette itération.

### 3. Vérification
Après correctif :
- `e.razanajatovo@gmail.com` → connecté → role = `admin` → redirigé vers `/admin` (comportement attendu).
- Si tu veux te connecter en tant que consultant avec ce même email, il faudra retirer le rôle `consultant` OU `admin` côté base. Je peux le faire si tu préfères garder ce compte purement admin.

## Question

Veux-tu que je supprime aussi le rôle `consultant` de `e.razanajatovo@gmail.com` (pour qu'il soit uniquement admin), ou bien on garde les deux rôles avec la priorité admin ?
