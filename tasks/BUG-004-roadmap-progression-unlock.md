---
id: BUG-004
title: "Déblocage du palier 2 et progression fluide dans la roadmap de révision"
author: "Baptiste"
type: "bug"
status: "resolved"
priority: "p0"
created_at: "2026-10-04"
affected_files:
  - app/review/[id]/page.tsx
  - components/review/course-path-map.tsx
  - components/AdaptativeReviewPlayer.tsx
acceptance_criteria:
  - "Une fois le quiz 1 (ou l'étape 1) réussi, le nœud 2 est débloqué et cliquable immédiatement"
  - "L'état de progression est persisté (en local et/ou Supabase)"
  - "Le feedback visuel de déblocage est clair et sans ambiguïté"
  - "npm run build passe avec 0 erreur"
---

# BUG-004 : Déblocage du palier 2 et progression fluide dans la roadmap de révision

## 1. Contexte & Problème Observé
Baptiste a signalé (Vocal 19) qu'après avoir terminé le premier quiz, il n'avait pas la possibilité de passer au second. L'interface ne le laissait pas sélectionner la seconde case et seule la première case restait active.

## 2. Spécification Technique & Solution 80/20
- Correction de `saveProgressToDb` dans `AdaptativeReviewPlayer.tsx` pour sauvegarder la progression incrémentale à chaque étape franchie (et non uniquement à la fin complète).
- Synchronisation réactive avec `localStorage` (`loreno_progress_${deckId}`) dans `CoursePathMap.tsx` pour que le nœud 2 se débloque de manière instantanée sans latence réseau.
- Mise à jour du calcul `effectiveProgress` et `completedCount` pour garantir que tout nœud validé ou immédiatement suivant est actif et cliquable.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-06
- **Statut final** : `resolved`
- **Résolution** : Sauvegarde incrémentale par palier + hydratation instantanée localStorage + déverrouillage réactif des nœuds suivants dans `CoursePathMap.tsx`. Build `npm run build` validé.
