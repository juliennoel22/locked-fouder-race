---
id: BUG-003
title: "Cohérence et fiabilité des questions/réponses d'examen générées par l'IA"
author: "Baptiste"
type: "bug"
status: "ready"
priority: "p0"
created_at: "2026-10-04"
affected_files:
  - app/api/scan/route.ts
  - app/api/decks/generate-game/route.ts
  - components/review/game-step-renderer.tsx
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
  - En cas d'incohérence détectée par l'algorithme, régénérer ou valider les paires.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-04
- **Statut final** : `ready`
