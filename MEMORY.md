# MEMORY.md — JOURNAL DE BORD & ÉTAT DU PROJET LORENO (EX-SNAPSTUDY)

## 🎯 Identité du Produit
- **Hackathon** : FounderRace 2026 (12 Septembre 08h00 - 13 Septembre 08h00 UTC+2).
- **Produit** : **Loreno** (`https://www.loreno.app/`) — Scan de notes de cours manuscrites $\rightarrow$ Flashcards swipe 3D tactiles + Effet miroir photo originale + Tuteur d'examen IA.
- **Canal n°1** : Trafic TikTok/Reels direct $\rightarrow$ **Application 100% Mobile-First** (Shell smartphone centré sur desktop).
- **Objectif Principal du Jury** : Chiffre d'affaires encaissé en direct sur Stripe (Pass Partiels Fondateur à 9,99 €). Clé API Stripe Read-Only fournie au jury.

---

##  Décisions Fondatrices 80/20 Validées
1. **Gateway Auth Immédiate (Supabase)** : Inscription/Connexion obligatoire ou session invité. Chaque deck scanné est rattaché au `user_id`.
2. **Compression Client + Supabase Storage (`course-scans`)** :
   - Compression Canvas HTML5 (max 1600px, JPEG 0.8) côté client : passage de 5 Mo à < 400 Ko pour un upload instantané.
   - Upload direct sur Supabase Storage dans le bucket public `course-scans/${user.id}/${deckId}.jpg`.
   - `image_url` enregistrée dans `decks` pour permettre la ré-interrogation par le Tuteur IA et l'effet miroir sur les cartes.
3. **Loop Swipe Dopamine, Question Piège & Offre Agressive** :
   - Expérience de swipe tactile 3D (flip au tap, swipe droite "Je sais" / gauche "À revoir").
   - Bouton "Note originale" (`MirrorModal`) pour vérifier la feuille scannée.
   - **Audit d'Examen Immédiat** (`ExamTrapBox`) : Détection du risque partiel et affichage de la **Question Piège du Professeur** avec CTA pour débloquer le corrigé type.
   - **Teaser des 14 Cartes Floutées** (Sunk Cost Fallacy) : 3 cartes interactives offertes + aperçu flouté des cartes suivantes avec cadenas.
   - **Paywall Anti-Rattrapage** (`PaywallModal`) : Reframe agressif (Prof 35€/h vs Rattrapage 6 mois vs 9,99€ à vie Loreno) sans export 1-clic superflu.
