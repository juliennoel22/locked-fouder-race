# Loreno (loreno.app) — Hackathon FounderRace 2026

> **Prends en photo tes notes de cours (manuscrites ou imprimées) : obtiens tes fiches de révision 3D interactives, tes quiz d'examen et ton Tuteur IA Socratique en moins de 2 secondes.**

- 🌐 **Application en ligne** : [https://www.loreno.app](https://www.loreno.app)
- 🎬 **Page Showcase Jury & Pitch** : [https://www.loreno.app/recap](https://www.loreno.app/recap)
- 👥 **Équipe** : **Julien Noel** (Lead Fullstack & Product Builder) & **Baptiste** (Acquisition & Growth)
- ⏱️ **Événement** : **Sprint Commando 24H** - FounderRace 2026

---

## 🏆 Tableau de Bord & Résultats de Traction (Stripe Live)

| Indicateur Clé | Résultat Réel | Source & Preuve Vérifiable |
| :--- | :--- | :--- |
| **Chiffre d'Affaires Encaissé (CA)** | **59,94 €** | **Stripe Live** (6 transactions réelles de 9,99 €) |
| **Clients Payants** | **6 étudiants validés** | Edwin, Danial, Yanis, Emmanuel, Greg, Hugo |
| **Comptes Étudiants Actifs** | **23 comptes réels** | Table `auth.users` Supabase (après purge des tests) |
| **Visiteurs Uniques** | **148 visiteurs** (452 pages vues) | Vercel Analytics en direct |
| **Traction TikTok** | **3 100+ vues cumulées** | Compte officiel `@loreno.app` (micro-trottoirs nancéiens) |
| **SEO & Indexation Google** | **Position #1 sur `loreno app`** | Indexé et positionné au sommet sur Google |
| **Code Promo Démo Jury** | **`FOUNDERRACE`** | 100% offert sur le Pass Fondateur Stripe Live |

---

## 🎯 Conformité aux 4 Critères du Jury FounderRace

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

---

## 🔥 Ce qui est en Place (Livré & Opérationnel)

### 📸 1. Ingestion OCR Multimodale & Compression Client
- Redimensionnement automatique Canvas HTML5 (1600px, JPEG 0.8) réduisant le poids de **5 Mo à < 400 Ko** en 15ms.
- Supabase Storage : Upload instantané vers le bucket public `course-scans/${user.id}/${deckId}.jpg`.
- Extraction structurée par **Google Gemini 1.5 Flash Vision** (`@google/genai`) avec Schéma JSON strict.

### 🎴 2. Parcours de Révision Adaptatif Duolingo
- **Étape 1 • Flashcards 3D** : Flip au tap (rotateY 3D) & boutons pouce ("À revoir" / "Je sais").
- **Étape 2 • Quiz Notionnel QCM** : Distracteurs dynamiques extraits du cours.
- **Étape 3 • Question Piège d'Examen** : Mise en situation sur les erreurs classiques d'épreuve.
- **Ré-injection d'erreurs (Option A)** : Les cartes échouées repassent automatiquement en fin de parcours.
- **Effet Miroir Multi-Photos** (`MirrorModal`) : Consultation, pivot à 90° et ré-ordonnancement des documents d'origine.

### 🎁 3. Moteur d'Affiliation Cash 20% & 3 Jours Pro
- Attribution de **20% de commission cash** par vente parrainée.
- Capture automatique du lien d'affiliation (`?ref=CODE_PARRAIN`).
- **3 Jours Pro offerts** instantanément aux filleuls.
- Demande de virement bancaire automatique dès 70,00 € accumulés (`payout_requests`).

### 🤖 4. Tuteur d'Examen IA Socratique
- Assistant conversationnel limité à 3 phrases maximum avec relance Socratique par question guidée.

### 💳 5. Tunnel Paywall & Monétisation Directe
- Déclencheur au pic de dopamine rétention (après 3 cartes réussies ou 100% de complétion).
- Pass Fondateur 9,99 € à vie en redirection **Stripe Payment Link Live**.

### 🏗️ 6. Excellence d'Ingénierie Agentique 2026
- **Modularité Stricte** : 100% des fichiers font **moins de 300 lignes** (zero fichier dieu).
- **Zéro `any` & Contrats Zod** : Payload API validé par schémas Zod (`lib/validations.ts`).
- **Design Tokens Unifiés** : Thème `brand` (`#4457f4`), `brand-hover`, `border-brand/20` unifié dans Tailwind et CSS variables.
- **Living Agentic Backlog** : Triage automatisé via `INBOX_BAPTISTE.md`, fiches atomiques `tasks/TASK-XXX.md` (YAML Frontmatter) et Kanban `tasks/BOARD.md`.

---

## 🔮 Ce qui N'est PAS Encore là (Roadmap V2)

1. **Streaks & Relances Courbe d'Oubli (SuperMemo SM-2)** : Notifications quotidiennes pour maintenir la flamme.
2. **Calibrage par Date de Partiel** : Compteur J-X d'épreuve dans l'onboarding pour ajuster l'intensité.
3. **Mode Podcast Audio (Text-to-Speech)** : Génération audio de la fiche de révision.
4. **Mode Focus App Blocker (Opal Style)** : Blocker anti-distraction pendant la session.

---

## 📐 Architecture Technique

```
locked-founder-race/
├── app/
│   ├── api/
│   │   ├── auth/email/         # Auth 1-Tap Passwordless & OTP
│   │   ├── decks/              # CRUD Supabase, append & generate-game
│   │   ├── feedback/           # Collecte des retours utilisateurs
│   │   ├── referral/           # Affiliation cash & demandes de virement
│   │   ├── scan/               # OCR Vision Gemini 1.5 Flash
│   │   ├── tutor/              # Assistant d'examen Socratique
│   │   └── webhooks/stripe/    # Webhook Stripe d'activation Pro & commission
│   ├── auth/login/page.tsx     # Route d'authentification unifiée (< 110L)
│   ├── dashboard/              # Espace carnet & révision
│   ├── quiz/page.tsx           # Tunnel onboarding & diagnostic (< 100L)
│   └── recap/                  # Showcase officiel FounderRace & Timeline
├── components/
│   ├── auth/                   # Modules OTP & Google Auth (< 150L)
│   ├── mirror/                 # Visionneuse multi-documents original (< 150L)
│   ├── review/                 # Étapes du joueur adaptatif (< 150L)
│   └── quiz/                   # Composants du quiz d'onboarding (< 120L)
├── docs/                       # Audit stratégique & Architecture agentique
├── tasks/                      # Backlog de tâches atomiques (YAML Frontmatter)
├── lib/
│   ├── validations.ts          # Source unique de vérité des schémas Zod
│   ├── image-compression.ts    # Compression Canvas HTML5 (1600px, 0.8)
│   └── rate-limit.ts           # Protection anti-abus API
└── INBOX_BAPTISTE.md           # Zone de dépôt rapide des retours Baptiste
```

---

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router, Turbopack, React 19)
- **Langage** : TypeScript Strict (`noImplicitAny`, 0 `any`)
- **Style & UI** : Tailwind CSS (Tokens sémantiques `brand`), Lucide Icons, Canvas Confetti
- **Base de Données & Stockage** : Supabase (PostgreSQL, RLS, Storage `course-scans`)
- **Validation** : Zod (`lib/validations.ts`)
- **Intelligence Artificielle** : Google Gemini 1.5 Flash (`@google/genai`)
- **Paiements** : Stripe Live Payment Links (9,99 €)
- **Hébergement** : Vercel (Edge Network & Analytics)

---

<div align="center">
  <sub>Développé lors du Sprint Commando FounderRace 2026.</sub><br>
  <strong>Loreno — Révise tes partiels à la vitesse de l'éclair.</strong>
</div>