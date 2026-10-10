# 🚀 Guide de Déploiement - GUELICHWEB

Ce document résume les étapes à suivre pour mettre à jour votre site et vos fonctionnalités en production.

---

## 1. Mettre à jour le Site Web (Interface & Design)
*À faire quand vous modifiez : le design, les textes, le logo, ou le code React (`src/`).*

1.  **Ouvrez votre terminal** (VS Code ou PowerShell).
2.  **Lancez la construction du site** :
    ```powershell
    npm run build
    ```
    ✅ *Cela va créer un dossier `dist` optimisé pour la production.*

3.  **Mettez en ligne sur cPanel** :
    -   Connectez-vous à votre **Gestionnaire de fichiers cPanel**.
    -   Allez dans le dossier `public_html` (ou le dossier racine de votre sous-domaine `offre`).
    -   **Supprimez** tout le contenu existant.
    -   **Uploadez** tout le contenu qui se trouve dans votre dossier local `dist`.
    -   **Outils > Décompresser** si vous avez uploadé un ZIP.

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

## 3. En cas de problème

-   **Les emails ne partent pas ?**
    Vérifiez que vous avez bien relancé l'étape 2. Les fonctions Supabase ne se mettent pas à jour toutes seules quand vous modifiez le code local.

-   **Le nouveau logo ne s'affiche pas dans les emails ?**
    Le logo des emails est chargé depuis votre site. Assurez-vous d'avoir bien fait l'étape 1 (Mise à jour du site) pour que le fichier `logo_email.png` soit accessible en ligne.

-   **Test Local**
    Avant de déployer, vous pouvez toujours vérifier le design des emails ici :
    -   [Preview Newsletter](http://localhost:5173/email_newsletter_preview.html)
    -   [Preview Confirmation](http://localhost:5173/email_confirmation_preview.html)
