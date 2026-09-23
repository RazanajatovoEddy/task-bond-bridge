# xT Ressources

je voud# **Prompt Bolt/Lovable — Portail Agence IA**

Ton rôle est de créer une application web responsive (desktop + mobile) qui permet :

1) aux **consultants** de s’inscrire/se connecter puis **suivre leurs projets**, consulter des **indicateurs** et **échanger** sur chaque projet,

2) aux **entreprises** de s’inscrire/se connecter puis **déposer un besoin** (automatisation / création d’application / etc.) et **suivre leurs demandes**.

---

# **Portail Agence IA — Cahier des Charges Technique**

## **1) Structure de l’Application (Pages & composants)**

### **1) Accueil — “Qui sommes-nous : Agence IA”**

- **État : Public**

- **Objectif :** présenter l’agence + orienter vers le bon portail.

- **Composants principaux :**

  - Header (logo texte “Portail Agence IA”, navigation minimaliste)

  - Section Hero (proposition de valeur + CTA)

  - 2 CTA principaux :

    - “Espace Consultant”

    - “Espace Entreprise”

  - Section “Services” (automatisation, création d’app, IA, etc.)

  - Footer

---

### **2) Portail Consultant (Landing)**

- **État : Public**

- **Composants principaux :**

  - Bloc présentation “Consultants”

  - CTA “Créer un compte” + “Se connecter”

  - FAQ courte (optionnel)

---

### **3) Créer un compte (Consultant)**

- **État : Public**

- **Composants principaux :**

  - Formulaire inscription email/mot de passe

  - Champs profil consultant (minimum) :

    - Nom / Prénom

    - Email

    - Spécialité (automatisation / dev / data / IA / no-code)

    - Disponibilité (optionnel)

  - Bouton “Créer mon compte”

- **Comportement :**

  - Création utilisateur + création d’un profil Consultant en base

  - Redirection vers “Dashboard Consultant”

---

### **4) Se connecter (Consultant)**

- **État : Public**

- **Composants principaux :**

  - Formulaire email/mot de passe

  - Bouton “Connexion”

- **Comportement :**

  - Auth OK → Dashboard Consultant

---

### **5) Dashboard Consultant — “Suivi des projets”**

- **État : Protégé (Consultant)**

- **Composants principaux :**

  - Header dashboard (menu : Projets / Indicateurs / Messages / Profil / Déconnexion)

  - Liste des projets assignés (cards)

    - Nom projet, entreprise, statut (Nouveau / En cours / En attente / Terminé)

    - Dernière activité

    - CTA “Ouvrir”

  - Vue détail projet (quand on ouvre une card) :

    - Résumé projet

    - Timeline / jalons (simple)

    - Onglet “Échanges” (messages)

- **Règles :**

  - Un consultant ne voit que ses projets.

---

### **6) Graphiques & Indicateurs (Consultant)**

- **État : Protégé (Consultant)**

- **Composants principaux :**

  - KPIs (ex : projets en cours, projets terminés, temps moyen de traitement, etc.)

  - Graphiques simples (bar/line)

- **Données :**

  - Basées sur les projets liés au consultant.

---

### **7) Échanges sur le projet (Consultant)**

- **État : Protégé (Consultant)**

- **Composants principaux :**

  - Liste des messages (fil de discussion)

  - Champ de saisie + bouton envoyer

  - Pièces jointes (optionnel, peut être MVP sans upload)

- **Règles :**

  - Visible uniquement pour les personnes liées au projet (entreprise + consultants + admin si besoin).

---

### **8) Portail Entreprise (Landing)**

- **État : Public**

- **Composants principaux :**

  - Bloc présentation “Entreprises”

  - CTA “Créer un compte” + “Se connecter”

  - Mise en avant “Déposer un besoin en 2 minutes”

---

### **9) Créer un compte (Entreprise)**

- **État : Public**

- **Composants principaux :**

  - Formulaire inscription email/mot de passe

  - Champs profil entreprise (minimum) :

    - Nom entreprise

    - Nom contact

    - Email

    - Téléphone (optionnel)

  - Bouton “Créer mon compte”

