---
id: FEAT-012
title: "Micro-sessions par nœud de roadmap (?step=1..6)"
author: "Julien"
type: "feature"
status: "resolved"
priority: "p0"
created_at: "2026-10-06"
resolved_at: "2026-10-15"
affected_files:
  - components/review/course-path-map.tsx
  - components/review/path-node-modal.tsx
  - app/deck/[id]/page.tsx
  - app/review/[id]/page.tsx
  - components/AdaptativeReviewPlayer.tsx
  - components/review/review-queue-builder.ts
  - components/review/review-concept-step.tsx
  - components/review/review-chest-step.tsx
  - components/review/review-progress-bar.tsx
  - components/review/review-completed-modal.tsx
acceptance_criteria:
  - "Cliquer sur un nœud ou 'Commencer la session' dans la modale lance `/review/[id]?step=X`"
  - "Le player filtre la file d'attente pour n'exécuter que l'étape ciblée (Concepts, Cartes 3D, QCM, Coffre, Rappel Libre, Examen)"
  - "Chaque micro-session dure entre 45s et 90s au maximum"
  - "À la complétion de la session, la progression du palier est enregistrée en localStorage et en DB"
  - "Redirection fluide vers la carte de cours avec auto-scroll sur le nœud suivant déverrouillé"
  - "npm run build passe avec 0 erreur"
---

# FEAT-012 : Micro-sessions par nœud de roadmap (?step=1..6)

## 1. Contexte & Problème Observé
Actuellement, la carte de révision affiche un parcours serpentin Duolingo avec 6 nœuds prometteurs. Cependant, cliquer sur n'importe quel nœud redirigeait vers `/review/[id]` qui chargeait et déroulait l'intégralité du deck en une seule fois (toutes les cartes + tous les quiz + free text + piège).  
L'étudiant ne vivait pas un parcours guidé micro-dosé, mais une session monolithique déguisée.

## 2. Spécification Technique & Solution 80/20
1. **Routage paramétré** :
   - `PathNodeModal` et `CoursePathMap` transmettent `stepNumber` (1 à 6) via `router.push('/review/' + deckId + '?step=' + node.stepNumber)`.
2. **Construction ciblée de la file d'attente (`AdaptativeReviewPlayer.tsx`)** :
   - Étape 1 : 4 fiches de lecture/découverte (`concept`).
   - Étape 2 : 4 flashcards 3D avec évaluation swipe (`flashcard`).
   - Étape 3 : 4 QCMs chronométrés avec distracteurs dédiés (`quiz`).
   - Étape 4 : Coffre récompense / checkpoint rétention (`chest`).
   - Étape 5 : 2 exercices de saisie libre (`free_text`).
   - Étape 6 : Épreuve finale piège d'examen (`exam_trap`).
3. **Persistance & Déverrouillage réactif** :
   - Validation de l'étape : calcul du pourcentage `Math.min(100, Math.round((step / 6) * 100))`.
   - Sauvegarde dans `localStorage` (`loreno_progress_${deckId}`) et synchronisation via `PATCH /api/decks`.
   - Bouton de fin de micro-session proposant l'étape suivante ou renvoyant sur `/deck/[id]` avec affichage direct de la roadmap et auto-scroll sur le nœud suivant.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `resolved`
- **Actions réalisées** :
  1. `components/review/review-queue-builder.ts` créé pour isoler la génération modulaire des files d'attente 45-90s par palier (1 à 6).
  2. `components/review/review-concept-step.tsx` implémenté pour l'étape 1 (Concepts & Définitions fondamentales avec bouton "J'ai assimilé ce concept").
  3. `components/review/review-chest-step.tsx` implémenté pour l'étape 4 (Coffre Trésor +50 XP et palier dopamine).
  4. `components/review/review-progress-bar.tsx` mis à jour avec libellé dynamique `Étape X sur 6 • <Titre>`.
  5. `components/review/review-completed-modal.tsx` adapté pour distinguer la complétion intermédiaire (Étape 1-5 avec CTA "Passer à l'Étape Suivante") de la complétion 100%.
  6. `components/AdaptativeReviewPlayer.tsx` refactoré pour n'exécuter que la file d'attente de l'étape ciblée et persister le palier exact.
  7. `app/review/[id]/page.tsx` enrichi avec lecture de `searchParams.get("step")` et fallback dynamique sur le prochain palier non-validé.
  8. `app/deck/[id]/page.tsx` et `components/review/course-path-map.tsx` mis à jour pour transmettre systématiquement `?step=X`.
  9. `npm run build` exécuté et validé avec 0 erreur TypeScript / Next.js.
