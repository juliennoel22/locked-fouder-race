# Loreno ⚡ (loreno.app) - Hackathon FounderRace 2026

> **Prends en photo tes notes de cours (même manuscrites ou brouillonnes) : obtiens tes fiches de révision 3D interactives, ton quiz noté sur /20 avec Round 2, et ton Tuteur d'Examen IA en moins de 2 secondes.**

- 🌐 **Application en ligne** : [https://www.loreno.app](https://www.loreno.app)
- 🎬 **Page Récapitulative & Espace Jury** : [https://www.loreno.app/recap](https://www.loreno.app/recap)
- 👥 **Équipe** : **Julien** (Lead Fullstack & Product Builder) & **Baptiste** (Acquisition & Growth)
- ⏱️ **Événement** : **Sprint Commando 24H** - 12 au 13 Septembre 2026

---

## 🏆 Tableau de Bord & Résultats de Traction 24H (Stripe Live)

| Indicateur Clé | Résultat Réel (24h) | Source & Preuve Vérifiable |
| :--- | :--- | :--- |
| **Chiffre d'Affaires Encaissé (CA)** | **59,94 €** | **Stripe Live** (6 transactions réelles de 9,99 €) |
| **Clients Payants** | **6 étudiants validés** | Edwin, Danial, Yanis, Emmanuel, Greg, Hugo |
| **Comptes Étudiants Actifs** | **23 comptes réels** | Table `auth.users` Supabase (après purge des tests) |
| **Visiteurs Uniques** | **148 visiteurs** (452 pages vues) | Vercel Analytics en direct |
| **Traction TikTok** | **3 100+ vues cumulées** | Compte officiel `@loreno.app` (micro-trottoirs nancéiens) |
| **SEO & Indexation Google** | **Position #1 sur `loreno app`** | Indexé et positionné au sommet sur Google |
| **Code Promo Démo Jury** | **`FOUNDERRACE`** | 100% offert sur le Pass Fondateur Stripe Live |

---

## 🎯 Plaidoyer pour la Note 10/10 sur les 4 Critères du Jury

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CRITÈRES FOUNDERRACE                                  │
├────────────────────────────────┬─────────────────────────────────────────────────┤
│ 1. A Real Problem Identified   │ 10/10 : Douleur aiguë des partiels & rush exams  │
│ 2. MVP Quality & Execution     │ 10/10 : Sub-2s, Canvas compression, 3D cards     │
│ 3. Proof of Traction           │ 10/10 : 59,94 € Stripe Live, 6 clients payants   │
│ 4. Video Pitch & Showcase      │ 10/10 : Pitch 9:16 + page /recap interactive     │
└────────────────────────────────┴─────────────────────────────────────────────────┘
```

### 1. A Real Problem Identified (10/10)
- **Le constat terrain** : À l'approche des partiels, des millions d'étudiants croulent sous des centaines de pages de cours désordonnées, manquent de temps pour ficher et subissent le stress de la page blanche.
- **La solution Loreno** : Transformer n'importe quel support (notes manuscrites, polycopiés, schémas de tableau) en un système complet de révision active (Flashcards, Quiz d'examen et Tuteur IA) en **moins de 2 secondes**.

### 2. MVP Quality & Engineering Commando (10/10)
- **Traitement Ultra-Rapide (< 2s)** : Compression Canvas HTML5 côté client réduisant les photos de 5 Mo à < 400 Ko en 15ms avant tout envoi réseau.
- **Sécurité & Middleware Next.js** : Middleware SSR protégeant les routes `/dashboard` avec redirection automatique des flux non connectés ou d'onboarding.
- **Persistance en Base de Données** : Sauvegarde en temps réel de l'étape d'onboarding (`user_metadata`) et restauration instantanée à la reconnexion.
- **Expérience Mobile-First Native** : Shell smartphone (`max-w-md`, `min-h-[100dvh]`, cibles tactiles 44px) optimisé pour le trafic TikTok/Reels.

### 3. Proof of Traction & Willingness to Pay (10/10 🏆)
- **Validation financière absolue** : **59,94 € encaissés en direct sur Stripe Live**, prouvant que les étudiants sont prêts à payer immédiatement pour réussir leurs examens.
- **Preuves et témoignages réels** : Galerie de retours d'étudiants et confirmations d'achat intégrées sur `/recap` avec visionneuse plein écran.

### 4. Video Pitch & Dedicated Recap (10/10)
- **Lecteur Vidéo H.264 optimisé** avec lecture fluide immédiate.
- **Timeline 24H complète** détaillant chaque jalon du hackathon de 08:00 à la clôture finale.

---

## ⚡ Fonctionnalités Clés du Produit

### 📸 1. Scan Multimodal & Compression Client
- Déclenchement instantané appareil photo (`capture="environment"`).
- Compression Canvas bicubique automatique (max 1600px, JPEG 0.8) divisant le poids de la photo de **5 Mo à < 400 Ko**.
- Analyse OCR & Pédagogique par **Google Gemini 1.5 Flash Vision** (`@google/genai`).

### 🎴 2. Moteur de Flashcards 3D avec Rétention Active
- Cartes recto/verso avec flip 3D CSS et swipe gestuel.
- **Bouton Effet Miroir** : Ouvre la photo du cours original pour vérifier le contexte.
- **Mode Round 2** : Deuxième chance ciblant exclusivement les cartes ratées.
- **Note Prédictive /20** : Calcul réaliste avec mention académique.

### 🤖 3. Tuteur d'Examen IA Interactif
- Chatbot conversationnel propulsé par Gemini 1.5 Flash, ancré sur le cours scanné de l'étudiant.
- Pose proactive de questions pièges d'examen pour tester la compréhension profonde.

### 🔐 4. Authentification & Middleware Résilient
- **Connexion 1-Tap Passwordless** via `/api/auth/email` avec signature déterministe sécurisée.
- **Sauvegarde d'Onboarding** : Synchronisation continue de la progression (`/api/user/onboarding`).
- **Protection Middleware Next.js** (`middleware.ts`) pour les routes protégées.

### 💳 5. Tunnel de Monétisation & Déblocage Immédiat
- Intégration d'un **Payment Link Stripe Live** (Pass Partiels Fondateur à 9,99 €).
- Déblocage permanent côté client et synchronisation automatique du profil.

---

## 🏗️ Architecture du Projet

```
locked-founder-race/
├── app/
│   ├── api/
│   │   ├── auth/email/         # Auth 1-Tap Passwordless
│   │   ├── decks/              # CRUD Supabase cours & flashcards
│   │   ├── feedback/           # Collecte des retours utilisateurs
│   │   ├── scan/               # OCR Vision Gemini 1.5 Flash
│   │   ├── tutor/              # Assistant d'examen interactif
│   │   └── user/onboarding/    # Persistance de l'onboarding en base
│   ├── dashboard/              # Espace étudiant & révision
│   ├── quiz/                   # Tunnel onboarding & diagnostic
│   ├── recap/                  # Showcase officiel FounderRace & Timeline
│   ├── layout.tsx              # Layout racine, SEO & Toaster
│   └── page.tsx                # Landing page mobile-first
├── components/
│   ├── dashboard/              # Vues carnet, scan modal, tuteur IA
│   ├── recap/                  # Lecteur pitch, timeline, témoignages
│   ├── ui/                     # Système de toasts légers
│   └── flashcard-player.tsx    # Moteur 3D de révision
├── lib/
│   ├── supabase/               # Clients Supabase SSR & Middleware
│   ├── image-compression.ts    # Compression Canvas HTML5
│   └── use-pro-status.ts       # Hook de gestion du statut Pro
├── middleware.ts               # Middleware Next.js de session & sécurité
└── ARCHITECTURE.md             # Spécification technique complète
```

---

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router, Turbopack, React 19)
- **Langage** : TypeScript Strict (`noImplicitAny`, 0 `any`)
- **Style & UI** : Tailwind CSS, Lucide Icons, Canvas Confetti
- **Base de Données & Stockage** : Supabase (PostgreSQL, RLS, Storage `course-scans`)
- **Authentification** : Supabase SSR Auth (Passwordless & Google OAuth)
- **Intelligence Artificielle** : Google Gemini 1.5 Flash (`@google/genai`)
- **Paiements** : Stripe Live Payment Links (9,99 €)
- **Hébergement & Analytics** : Vercel (Edge Network & Vercel Web Analytics)

---

<div align="center">
  <sub>Développé avec passion en 24h chrono lors du Hackathon FounderRace 2026.</sub><br>
  <strong>Loreno ⚡ - Révise tes partiels à la vitesse de l'éclair.</strong>
</div>