- **Comportement :**

  - Création utilisateur + création d’un profil Entreprise en base

  - Redirection vers “Dashboard Entreprise”

---

### **10) Se connecter (Entreprise)**

- **État : Public**

- **Composants principaux :**

  - Formulaire email/mot de passe

  - Bouton “Connexion”

- **Comportement :**

  - Auth OK → Dashboard Entreprise

---

### **11) Dashboard Entreprise — “Suivi des demandes”**

- **État : Protégé (Entreprise)**

- **Composants principaux :**

  - Header dashboard (menu : Mes demandes / Nouvelle demande / Messages / Profil / Déconnexion)

  - Liste des demandes (cards)

    - Titre, type (automatisation/app/etc.), statut (Nouveau / En cours / En attente / Terminé)

    - CTA “Voir détail”

  - CTA “Créer une demande”

- **Règles :**

  - Une entreprise ne voit que ses demandes.

---

### **12) Formulaire — “Création d’une demande”**

- **État : Protégé (Entreprise)**

- **Composants principaux :**

  - Formulaire :

    - Titre du besoin

    - Type (Automatisation / Création d’app / Autre)

    - Description détaillée

    - Budget estimé (optionnel)

    - Échéance (optionnel)

    - Priorité (optionnel)

  - Bouton “Soumettre”

- **Comportement :**

  - Enregistre la demande en base

  - Crée un fil de discussion (messages) lié à la demande/projet

  - Redirection vers le détail de la demande

---

## **2) Base de données (Lovable DB) & Authentification**

### **Authentification**

- Activer l’auth email/mot de passe.

- Gestion de rôles : `consultant` vs `entreprise` (champ role dans Users).

- Routes protégées selon le rôle.

### **Tables / Collections (Lovable DB) — Proposition**

1. **users**

   - id

   - email

   - role (`consultant` | `entreprise`)

   - createdAt

2. **consultant_profiles**

   - id

   - userId (relation users)

   - firstName

   - lastName

   - specialty

   - availability (optionnel)

3. **company_profiles**

   - id

   - userId (relation users)

   - companyName

   - contactName

   - phone (optionnel)

4. **requests** (demandes entreprise)

   - id

   - companyId (relation company_profiles)

   - title

   - type

   - description

   - budget (optionnel)

   - deadline (optionnel)

   - priority (optionnel)

   - status (`new` | `in_progress` | `waiting` | `done`)

   - createdAt

5. **projects** (si on veut distinguer demande → projet)

   - id

   - requestId (relation requests)

   - status

   - createdAt

6. **project_members**

   - id

   - projectId

   - consultantId (relation consultant_profiles)

7. **messages**

   - id

   - projectId (ou requestId si pas de table projects en MVP)

   - senderUserId (relation users)

   - content

   - createdAt

> MVP recommandé : utiliser **requests** comme “projet” au début, puis ajouter **projects** si besoin d’un cycle plus avancé.

---

## **3) Design & UI**

- **Inspiration UI (Dribbble) :** https://dribbble.com/shots/27388289-Mission-responsive-landing-page  

- **Style :** moderne, typographie forte, beaucoup d’espace blanc/gris clair, accents minimalistes.

- **Couleurs :**

  - Couleur principale : `#E6E4E0`

  - Couleur secondaire : `#0A0A0A`

- **Ressources visuelles :** aucune

---

## **4) Règles de Développement**

- Commencer par les fichiers de configuration.

- Développer ensuite les composants en suivant la structure ci-dessus.

- Créer d'abord tous les dossiers nécessaires dans `src/`.

- Créer un fichier vide pour chaque composant mentionné avant de commencer le code.

- Ne pas importer un composant qui n'a pas encore été créé.

- Toujours utiliser l'extension `.tsx` pour les fichiers React.

- Créer les routes uniquement après avoir tous les composants fonctionnels.

- Implémenter la protection des routes selon le rôle utilisateur.

- Responsive obligatoire (mobile-first).

---

## **5) Ressources à ajouter au prompt Bolt/Lovable**

- Joindre le **userflow Whimsical** (image fournie).

- Joindre l’**interface Dribbble** (lien + capture si possible).rais

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0ffdd1ab-e834-4abe-b991-085436bde06d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
