# MEMORY.md — JOURNAL DE BORD & ÉTAT DU PROJET LORENO (EX-SNAPSTUDY)

## 🎯 Identité du Produit
- **Hackathon** : FounderRace 2026 (12 Septembre 08h00 - 13 Septembre 08h00 UTC+2).
- **Produit** : **Loreno** (`https://www.loreno.app/`) — Scan de notes de cours manuscrites $\rightarrow$ Flashcards swipe 3D tactiles + Effet miroir photo originale + Tuteur d'examen IA.
- **Canal n°1** : Trafic TikTok/Reels direct $\rightarrow$ **Application 100% Mobile-First** (Shell smartphone centré sur desktop).
- **Objectif Principal du Jury** : Chiffre d'affaires encaissé en direct sur Stripe (Pass Partiels Fondateur à 9,99 €). Clé API Stripe Read-Only fournie au jury.

---

## ⚡ Décisions Fondatrices 80/20 Validées
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

### 2. Stripe Compte Dédié Loreno
- **Stripe Account ID** : `acct_1UEmR2AqwJcN83vt` (Loreno)
- **Produit** : `Loreno — Pass Partiels Fondateur (Accès à vie)` (`prod_VFH1j5uWcYJqRi`)
- **Prix** : `price_1UEmTMAqwJcN83vtnScd3rDZ` (9,99 € TTC, code taxe `txcd_10000000`)
- **Stripe Payment Link Direct** :  
  👉 **[https://buy.stripe.com/test_aFa9AS0wr0J53iJfdR3VC00](https://buy.stripe.com/test_aFa9AS0wr0J53iJfdR3VC00)**
- **Clé API Publishable** : `pk_test_51UEmR2AqwJcN83vtQIF4aQV48oDeBNTUimo478YtSR9zw2GyfsMvUbdqKUy7bMRDflOt3quuN804LbqI8XFCEG2R00RWwSdftK`

### 3. Supabase Loreno
- **Organisation** : `LORENO (FREE)`
- **Project Ref** : `bfxbrveuwyiidfthevdn`
- **Project URL** : `https://bfxbrveuwyiidfthevdn.supabase.co`
- **Publishable Key** : `sb_publishable_qPKyRvryGiPpgS893UUPlg_P6LJz_S6`
- **Schéma SQL & Storage** : Exécuté avec succès ! Tables `decks`, `flashcards`, bucket public `course-scans` et RLS configurés.

---

## 🗺️ Roadmap Commando 24H

| Phase | Milestone | Statut | Description |
|---|---|---|---|
| **Phase 0** | **Socle Mobile & Gouvernance** | 🟢 Terminé | `AGENTS.md`, `MEMORY.md`, `supabase/schema.sql`, `layout.tsx` (Viewport mobile), `globals.css` (Dvh + 3D flip). |
| **Phase 1** | **Infra Vercel & Stripe Live** | 🟢 Terminé | Domaine `https://www.loreno.app` déployé en production, compte Stripe dédié Loreno configuré, Payment Link 9,99 € actif. |
| **Phase 2** | **Supabase DB & Auth Gateway** | 🟢 Terminé | Schéma SQL exécuté, tables `decks`, `flashcards` et bucket `course-scans` créés. Clés branchées. |
| **Phase 3** | **Upload Caméra & Compression Canvas** | 🟢 Terminé | Composant `CameraUpload`, redimensionnement Canvas < 400 Ko, upload Supabase Storage `course-scans`. |
| **Phase 4** | **Player Flashcards 3D Swipe & Paywall** | 🟢 Terminé | `FlashcardPlayer` tactile swipe 3D, confettis, `MirrorModal` (photo originale) et `PaywallModal` (9,99 € Stripe). |
| **Phase 5** | **OCR Vision Gemini 3.6 Flash** | 🟢 Terminé | Route `/api/scan` avec SDK `@google/genai` (Interactions API / `gemini-3.6-flash`) validée et connectée en production. |
| **Phase 6** | **Tuteur d'Examen IA (Chatbot)** | 🟡 En cours | Chatbot interactif posant la 1ère question d'examen déduite du cours scanné. |
| **Phase 7** | **Vidéo Pitch & Soumission Jury** | ⚪ Prévu | Vidéo MP4 $\le$ 500 Mo, vérification clé Stripe Read-Only, repo public. |
