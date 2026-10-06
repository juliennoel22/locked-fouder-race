---
id: CHORE-001
title: "Refactoring modulaire des composants > 300 lignes et validation Zod"
author: "Julien"
type: "chore"
status: "resolved"
priority: "p0"
created_at: "2026-10-04"
affected_files:
  - components/mirror-modal.tsx
  - components/AdaptativeReviewPlayer.tsx
  - app/auth/login/page.tsx
  - app/auth/page.tsx
  - components/quiz-steps-form.tsx
  - app/quiz/page.tsx
  - components/dashboard/notebook-detail.tsx
  - lib/validations.ts
  - app/api/decks/route.ts
  - app/api/referral/route.ts
acceptance_criteria:
  - "100% des fichiers du repo ont moins de 300 lignes"
  - "Zéro 'any' dans les route handlers"
  - "npm run build passe avec 0 erreur"
---

# CHORE-001 : Refactoring modulaire & Contrats Zod stricts

## 1. Contexte & Problème
Plusieurs composants avaient dépassé les 300 lignes (jusqu'à 512 lignes pour `mirror-modal.tsx`), et les pages `/auth` et `/auth/login` étaient dupliquées.

## 2. Solution Réalisée
- Découpage de `mirror-modal.tsx` en sous-composants `components/mirror/`.
- Découpage de `AdaptativeReviewPlayer.tsx` en étapes `components/review/`.
- Extraction de `components/auth/` et dédoublonnage de `/auth`.
- Extraction de `components/quiz/use-quiz-onboarding.ts` et `components/quiz/*`.
- Centralisation des schémas Zod stricts dans `lib/validations.ts`.
- Validation TypeScript et `npm run build` validé avec succès.
