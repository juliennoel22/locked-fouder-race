---
id: UX-002
title: "Harmonisation du Design System avec tokens sémantiques brand"
author: "Julien"
type: "ux"
status: "resolved"
priority: "p1"
created_at: "2026-10-04"
affected_files:
  - tailwind.config.ts
  - app/globals.css
  - components/dashboard/notebook-action-bar.tsx
  - components/review/review-progress-bar.tsx
  - components/review/review-flashcard-step.tsx
  - components/review/review-quiz-step.tsx
  - components/review/review-completed-modal.tsx
  - components/dashboard/notebook-list-item.tsx
acceptance_criteria:
  - "Remplacement des classes arbitraires [#4457f4] par brand"
  - "Tokens de marque unifiés dans tailwind.config.ts"
  - "npm run build valide"
---

# UX-002 : Harmonisation des Tokens Sémantiques Brand

## 1. Contexte & Problème
Présence de classes arbitraires `[#4457f4]` disséminées dans les composants UI, créant un risque de "token rot" pour les agents IA.

## 2. Solution Réalisée
- Déclaration du token `brand` et ses variantes (`hover`, `light`, `border`, `muted`) dans `tailwind.config.ts`.
- Définition des variables CSS associées dans `app/globals.css`.
- Remplacement systématique par `bg-brand`, `text-brand`, `border-brand`, `bg-brand/10` dans les composants clés.
