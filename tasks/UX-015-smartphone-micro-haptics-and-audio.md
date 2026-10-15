---
id: UX-015
title: "Micro-haptics smartphone & audio chimes dopamine"
author: "Julien"
type: "ux"
status: "ready"
priority: "p2"
created_at: "2026-10-06"
affected_files:
  - lib/haptics.ts
  - components/review/review-flashcard-step.tsx
  - components/review/review-quiz-step.tsx
  - components/review/review-freetext-step.tsx
acceptance_criteria:
  - "Module lib/haptics.ts sécurisé (fallback silencieux si non supporté ou permission refusée)"
  - "Vibration tactile légère lors d'une validation réussie (swipe droite, bon choix QCM)"
  - "Vibration double sourde lors d'une erreur"
  - "Séquence haptique de célébration lors du déblocage d'un palier"
  - "npm run build passe avec 0 erreur"
---

# UX-015 : Micro-haptics smartphone & audio chimes dopamine

## 1. Contexte & Problème Observé
L'interaction sur mobile est actuellement silencieuse et statique. Les applications virales et gamifiées (Duolingo, TikTok) utilisent des micro-retours physiques haptiques (`navigator.vibrate`) et des sons discrets pour ancrer le sentiment de réussite et d'impact à chaque action.

## 2. Spécification Technique & Solution 80/20
1. **Création de `lib/haptics.ts`** :
   - Fonction `triggerHaptic(type: 'success' | 'error' | 'milestone')` avec vérification de compatibilité (`typeof window !== 'undefined' && 'vibrate' in navigator`).
   - `success` : tap rapide de 20ms.
   - `error` : tap double de [35ms, 50ms, 35ms].
   - `milestone` : motif rythmé [30ms, 40ms, 50ms, 40ms, 60ms].
2. **Intégration dans les étapes de review** :
   - Appel transparent sur les boutons swipe, boutons de choix QCM et validation de saisie libre.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-06
- **Statut final** : `ready`
