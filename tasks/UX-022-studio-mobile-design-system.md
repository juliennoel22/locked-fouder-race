---
id: "UX-022"
type: "ux"
priority: "P0"
title: "Overhaul Design System Mobile-First Studio & Tactile Depth"
author: "Julien"
status: "resolved"
created_at: "2026-10-15"
resolved_at: "2026-10-15"
files_impacted:
  - "app/globals.css"
  - "app/dashboard/page.tsx"
  - "app/deck/[id]/page.tsx"
  - "app/review/[id]/page.tsx"
  - "app/quiz/page.tsx"
  - "components/Header.tsx"
  - "components/dashboard/notebook-list-item.tsx"
  - "components/dashboard/notebook-list-view.tsx"
  - "components/paywall-modal.tsx"
  - "components/mirror-modal.tsx"
  - "components/dashboard/ai-tutor-modal.tsx"
  - "components/quiz-scan-step.tsx"
  - "components/review/review-flashcard-step.tsx"
  - "components/review/review-quiz-step.tsx"
  - "components/review/review-freetext-step.tsx"
  - "components/ui/mobile-bottom-drawer.tsx"
---

# UX-022 — Overhaul Design System Mobile-First Studio & Tactile Depth

## 🎯 Objectif
Élever l'expérience utilisateur de Loreno au standard d'une application mobile native premium (Apple Music / Duolingo / Linear) sur WebView TikTok / Instagram et Safari iOS / Chrome Android, sans introduire de bibliothèque externe lourde (pas de Konsta, Vaul ou Ionic).

## 🛠️ Réalisations
1. **Élimination du 300ms Tap Delay & Anti-Rebond WebView** :
   - Règle globale `touch-action: manipulation;` sur tous les boutons, liens et inputs dans `app/globals.css`.
   - `overscroll-behavior-y: none;` et `-webkit-tap-highlight-color: transparent;`.
2. **Contraste de Surfaces "Studio" (`#F8F9FA` vs `#FFFFFF`)** :
   - Fin de la platitude "blanc sur blanc" : fond d'écran configuré en `#F8F9FA` sur le dashboard, la fiche cours, le moteur de révision et le quiz.
   - Les cartes de contenu (cours, flashcards, QCM, fiches) ressortent sur fond blanc pur avec `border-zinc-200/90` et ombre subtile `shadow-[0_2px_8px_rgba(0,0,0,0.03)]`.
3. **Composant Bottom Sheet Mobile & Modales Natives iOS** :
   - Création de `components/ui/mobile-bottom-drawer.tsx` : tiroir coulissant avec tirette iOS (`grab handle`), fermeture au drag vers le bas, backdrop blur et respect strict des safe-areas.
   - Intégration de la tirette et des safe-areas sur `PaywallModal`, `MirrorModal` et `AiTutorModal`.
4. **Ergonomie Tactile & Thumb Zone** :
   - Retours d'appui `active:scale-[0.98]` et `active:scale-95` sur l'ensemble des cibles interactives.
   - Padding sécurisé `pb-[calc(1rem+env(safe-area-inset-bottom))]` sur tous les boutons d'action fixes.

## 🧪 Validation
- `npm run lint` : 0 erreur, 0 avertissement.
- `npm run build` : 44/44 routes compilées avec succès.
- Limite des 300 lignes : 100% des fichiers strictement sous 300 lignes (max : 295 lignes pour `ai-tutor-modal.tsx`).
