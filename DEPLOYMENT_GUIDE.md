# 🚀 Guide de Déploiement - GUELICHWEB

Ce document résume les étapes à suivre pour mettre à jour votre site et vos fonctionnalités en production.

---

## 1. Mettre à jour le Site Web (Interface & Design)
*À faire quand vous modifiez : le design, les textes, le logo, ou le code React (`src/`).*

Le site est hébergé sur **Vercel**, qui le met en ligne **automatiquement** :

1.  **Envoyez vos modifications sur GitHub** : fusionnez une Pull Request dans `main` (ou poussez directement sur `main`).
2.  **Vercel construit et publie le site** en 1 à 2 minutes sur [offre.guelichweb.online](https://offre.guelichweb.online). Rien d'autre à faire.

-   Chaque Pull Request reçoit aussi une **adresse d'aperçu** (commentaire du bot Vercel sur la PR) pour tester avant de fusionner.
-   GitHub Actions vérifie le code à chaque Pull Request (types, tests, build).
-   Les variables du site (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) se règlent dans **Vercel → Project → Settings → Environment Variables**.

---

## 2. Mettre à jour les Emails & Fonctions (Backend)
*À faire quand vous modifiez : les templates d'email, la logique d'envoi, ou les clés API.*

1.  **Ouvrez votre terminal** dans le dossier du projet.
2.  **(Première fois ou changement de clé) Préparez vos secrets** :
    -   Copiez `supabase/.env.example` en `supabase/.env`.
    -   Collez votre clé Resend dans `RESEND_API_KEY=...`.
    -   ⚠️ Ce fichier est ignoré par git : **ne mettez jamais une clé directement dans un script ou dans le code**, le dépôt est public.
3.  **Lancez le script de déploiement automatique** :
    ```powershell
    ./deploy-all-functions.ps1
    ```
4.  **Suivez les instructions** à l'écran :
    -   Le script peut vous demander de vous connecter (`npx supabase login`) si ce n'est pas déjà fait.
    -   Il mettra à jour la clé API d'envoi d'emails (Resend) à partir de `supabase/.env` (s'il existe).
    -   Il déploiera les deux fonctions : `newsletter-subscribe` et `send-confirmation`.

✅ *Une fois le script terminé avec succès ("Done!"), vos modifications d'emails sont en ligne.*

---

## 3. Mettre à jour la sécurité de la Base de Données
*À faire quand `supabase/security_rls_policies.sql` change.*

1.  Ouvrez **Supabase → SQL Editor**.
2.  Collez tout le contenu de `supabase/security_rls_policies.sql` et cliquez sur **Run**.
3.  Le tableau affiché à la fin doit montrer **deux règles par table** : une pour le public, une pour les admins.

✅ *Le script peut être relancé sans risque. Faites cette étape **avant** de redéployer les fonctions (étape 2) si les deux ont changé.*

---

## 4. En cas de problème

-   **Les emails ne partent pas ?**
    Vérifiez que vous avez bien relancé l'étape 2. Les fonctions Supabase ne se mettent pas à jour toutes seules quand vous modifiez le code local.

-   **Le nouveau logo ne s'affiche pas dans les emails ?**
    Le logo des emails est chargé depuis votre site. Assurez-vous d'avoir bien fait l'étape 1 (Mise à jour du site) pour que le fichier `logo_email.png` soit accessible en ligne.

-   **Test Local**
    Avant de déployer, vous pouvez toujours vérifier le design des emails ici :
    -   [Preview Newsletter](http://localhost:5173/email_newsletter_preview.html)
    -   [Preview Confirmation](http://localhost:5173/email_confirmation_preview.html)
