---
id: FEAT-011
title: "Distracteurs QCM indépendants non permutables & mode de saisie libre"
author: "Baptiste"
type: "feature"
status: "resolved"
priority: "p2"
created_at: "2026-10-04"
affected_files:
  - app/api/decks/generate-game/route.ts
  - components/review/game-step-renderer.tsx
  - types/loreno.ts
acceptance_criteria:
  - "Chaque question de QCM propose 4 options uniques spécifiquement taillées comme distracteurs plausibles"
  - "Optionnel / Évolutif : Prise en charge d'un mode de saisie libre (input texte avec validation sémantique ou exacte)"
  - "npm run build passe avec 0 erreur"
---

# FEAT-011 : Distracteurs QCM indépendants non permutables & mode de saisie libre

## 1. Contexte & Problème Observé
1. (Vocal 5) : Baptiste note que dans certains formats, les 4 questions et 4 réponses semblent couplées ou permutables comme un jeu de "relier les points". Il faut que chaque question ait ses propositions de réponses dédiées qui ne soient pas réutilisées ailleurs dans le même lot.
2. (Vocaux 6 & 7) : Intégrer également un format où l'étudiant doit taper lui-même la réponse (ex: calcul simple en maths ou mot-clé/date en histoire).

## 2. Spécification Technique & Solution 80/20
- Ajuster la génération JSON du prompt pour exiger un pool de 4 choix spécifiques à la question (`question`, `correctAnswer`, `options: [string, string, string, string]`).
- Concevoir un composant d'input libre pour les questions de type `free_text`.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-04
- **Statut final** : `ready`
