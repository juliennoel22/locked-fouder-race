---
id: BUG-004
title: "Déblocage du palier 2 et progression fluide dans la roadmap de révision"
author: "Baptiste"
type: "bug"
status: "ready"
priority: "p0"
created_at: "2026-10-04"
affected_files:
  - app/review/[id]/page.tsx
  - components/review/roadmap-path.tsx
  - lib/storage.ts
acceptance_criteria:
  - "Une fois le quiz 1 (ou l'étape 1) réussi, le nœud 2 est débloqué et cliquable immédiatement"
  - "L'état de progression est persisté (en local et/ou Supabase)"
  - "Le feedback visuel de déblocage est clair et sans ambiguïté"
  - "npm run build passe avec 0 erreur"
---

# BUG-004 : Déblocage du palier 2 et progression fluide dans la roadmap de révision

## 1. Contexte & Problème Observé
Baptiste a signalé (Vocal 19) qu'après avoir terminé le premier quiz, il n'a pas la possibilité de passer au second. L'interface ne le laisse pas sélectionner la seconde case et seule la première case reste active.

## 2. Spécification Technique & Solution 80/20
- Examiner `app/review/[id]/page.tsx` et `components/review/roadmap-path.tsx`.
- Vérifier la logique de `unlockedStep` ou `completedSteps`.
- S'assurer que la validation du step met à jour l'index courant et déverrouille l'étape suivante `stepIndex + 1`.
- Permettre à l'étudiant d'accéder au mode suivant sans rechargement cassé.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-04
- **Statut final** : `ready`