4. **Gameplay & Roadmap Modulables (Zéro Usine à Gaz)** :
   - Toutes les règles du parcours (paliers, pourcentages `targetPercent`, types d'épreuves, titres, descriptions) sont déclarées dans un fichier central unique : `lib/review-config.ts`.
   - Tout changement de gameplay ou d'équilibrage de progression s'effectue en 1 ligne sans toucher aux composants ni risquer de régression.

---

## 📱 Socle Mobile-First (Normes MAXREPLY / MAXED)
- **Viewport Lock** : `userScalable: false`, `maximumScale: 1`, `viewportFit: "cover"` dans `app/layout.tsx`.
- **Hauteur & Layout** : `100dvh` (pas de `100vh`), `max-w-md mx-auto` sur desktop avec shell immersif.
- **Anti-Zoom iOS** : Inputs/Textareas à 16px strict sur mobile via `globals.css`.
- **Thumb Zone** : Actions principales (Scan, Flip, Next, Achat) placées en bas de l'écran pour être opérables à une main.
- **Dark Theme Natif** : Palette `zinc-950` avec accents ambre/orange.

---

## 🚀 Infrastructure Live : Vercel, Stripe & Supabase

### 1. Vercel Production
- **Projet** : `snapstudy` (ID: `prj_MXJVfdQhFqVNGmEPwN9B5tozCuZL`)
- **Équipe** : `julien-noel-team` (`team_jAQ7ZWzKYGp0iB13KCrjo2q5`)
- **Framework** : `nextjs` (Next.js 16 App Router avec Turbopack & Cache Components)
- **Domaine Personnalisé Officiel** : [https://www.loreno.app](https://www.loreno.app) 🟢 **LIVE & PRERENDERED**
- **URL Alternative Vercel** : [https://snapstudy-lime.vercel.app](https://snapstudy-lime.vercel.app)
- **Variables d'environnement injectées sur Vercel** :
  - `GEMINI_API_KEY` (Google Interactions API / Gemini 3.6 Flash) 🟢 **VALIDÉE & ACTIVE**
  - `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Stripe Compte Dédié Loreno (LIVE)
- **Stripe Account ID** : `acct_1UEmQlAH5Oe6wyUi` (Loreno Live)
- **Produit** : `Loreno — Pass Partiels Fondateur (Accès à vie)`
- **Prix** : 9,99 € TTC
- **Stripe Payment Link Direct Live** :  
  👉 **[https://buy.stripe.com/aFa00idmx0iL8aV4gyds401](https://buy.stripe.com/aFa00idmx0iL8aV4gyds401)**
- **Clé API Publishable Live** : `pk_live_51UEmQlAH5Oe6wyUiMZPv2AOWrSs18SUdtdgh9qAdBDW1JstYJvZQJXi1E8Q5XOuDHn4QCiJwtzRvKqbkCIqH0o3N00E6XfO1zy`

### 3. Supabase Loreno (PROD)
- **Organisation** : `LORENO (FREE)`
- **Project Ref** : `bfxbrveuwyiidfthevdn`
- **Project URL** : `https://bfxbrveuwyiidfthevdn.supabase.co`
- **Publishable Key** : `sb_publishable_qPKyRvryGiPpgS893UUPlg_P6LJz_S6`
- **Schéma SQL & Storage** : Exécuté avec succès ! Tables `decks`, `flashcards`, bucket public `course-scans` et RLS configurés.

### 4. Design System Sémantique, COSS UI & MCP 2026
- **Benchmark UI de Référence** : [COSS UI](https://coss.com/ui) (Base UI + Tailwind v4 + Micro-relief physique `inset-shadow` + Touch targets 44px via `pointer-coarse`).
- **Tokens de Style Unifiés** : `brand` (`#4457f4`), `brand-hover` (`#3345de`), `brand/10`, `border-brand/20` sans hexadécimal arbitraire.
- **Connecteurs MCP Connectés** :
  - `supabase` (Inspection schémas, requêtes directes, migrations)
  - `stripe` (Suivi des paiements réels et planification)
  - `vercel` (Logs production et diagnostic des fonctions)
  - `posthog` (Télémétrie et analyse de rétention)
  - `meta-ads` (Acquisition TikTok / Instagram Reels)

### 5. Living Agentic Backlog (Octobre 2026)
- **Zone de Dépôt Rapide** : `INBOX_BAPTISTE.md` (pour Baptiste & idées brutes sans friction).
- **Fiches Atomiques** : `tasks/TASK-XXX.md` avec YAML Frontmatter strict (auteur, type, statut, priorité, fichiers impactés, critères).
- **Tableau de Bord** : `tasks/BOARD.md` (vue Kanban synthétique).
- **Règle d'Or** : L'agent IA et Julien mettent à jour ces documents dès qu'un feedback ou bug est formulé, et clôturent chaque tâche après validation du build.

---

## 🗺️ Roadmap Commando 24H

| Phase | Milestone | Statut | Description |
|---|---|---|---|
| **Phase 0** | **Socle Mobile & Gouvernance** | 🟢 Terminé | `AGENTS.md`, `MEMORY.md`, `supabase/schema.sql`, `layout.tsx` (Viewport mobile), `globals.css` (Dvh + 3D flip). |
| **Phase 1** | **Infra Vercel & Stripe Live** | 🟢 Terminé | Domaine `https://www.loreno.app` déployé en production, compte Stripe dédié Loreno configuré, Payment Link 9,99 € actif. |
| **Phase 2** | **Supabase DB & Auth Gateway** | 🟢 Terminé | Schéma SQL exécuté, tables `decks`, `flashcards`, `user_referrals` (fallback metadata active), bucket `course-scans`. |
| **Phase 3** | **Upload Caméra & Fiches Markdown Gemini** | 🟢 Terminé | Route `/api/scan` avec Gemini 1.5 Flash générant fiches de cours complètes (`detailed_content`) + Flashcards. |
| **Phase 4** | **Dashboard & Parcours Adaptatif Duolingo** | 🟢 Terminé | Filtres matières, cours démo Droit Constitutionnel, parcours `/review/[id]` avec ré-injection des erreurs (Option A). |
| **Phase 5** | **Système d'Affiliation Cash & 3 Jours Pro** | 🟢 Terminé | Programme 20% commission cash, capture `?ref=...`, 3 jours Pro offerts filleuls, virement dès 70,00 €. |
| **Phase 6** | **Tuteur d'Examen IA (Chatbot)** | 🟢 Terminé | Chatbot interactif posant des questions pièges d'examen et évaluant les réponses. |
| **Phase 7** | **Code Quality & Architecture Agentique** | 🟢 Terminé | Audit documenté dans `docs/`, 100% des fichiers sous 300 lignes, contrats Zod stricts, 0 `any`, compilation validée. |
| **Phase 8** | **Living Agentic Backlog & Triage Baptiste** | 🟢 Terminé | 18 vocaux transcrits & nettoyés, 11 photos de cours indexées, `INBOX_BAPTISTE.md`, tickets `BUG-003` à `FEAT-011` créés dans `tasks/` et `tasks/BOARD.md`. |
| **Phase 9** | **Sprint Stabilisation & Clôture P0/P1** | 🟢 Terminé | Résolution des tickets Baptiste (`BUG-003` à `FEAT-011`), Coss UI (`UX-023`), Structured Outputs (`TECH-024`), Dev Studio Modal (`FEAT-025`), et Fiches Haute Densité Claude/ChatGPT (`FEAT-026`). |
| **Phase 10** | **Vidéo Pitch & Acquisition Live** | 🟡 En cours | Vidéo démo mobile $\le$ 2 min, tests d'affiliation réels en prod, lancement acquisition TikTok. |

---

## 📋 Détail Exhaustif de ce qu'il reste à faire (Roadmap & Backlog)

### 🧪 1. Actions Immédiates & Tests Manuels (À réaliser par Julien)
- [ ] **Test du flux d'Affiliation complet en navigation privée** :
  1. Se connecter sur `/dashboard` et cliquer sur `🎁 Affiliation` pour copier son lien parrain (ex: `https://loreno.app?ref=JULIEN-XXXX`).
  2. Ouvrir une fenêtre incognito, coller le lien et créer un 2nd compte de test.
  3. Vérifier que le compte filleul débloque immédiatement les **3 jours Pro offerts** (badge "Mon compte" et bandeau bas actif).
  4. Vérifier que le parrain voit son nombre de potes invités passer de `0` à `1` dans sa modale.
- [ ] **Console SQL Supabase (Optionnel pour perfectionnisme DB)** :
  - Exécuter le fichier `supabase/migrations/20260923_affiliate_system.sql` dans le SQL Editor de Supabase (`bfxbrveuwyiidfthevdn`) pour instancier la table PostgreSQL physique `user_referrals` (le fallback `user_metadata` assure déjà 100% de fonctionnement sans elle).
- [ ] **Enregistrement de la Vidéo Pitch Jury (FounderRace)** :
  - Démo mobile en < 2 min : Scan photo d'un cours manuscrit $\rightarrow$ Rendu de la fiche Markdown $\rightarrow$ Parcours de révision adaptatif Duolingo $\rightarrow$ Paywall Stripe & Affiliation.

---

### 🔮 2. Backlog V2 (Fonctionnalités Futures Post-Hackathon)
- [ ] **Streaks & Notifications Email/Push** :
  - Relances quotidiennes basées sur la courbe d'oubli SuperMemo SM-2 pour maintenir le streak d'apprentissage.
- [ ] **Calibrage par Date d'Épreuve (Partiels)** :
  - Ajouter un sélecteur de date d'examen dans l'onboarding pour adapter la fréquence et l'intensité des Quiz du Tuteur IA.
- [ ] **Mode Audio / Podcast de Cours (Text-to-Speech)** :
  - Option d'écoute audio de la fiche de révision générée par l'IA pendant les déplacements.
- [ ] **Mode Focus App Blocker (Opal Style)** :
  - Verrouillage temporaire des notifications et réseaux sociaux pendant qu'une session de révision est active.
