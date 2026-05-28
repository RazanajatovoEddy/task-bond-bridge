## Objectif
Désactiver l'auto-confirmation des emails pour que Lovable Cloud envoie un mail de confirmation à chaque inscription (consultant et entreprise).

## Étapes

1. **Désactiver `auto_confirm_email`** via la configuration Auth de Lovable Cloud (`configure_auth` avec `auto_confirm_email: false`). Les autres paramètres restent inchangés :
   - `disable_signup: false` (les inscriptions restent ouvertes)
   - `external_anonymous_users_enabled: false`
   - `password_hibp_enabled: true` (protection mots de passe compromis recommandée)

2. **Pas de changement de code** : les écrans d'inscription consultant et entreprise appellent déjà `supabase.auth.signUp(...)` avec `emailRedirectTo` correctement configuré. Une fois l'auto-confirmation désactivée, Lovable Cloud enverra automatiquement le mail de confirmation.

3. **Test à effectuer après application** :
   - Créer un nouveau compte test avec une adresse réelle
   - Vérifier la réception du mail (boîte de réception + spam/promotions)
   - Cliquer sur le lien → redirection vers `/consultant/dashboard` ou `/entreprise/dashboard`

## Limites connues

- Les mails sont envoyés depuis le domaine par défaut de Lovable Cloud → risque élevé d'arriver en **spam/promotions**.
- Les comptes déjà créés (ex : `zh_rabefitseheno@yahoo.com`) ne recevront pas rétroactivement un mail ; ils sont déjà confirmés.

## Étape suivante recommandée (optionnelle, à faire après validation)

Si les mails arrivent en spam ou ne sont pas reçus, passer à l'**option B** : configurer un domaine d'envoi personnalisé (ex : `notify.votredomaine.com`) + templates d'emails brandés aux couleurs de l'app. Cela améliore drastiquement la délivrabilité.
