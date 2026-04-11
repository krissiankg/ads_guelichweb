# 🚀 GUELICHWEB - Agence Marketing & Concours Business Transformé

Bienvenue sur le dépôt du projet officiel de **GUELICHWEB**, l'agence web et marketing leader au Bénin.

🔗 **Lien de Production :** [https://offre.guelichweb.online](https://offre.guelichweb.online)

## ✨ Fonctionnalités Principales

- **Développement & Design Premium :** Interface moderne avec des ambiances "glassmorphism", des animations subtiles (framer-motion-like via Tailwind) et un design fully-responsive.
- **Formulaires Hautement Sécurisés :**
  - **Honeypot Anti-Spam** implémenté sur tous les formulaires publics pour intercepter les requêtes des robots sans pénaliser l'expérience utilisateur.
  - Sécurité des bases de données par **Row-Level Security (RLS)** grâce à Supabase (interdisant la modification ou relecture arbitraire par les utilisateurs anonymes).
- **Tableau de Bord Administratif complet :** 
  - Système d'authentification protégé `/admin`.
  - Aperçu statistique en direct de l'attraction client.
  - Gestion des inscriptions à la newsletter, des requêtes de projets et des participations au concours.
  - Gestion dynamique du **Portfolio** (Web, Graphisme, Vidéo) avec une réorganisation intuitive spécialement adaptée pour ordinateurs et mobiles (boutons HAUT/BAS).
- **Notifications Modernes :** Implémentation de `react-hot-toast` pour un retour visuel ultra fluide (succès, erreurs, chargement).
- **Optimisation SEO Localisée :** Intégration Meta Open Graph / JSON-LD pour accroître la lisibilité par les moteurs de recherche pour le marché local Béninois.

## 🛠️ Stack Technique

- **Frontend :** React 18, TypeScript, Vite
- **Styles :** Tailwind CSS (flexibilité, grilles dynamiques, animations personnalisées)
- **Base de données & Authentification :** Supabase (PostgreSQL)
- **Déploiement Continu :** Vercel
- **Icônes :** Lucide React

## 🚀 Installation & Développement (Local)

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/krissiankg/ads_guelichweb.git
   cd ads_guelichweb
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les Variables d'Environnement**
   Créez un fichier `.env` à la racine et renseignez vos accès Supabase :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_publique_supabase
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

## 🔒 Configuration de la Sécurité (Base de données)
Vous retrouverez dans le dossier `/supabase` un fichier `security_rls_policies.sql` contenant toutes nos politiques sécurisées de restriction d'accès aux données.

---
*Propulsé avec passion par l'équipe GUELICHWEB - 2026.*
