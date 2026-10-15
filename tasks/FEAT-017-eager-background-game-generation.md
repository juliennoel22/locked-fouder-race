---
id: FEAT-017
title: "Génération anticipée des flashcards dès /api/scan (Zéro attente)"
author: "Julien"
type: "feature"
status: "ready"
priority: "p1"
created_at: "2026-10-15"
affected_files:
  - app/api/scan/route.ts
  - app/api/decks/generate-game/route.ts
  - components/review/lesson-loading-overlay.tsx
acceptance_criteria:
  - "La génération des flashcards est initiée en arrière-plan dès la création du deck dans /api/scan"
  - "Quand l'étudiant arrive sur la roadmap et clique sur l'Étape 1, les cartes sont déjà prêtes en base (latence 0ms)"
  - "L'overlay de chargement LessonLoadingOverlay ne s'affiche plus que comme fallback rarissime (< 5% des cas)"
  - "Aucun risque de timeout 504 sur Vercel Serverless pour les cours multi-pages"
  - "npm run build passe avec 0 erreur"
---

# FEAT-017 : Génération Anticipée des Flashcards dès /api/scan

## 1. Contexte & Problème Observé
Actuellement, les cartes mémoires et le quiz d'examen ne sont générés que lorsque l'étudiant clique sur le premier palier de la roadmap via `/api/decks/generate-game`.
Sur un cours dense de 11 pages (2500 mots), l'étudiant doit attendre 4 à 8 secondes devant le `LessonLoadingOverlay` (orbe de chargement).
De plus, sur Vercel Serverless, un double appel LLM synchrone dans la route HTTP frôle la limite des 10 secondes.

## 2. Spécification Technique & Solution 80/20
1. **Pipeline Anticipé (Eager Generation)** :
   - À la fin de `/api/scan`, après l'insertion du deck dans Supabase, déclencher immédiatement la génération des flashcards en tâche de fond (via `after()` de Next.js ou promesse asynchrone non-bloquante pour la réponse HTTP).
   - Ainsi, pendant que l'étudiant admire sa fiche de cours scannée ou explore la roadmap, les cartes se créent en tâche de fond.
2. **Expérience Instantanée** :
   - Au moment du clic sur l'étape 1, le `AdaptativeReviewPlayer` récupère directement les cartes en cache DB (< 50ms).
   - Plus de temps d'attente perceptible.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `ready`
