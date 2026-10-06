---
id: UX-010
title: "Bouton de copie avec texte d'accroche viral et ergonomie tactile des flashcards"
author: "Baptiste"
type: "ux"
status: "resolved"
priority: "p2"
created_at: "2026-10-04"
affected_files:
  - components/dashboard/share-modal.tsx
  - components/review/flashcard-view.tsx
acceptance_criteria:
  - "Le bouton 'Copier le message' copie le texte complet prêt à l'envoi ('Viens réviser...') avec le lien affilié inclus"
  - "Les boutons 'Je sais' et 'À revoir' sur les flashcards sont plus grands et confortables (Thumb Zone mobile)"
  - "npm run build passe avec 0 erreur"
---

# UX-010 : Bouton de copie avec texte d'accroche viral et ergonomie tactile des flashcards

## 1. Contexte & Problème Observé
1. (Vocal 10) : Quand l'étudiant clique sur le bouton "Copier", seule l'URL brute est copiée dans le presse-papier, alors que WhatsApp partage un message incitatif rédigé. Baptiste demande que le copier copie le même texte engageant pour pouvoir le coller facilement dans Instagram DM, Snapchat ou Discord.
2. (Vocal 9) : Sur les flashcards, les boutons "Je sais" et "Je sais pas / À revoir" méritent d'être plus larges et hauts pour une interaction au pouce sans effort.

## 2. Spécification Technique & Solution 80/20
- Dans `components/dashboard/share-modal.tsx`, injecter le message textuel complet dans le `navigator.clipboard.writeText(...)`.
- Dans `components/review/flashcard-view.tsx`, augmenter la hauteur et le padding des boutons d'évaluation (ex: `h-14` ou `py-4`, typographie bien lisible).

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-04
- **Statut final** : `ready`
