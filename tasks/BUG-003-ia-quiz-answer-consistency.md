---
id: BUG-003
title: "Cohérence et fiabilité des questions/réponses d'examen générées par l'IA"
author: "Baptiste"
type: "bug"
status: "resolved"
priority: "p0"
created_at: "2026-10-04"
affected_files:
  - app/api/scan/route.ts
  - app/api/decks/generate-game/route.ts
  - components/AdaptativeReviewPlayer.tsx
  - components/dashboard/notebook-quiz-view.tsx
  - types/loreno.ts
acceptance_criteria:
  - "L'invite système de génération IA interdit toute déconnexion causale entre la question et la réponse attendue"
  - "La réponse attendue répond précisément et directement à la question posée"
  - "Zéro hallucination anachronique ou grossière sur les matières d'examen (ex: histoire)"
  - "npm run build passe avec 0 erreur"
---

# BUG-003 : Cohérence et fiabilité des questions/réponses d'examen générées par l'IA

## 1. Contexte & Problème Observé
Baptiste a relevé des erreurs d'hallucination majeures générées par l'IA :
1. Sur la question piège d'examen : *"Face à la dépression économique mondiale déclenchée en 1929, quelle a été la réponse spécifique des régimes autoritaires et totalitaires par opposition aux démocraties ?"*, l'IA a fourni comme réponse attendue : *"Le krash boursier de Wall Street le 24 octobre 1929"* (totalement hors-sujet et absurde par rapport à la question).
2. Confusion notionnelle relevée par Baptiste sur l'histoire (ex: Front populaire / interventionnisme d'État).
Ce type d'erreur détruit instantanément la crédibilité de l'application auprès des étudiants.

## 2. Spécification Technique & Solution 80/20
- Renforcer drastiquement le prompt système de `app/api/decks/generate-game/route.ts` et `app/api/scan/route.ts` :
  - Ajouter une règle stricte : *"VALIDATION CAUSALE : La réponse attendue doit impérativement répondre directement et fidèlement à la question posée. Ne donne jamais un fait déclencheur (ex: date d'un krach) si la question porte sur une politique ou une conséquence."*
  - Ajout du champ `initial_quiz_answer` dans le schéma de sortie IA et dans les types pour lier directement la réponse d'examen à sa question piège.
- Correction du lecteur de révision `AdaptativeReviewPlayer.tsx` pour utiliser `initialQuizAnswer` au lieu de substituer arbitrairement `flashcards[0]?.back` pour le piège d'examen.
- Prise en compte de `card.distractors` spécifiques dans `NotebookQuizView.tsx` pour empêcher le mélange aléatoire de réponses d'autres cartes.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-06
- **Statut final** : `resolved`
- **Résolution** : Prompts d'alignement causal stricts injectés + champ `initial_quiz_answer` généralisé + correction des composants `AdaptativeReviewPlayer` et `NotebookQuizView`. Compilation `npm run build` validée à 100% sans erreur.
