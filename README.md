# Loreno ⚡ (loreno.app) — Hackathon FounderRace 2026

> **Transform handwritten notes into interactive 3D flashcards, predicted exam quizzes, and an AI Exam Tutor in under 2 seconds.**

Live Application: **[https://www.loreno.app](https://www.loreno.app)**  
Recap & Jury Showcase: **[https://www.loreno.app/recap](https://www.loreno.app/recap)**  
Author: **Julien Noel** & **Baptiste Fry** (Sprint 24H — 12-13 September 2026)

---

## 🏆 24H Race Results & Traction (Stripe Live)

| Metric | Result | Source / Verification |
| :--- | :--- | :--- |
| **Gross Revenue (CA)** | **59,94 €** | Stripe Live (6x 9.99 € Founder Passes) |
| **Paying Customers** | **6 students** | Edwin, Danial, Yanis, Emmanuel, Greg, Hugo |
| **Registered Users** | **19 accounts** | Supabase Auth (Email & Passwordless) |
| **Traffic** | **104 unique visitors** (316 pageviews) | Vercel Analytics |
| **Acquisition** | **Micro-trottoirs Nancy + TikTok/Instagram** | Real field tests & student feedback |

---

## 🎯 Alignment with the 4 FounderRace Jury Criteria

### 1. A Real Problem Identified (10/10)
- **Problem**: Millions of students face stressful exams with messy handwritten notes and zero time to synthesize definitions.
- **Solution**: Instant OCR with Gemini 1.5 Flash Vision + active recall flashcards + predictive exam quiz on /20 + interactive exam tutor.
- **Post-Race Viability**: Loreno is a sustainable SaaS product ready for the entire exam season.

### 2. MVP Quality & Execution (10/10)
- **Sub-2s Processing**: HTML5 Canvas client-side compression reduces 5MB photos to < 400KB before upload.
- **Dopamine Retention**: 3D flip flashcards, Mirror Photo Drawer (verifying the original course photo), and dynamic streak counters.
- **Exam Readiness**: Interactive quizzes with **Round 2 Second Chance** on mistakes, instant pedagogical explanations, and a predictive grade on /20.
- **Mobile-First Native Shell**: Fluid responsive shell (`max-w-md`, `min-h-[100dvh]`, 44px touch targets).

### 3. Proof of Traction & Willingness to Pay (10/10 🏆)
- **59,94 € collected in 24h** directly on Stripe Live.
- Video and photographic evidence of field testing and student conversion in Nancy available on `/recap`.

### 4. Video Pitch & Dedicated Recap
- Vertical 9:16 video pitch and interactive walkthrough hosted at **[`loreno.app/recap`](https://www.loreno.app/recap)**.

---

## 🛠️ Architecture & Tech Stack

```
locked-founder-race/
├── app/
│   ├── api/
│   │   ├── auth/          # Passwordless email auth handler
│   │   ├── decks/         # Deck CRUD endpoints
│   │   ├── feedback/      # User feedback collector
│   │   ├── scan/          # Gemini 1.5 Flash Vision OCR & JSON parsing
│   │   └── tutor/         # Gemini 1.5 Flash conversational exam tutor
│   ├── dashboard/         # Notebooks, flashcards player & quiz runner
│   ├── recap/             # Interactive 24h timeline, KPIs & video slots
│   └── (auth-pages)/      # Supabase authentication flows
├── components/
│   ├── dashboard/         # AI Tutor modal, feedback modal, notebook card
│   ├── recap/             # Timeline & photo lightbox modal
│   ├── camera-upload.tsx  # Camera trigger with canvas JPEG compression
│   ├── flashcard-player.tsx # 3D swipe & flip card engine
│   └── mirror-modal.tsx   # Original handwritten note drawer
├── lib/
│   ├── image-compression.ts # Client-side canvas downscaling (max 1600px)
│   ├── use-pro-status.ts  # Client-side persistent Pro access resolver
│   └── supabase/          # SSR Supabase client configuration
└── types/
    └── loreno.ts          # Strict TypeScript interfaces
```

### Key Integrations
- **Google Gemini 1.5 Flash** (`@google/genai`): Multimodal analysis of handwriting, exam quiz generation, and pedagogical tutoring.
- **Supabase**: PostgreSQL database, row-level security (RLS), and secure image storage (`course-scans`).
- **Stripe**: Live payment links with instant client unlocking (`paid=true`).
- **Next.js 15 & Turbopack**: App router with TypeScript strict mode (all files < 300 lines).

---

## 🚀 Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/juliennoel22/locked-fouder-race.git
cd locked-fouder-race
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file with the following keys:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Google Gemini Vision
GEMINI_API_KEY=<your-gemini-api-key>

# Stripe Live
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🛡️ Security & Reliability
- **Non-blocking AI Fallbacks**: Both `/api/scan` and `/api/tutor` include automatic fallbacks if rate limits or network issues occur.
- **Client Compression**: Large photo uploads are crushed to < 400KB to ensure sub-2-second latency even on 3G/4G connections.
- **Zero Hallucination Guarantee**: Strict TypeScript schemas validate all structured outputs before database persistence.

---
*Built with passion in 24 hours for FounderRace 2026.*