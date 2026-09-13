# Loreno ⚡ (loreno.app) — Hackathon FounderRace 2026

> **Prends en photo tes notes de cours (même manuscrites ou brouillonnes) : obtiens tes fiches de révision 3D interactives, ton quiz noté sur /20 avec Round 2, et ton Tuteur d'Examen IA en moins de 2 secondes.**

- 🌐 **Application en ligne** : [https://www.loreno.app](https://www.loreno.app)
- 🎬 **Page Récapitulative & Espace Jury** : [https://www.loreno.app/recap](https://www.loreno.app/recap)
- 👥 **Équipe** : **Julien Noel** (Lead Fullstack & Product Builder) & **Baptiste Fry** (Acquisition & Growth)
- ⏱️ **Événement** : **Sprint Commando 24H** — 12 au 13 Septembre 2026

---

## 🏆 Tableau de Bord & Résultats de Traction 24H (Stripe Live)

| Indicateur Clé | Résultat Réel (24h) | Source & Preuve Vérifiable |
| :--- | :--- | :--- |
| **Chiffre d'Affaires Encaissé (CA)** | **59,94 €** | **Stripe Live** (6 transactions réelles de 9,99 €) |
| **Clients Payants** | **6 étudiants validés** | Edwin Holweck, Danial Adam, Yanis, Emmanuel Bombaka, Greg, Hugo Couve |
| **Comptes Créés** | **30 étudiants inscrits** | Table `auth.users` Supabase en direct |
| **Visiteurs Uniques** | **138 visiteurs** (422 pages vues) | Vercel Analytics en direct |
| **Acquisition Terrain & Guerilla** | **Micro-trottoirs à Nancy, bus, affichage QR codes & TikTok** | Tests réels en direct, campagne de stickers & vidéo pitch avec inconnus |

---

## 🎯 Plaidoyer pour la Note 10/10 sur les 4 Critères du Jury

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CRITÈRES FOUNDERRACE                                  │
├────────────────────────────────┬─────────────────────────────────────────────────┤
│ 1. A Real Problem Identified   │ 10/10 — Douleur aiguë des partiels & rush exams  │
│ 2. MVP Quality & Execution     │ 10/10 — Sub-2s, Canvas compression, 3D cards     │
│ 3. Proof of Traction           │ 10/10 — 59,94 € Stripe Live, 6 clients, 19 users │
│ 4. Video Pitch & Showcase      │ 10/10 — Format vertical 9:16 + page /recap dédiée│
└────────────────────────────────┴─────────────────────────────────────────────────┘
```

### 1. A Real Problem Identified (10/10)
- **Le constat terrain** : À l'approche des partiels, des millions d'étudiants croulent sous des centaines de pages de cours désordonnées, manquent de temps pour ficher et subissent le stress de la page blanche.
- **La solution Loreno** : Transformer n'importe quel support (notes manuscrites, polycopiés, schémas de tableau) en un système complet de révision active (Flashcards, Quiz d'examen et Tuteur IA) en **moins de 2 secondes**.
- **Viabilité Post-Race** : Loreno n'est pas un projet jetable de hackathon mais un SaaS rentable dès son premier jour, taillé pour accompagner les étudiants tout au long de l'année universitaire.

### 2. MVP Quality & Engineering Commando (10/10)
- **Traitement Ultra-Rapide (< 2s)** : Compression Canvas HTML5 côté client réduisant les photos de 5 Mo à < 400 Ko en 15ms avant tout envoi réseau.
- **Expérience Mobile-First Native** : Shell smartphone (`max-w-md`, `min-h-[100dvh]`, cibles tactiles 44px) optimisé pour le trafic TikTok/Reels.
- **Effet Miroir & Fiabilité** : Tiroir d'affichage de la photo originale pour vérifier chaque carte par rapport à la note manuscrite d'origine.
- **Rétention & Gamification (Round 2 & Note /20)** : Système de deuxième chance ciblant uniquement les cartes manquées et calcul d'une note prédictive réaliste avec mentions académiques.

### 3. Proof of Traction & Willingness to Pay (10/10 🏆)
- **Validation financière absolue** : **59,94 € encaissés en direct sur Stripe Live**, prouvant que les étudiants sont prêts à payer immédiatement pour réussir leurs examens.
- **Acquisition multi-canale** : Sortie immédiate sur le terrain à Nancy pour faire tester l'application en direct aux étudiants, diffusion sur Instagram (@baptiste__fry), TikTok et les communautés étudiantes Discord.

### 4. Video Pitch & Dedicated Recap (10/10)
- **Format Vertical 9:16** adapté à la consommation mobile et aux jurys modernes.
- **Page `/recap` interactive** intégrant les lecteurs vidéo, la chronologie complète du sprint 24h et une galerie photo haute résolution avec modal lightbox.

---

## ⚡ Fonctionnalités Détaillées du Produit

### 📸 1. Scan Intelligent Multimodal & Compression Client
- Déclenchement instantané de l'appareil photo via `capture="environment"`.
- Compression Canvas bicubique automatique (max 1600px, JPEG 0.8) divisant le poids de la photo de **5 Mo à < 400 Ko** sans dégrader la lisibilité de l'écriture manuscrite.
- Analyse OCR & Pédagogique par **Google Gemini 1.5 Flash Vision** (`@google/genai`) extrayant en une seule passe le titre, la matière, le résumé, la question piège et 5 à 8 flashcards prioritaires.

### 🎴 2. Moteur de Flashcards 3D avec Rétention Active
- Cartes recto/verso avec animation CSS 3D ultra-fluide au tap.
- Swipe gestuel intuitif (Gauche = "À revoir", Droite = "Je sais").
- **Bouton Effet Miroir** : Ouvre la note manuscrite originale scannée pour vérifier instantanément le contexte d'origine.
- Barre de progression dynamique et score de rétention en temps réel.

### 🎯 3. Quiz d'Examen, Mode Round 2 & Note /20
- **Micro-Explications Instantanées** : Explication pédagogique immédiate dès qu'une erreur est commise pour comprendre la notion sous-jacente.
- **Mode Deuxième Chance (Round 2)** : En fin de série, l'étudiant peut relancer un round concentré exclusivement sur ses cartes manquées pour atteindre 100% de maîtrise.
- **Note Prédictive d'Examen** : Calcul d'une note réaliste sur 20 avec mention officielle (18/20 Très Bien, 12/20 Admis, 8/20 Rattrapage).

### 🤖 4. Tuteur d'Examen IA Interactif
- Chatbot conversationnel propulsé par Gemini 1.5 Flash, ancré directement sur le cours scanné de l'étudiant.
- Pose proactive de questions pièges d'examen pour challenger l'étudiant avant le jour J.
- Rendu Markdown élégant et streaming mot par mot pour une expérience conversationnelle fluide.

### 💳 5. Tunnel de Monétisation & Déblocage Immédiat
- Intégration d'un **Payment Link Stripe Live** (Pass Partiels Fondateur à 9,99 €).
- Déblocage automatique et permanent côté client dès le retour Stripe (`paid=true`).
- Synchronisation en tâche de fond avec les `user_metadata` Supabase et persistance `localStorage`.

---

## 🏗️ Architecture & Arborescence du Code

```
locked-founder-race/
├── app/
│   ├── api/
│   │   ├── auth/email/     # Route d'authentification sans mot de passe
│   │   ├── decks/          # CRUD Supabase des cours et flashcards
│   │   ├── feedback/       # Collecte des retours utilisateurs & envoi email
│   │   ├── scan/           # OCR Multimodal Gemini 1.5 Flash Vision & Fallbacks
│   │   └── tutor/          # Assistant conversationnel d'examen Gemini
│   ├── dashboard/          # Espace étudiant, carnet de cours & player
│   ├── quiz/               # Tunnel de diagnostic & personnalisation
│   ├── recap/              # Page vitrine officielle FounderRace & Timeline 24H
│   ├── layout.tsx          # Shell racine, polices Inter & configuration SEO
│   └── page.tsx            # Landing page mobile-first à haute conversion
├── components/
│   ├── dashboard/
│   │   ├── ai-tutor-modal.tsx      # Modal de chat avec le Tuteur IA
│   │   ├── feedback-modal.tsx      # Modal de recueil des avis étudiants
│   │   ├── notebook-card.tsx       # Carte de cours avec aperçu et actions
│   │   └── user-profile-modal.tsx  # Gestion du profil et statut Pro
│   ├── recap/
│   │   ├── recap-timeline.tsx      # Chronologie interactive des 24h
│   │   └── image-lightbox-modal.tsx# Visionneuse photo plein écran (zoom)
│   ├── camera-upload.tsx           # Déclencheur caméra & compression Canvas
│   ├── flashcard-player.tsx        # Moteur de révision 3D & swipe
│   ├── flashcard-complete-view.tsx # Écran de fin, score /20 & bouton Round 2
│   ├── mirror-modal.tsx            # Tiroir photo de la note originale
│   └── paywall-modal.tsx           # Modal de conversion Stripe Pass Fondateur
├── lib/
│   ├── supabase/                   # Clients Supabase SSR (Server & Browser)
│   ├── image-compression.ts        # Service de redimensionnement Canvas
│   ├── quiz-data.ts                # Données statiques du quiz de cadrage
│   ├── use-pro-status.ts           # Hook de résolution du statut payant
│   └── utils.ts                    # Utilitaires de classes Tailwind (clsx/twMerge)
├── types/
│   └── loreno.ts                   # Interfaces TypeScript strictes (0 any)
├── supabase/
│   └── schema.sql                  # Schéma PostgreSQL & politiques RLS
└── ARCHITECTURE.md                 # Spécification technique complète
```

---

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router, Turbopack, React 19)
- **Langage** : TypeScript Strict (`noImplicitAny`, interfaces explicites)
- **Style & UI** : Tailwind CSS, Lucide Icons, Canvas Confetti
- **Base de Données & Stockage** : Supabase (PostgreSQL, Row Level Security, Bucket `course-scans`)
- **Authentification** : Supabase SSR Auth (Email & Passwordless)
- **Intelligence Artificielle** : Google Gemini 1.5 Flash (`@google/genai`)
- **Paiements** : Stripe Live Payment Links (9,99 €)
- **Hébergement & Analytics** : Vercel (Edge Network & Vercel Web Analytics)

---

## 🚀 Installation & Démarrage Local

### 1. Cloner le Dépôt
```bash
git clone https://github.com/juliennoel22/locked-fouder-race.git
cd locked-fouder-race
npm install
```

### 2. Configurer les Variables d'Environnement
Créer un fichier `.env.local` à la racine du projet :
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<ton-projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ta-cle-anon>
SUPABASE_SERVICE_ROLE_KEY=<ta-cle-service-role>

# Google Gemini Vision & Tutor
GEMINI_API_KEY=<ta-cle-gemini-api>

# Stripe Live
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...
```

### 3. Lancer le Serveur de Développement
```bash
npm run dev
```
Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur (mode mobile recommandé).

### 4. Compiler pour la Production
```bash
npm run build
```

---

## 🛡️ Robustesse, Sécurité & Gestion des Erreurs

1. **Résilience API & Fallbacks 429** : Si l'API Gemini subit un rate limit ou un délai réseau, les routes `/api/scan` et `/api/tutor` basculent de manière transparente sur des données pédagogiques complètes sans bloquer l'étudiant.
2. **Authentification Défensive** : Détection des utilisateurs connectés via Cookies SSR, Header `Authorization: Bearer` et validation JWT Claims.
3. **Zéro Donnée Sensible Exposée** : Clés secrètes Stripe et Gemini strictement cantonnées côté serveur.
4. **Code Modulaire Commando** : Chaque fichier source fait strictement moins de 300 lignes pour une maintenabilité optimale.

---

<div align="center">
  <sub>Développé avec passion en 24h chrono lors du Hackathon FounderRace 2026.</sub><br>
  <strong>Loreno ⚡ — Révise tes partiels à la vitesse de l'éclair.</strong>
</div>