---
id: FEAT-017
title: "Génération anticipée des flashcards dès /api/scan (Zéro attente)"
author: "Julien"
type: "feature"
status: "resolved"
priority: "p1"
created_at: "2026-10-15"
resolved_at: "2026-10-15"
affected_files:
  - lib/eager-game-generator.ts
  - app/api/scan/route.ts
  - app/api/decks/generate-game/route.ts
acceptance_criteria:
  - "La génération des flashcards est initiée en arrière-plan dès la création du deck dans /api/scan"
  - "Quand l'étudiant arrive sur la roadmap et clique sur l'Étape 1, les cartes sont déjà prêtes en base (latence 0ms)"
  - "L'overlay de chargement LessonLoadingOverlay ne s'affiche plus que comme fallback rarissime (< 5% des cas)"
  - "Aucun risque de timeout 504 sur Vercel Serverless pour les cours multi-pages"
  - "npm run build passe avec 0 erreur et tous les fichiers restent < 300 lignes"
---

# FEAT-017 : Génération Anticipée des Flashcards dès /api/scan

## 1. Contexte & Problème Observé
Auparavant, les cartes mémoires et le quiz d'examen n'étaient générés que lorsque l'étudiant cliquait pour la première fois sur la roadmap. Sur un cours dense de 11 pages (2500 mots), l'étudiant subissait une attente de 4 à 8 secondes, avec un risque de timeout 504 sur Vercel.

## 2. Spécification Technique & Solution Livrée
1. **Module Dédié (`lib/eager-game-generator.ts`)** :
   - Orchestre la génération Gemini Structured Outputs (`gemini-3.8-flash`) et le Critic Layer de façon modulaire et isolée (< 135 lignes).
2. **Déclenchement Anticipé Eager dans `/api/scan`** :
   - Dès que le `savedDeckId` est inséré en base, `generateDeckGameAsync` est déclenché de manière asynchrone non-bloquante pour la réponse HTTP.
   - Lorsque l'étudiant arrive sur la roadmap, les flashcards et la question piège sont déjà persistées dans Supabase.
3. **Robustesse & Fallback** :
   - `/api/decks/generate-game` conserve son cache-first instantané (< 50ms) et son fallback Just-in-Time si jamais l'étudiant clique en moins de 500ms après le scan.
   - `npm run build` 100% vert, `app/api/scan/route.ts` reste à 288 lignes (< 300L).

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `resolved`
- **Build** : Validé (0 erreur Next.js / TypeScript).
