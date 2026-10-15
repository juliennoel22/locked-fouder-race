---
id: UX-015
title: "Micro-haptics smartphone & audio chimes dopamine"
author: "Julien"
type: "ux"
status: "resolved"
priority: "p2"
created_at: "2026-10-06"
affected_files:
  - lib/haptics.ts
  - components/review/review-flashcard-step.tsx
  - components/review/review-quiz-step.tsx
  - components/review/review-freetext-step.tsx
  - components/review/review-trap-step.tsx
  - components/review/review-completed-modal.tsx
  - components/AdaptativeReviewPlayer.tsx
acceptance_criteria:
  - "Module lib/haptics.ts sécurisé (fallback silencieux si non supporté ou permission refusée)"
  - "Vibration tactile légère lors d'une validation réussie (swipe droite, bon choix QCM)"
  - "Vibration double sourde lors d'une erreur"
  - "Séquence haptique de célébration lors du déblocage d'un palier"
  - "npm run build passe avec 0 erreur"
---

# UX-015 : Micro-haptics smartphone & audio chimes dopamine

## 1. Contexte & Problème Observé
L'interaction sur mobile était silencieuse et statique. Les applications virales et gamifiées (Duolingo, TikTok) utilisent des micro-retours physiques haptiques (`navigator.vibrate`) et des sons discrets pour ancrer le sentiment de réussite et d'impact à chaque action.

## 2. Spécification Technique & Solution 80/20
1. **Création de `lib/haptics.ts`** (99L) :
   - Fonction `triggerHaptic(type: 'tap' | 'success' | 'error' | 'milestone')` avec vérification de compatibilité (`typeof window !== 'undefined' && 'vibrate' in navigator`).
   - Synthèse audio immédiate sans téléchargement via Web Audio API (`playAudioChime`) :
     - `success` : Chime cristallin ascendant (587Hz -> 880Hz).
     - `error` : Tonalité sourde descendante discrète.
     - `milestone` : Arpège triomphal C5-E5-G5.
2. **Intégration** :
   - Branché sur les cartes recto/verso, boutons "Je sais" / "À revoir", choix QCM, soumission de saisie libre, piège d'examen et écran de fin.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `resolved`
- **Fichiers impactés** : `lib/haptics.ts`, `components/review/review-flashcard-step.tsx`, `components/review/review-trap-step.tsx`, `components/review/review-completed-modal.tsx`, `components/AdaptativeReviewPlayer.tsx`.
- **Vérification** : Audio Web Audio instantané, vibrations mobiles avec dégradation gracieuse sur desktop.
