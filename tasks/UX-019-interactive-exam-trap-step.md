---
id: UX-019
title: "Transformation de l'Étape 6 en défi actif (Question piège d'examen)"
author: "Julien"
type: "ux"
status: "resolved"
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
Actuellement, l'Étape 6 ("Question Piège d'Examen") affichait la question ET la réponse simultanément dans `ReviewTrapStep`. L'étudiant cliquait passivement sur "Valider le défi". Tout le suspense et l'engagement cognitif de l'examen final étaient perdus.

## 2. Spécification Technique
1. **Écran en 2 temps** :
   - *Phase 1 (Mise à l'épreuve active)* : Affichage de la question piège seule + saisie active du raisonnement étudiant ou clic direct vers le corrigé.
   - *Phase 2 (Révélation du verdict & analyse)* : Corrigé officiel de l'enseignant + autodéclaration active ("J'avais évité le piège (+100 XP)" ou "Je suis tombé dedans").
2. **Animation** : Transition animée fluide entre question et correction.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `resolved`
- **Fichiers impactés** : `components/review/review-trap-step.tsx` (135L, < 300L).
- **Vérification** : Composant testé en 2 temps, sans affichage prématuré de la réponse, avec support de l'échec/retry et attribution d'XP.
