---
id: UX-020
title: "Transitions spatiales continues et ergonomie clavier mobile"
author: "Julien"
type: "ux"
status: "resolved"
priority: "p2"
created_at: "2026-10-15"
affected_files:
  - components/AdaptativeReviewPlayer.tsx
  - components/review/review-freetext-step.tsx
  - app/globals.css
acceptance_criteria:
  - "Remplacement du snap visuel instantané par une transition de glissement spatial fluide entre items"
  - "Optimisation de l'agencement du formulaire de saisie libre lors de l'ouverture du clavier virtuel iOS/Android"
  - "Bouton d'envoi toujours accessible sans masquer la consigne"
---

# UX-020 : Transitions Spatiales Continues & Ergonomie Clavier Mobile

## 1. Contexte & Problème Observé
1. **Téléportation visuelle** : Passer d'une question à l'autre sans animation de slide ou de fade progressif créait une fatigue visuelle sur smartphone.
2. **Clavier virtuel mobile** : Lors de la saisie libre (Étape 5), le clavier virtuel monte et divise l'espace visible par deux (~420px), comprimant le bouton de validation.

## 2. Spécification Technique
1. **Transition spatiale** : Classe GPU `.animate-card-slide` appliquée sur le conteneur `key={currentItem.id}` pour un slide-in / fade-in à 60fps sans reflow.
2. **Layout clavier compact** : Compacter la consigne et le padding dès le focus du textarea dans `ReviewFreeTextStep`, support du raccourci Entrée pour valider.
3. **Raccourcis desktop** : Espace pour retourner les flashcards, touches 1 à 4 pour sélectionner les réponses QCM.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `resolved`
- **Fichiers impactés** : `components/AdaptativeReviewPlayer.tsx` (267L), `components/review/review-freetext-step.tsx` (83L), `app/globals.css`.
- **Vérification** : Fluidité visuelle garantie, zéro dépassement d'écran sous clavier virtuel.
