---
id: UX-019
title: "Transformation de l'Étape 6 en défi actif (Question piège d'examen)"
author: "Julien"
type: "ux"
status: "ready"
priority: "p1"
created_at: "2026-10-15"
affected_files:
  - components/review/review-trap-step.tsx
acceptance_criteria:
  - "La réponse de la question piège d'examen n'est plus imprimée d'emblée à l'écran"
  - "L'étudiant doit effectuer un choix actif ou saisir sa justification avant de voir la correction"
  - "L'analyse du professeur se dévoile avec un effet de verdict net (Juste vs Piège évité)"
  - "Respect de la règle des fichiers < 300 lignes et conformité mobile"
---

# UX-019 : Transformation de l'Étape 6 en Défi Actif

## 1. Contexte & Problème Observé
Actuellement, l'Étape 6 ("Question Piège d'Examen") affiche la question ET la réponse simultanément dans `ReviewTrapStep`. L'étudiant clique passivement sur "Valider le défi". Tout le suspense et l'engagement cognitif de l'examen final sont perdus.

## 2. Spécification Technique
1. **Écran en 2 temps** :
   - *Phase 1 (Mise à l'épreuve)* : Affichage de la question piège + 2 options de discrimination ou champ de saisie court.
   - *Phase 2 (Révélation du verdict)* : Dévoilement du corrigé type d'examen avec explication du piège évité et bouton de complétion finale.
2. **Animation** : Transition fluide entre question et correction.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `ready`
