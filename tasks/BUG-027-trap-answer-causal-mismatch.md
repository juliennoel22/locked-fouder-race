---
id: BUG-027
type: bug
priority: P0
author: Baptiste / Julien
title: Rupture causale Question / Réponse Piège d'Examen (Étape 6) & Persistance Totale DB
status: resolved
resolved_at: 2026-10-26
created_at: 2026-10-26
files_impacted:
  - lib/db-compat.ts
  - app/review/[id]/page.tsx
  - components/review/review-queue-builder.ts
  - app/api/decks/generate-game/route.ts
  - lib/eager-game-generator.ts
  - app/api/decks/route.ts
  - supabase/migrations/20261026_full_schema_sync.sql
---

# BUG-027 : Rupture causale Question / Réponse Piège d'Examen (Étape 6)

## Contexte & Symptôme
À l'Étape 6 (Épreuve Finale), la question piège posée est :
*"Face à la faillite des politiques libérales classiques suite au krach de Wall Street, quelle a été la réaction propre aux régimes autoritaires par rapport aux démocraties ?"*
Mais le corrigé type affiché à l'écran était :
*"Le krach boursier du 24 octobre 1929 à Wall Street."*

Le corrigé attendu par Baptiste est l'analyse comparative structurée en 3 parties :
*"Pour répondre à la crise de 1929, les régimes autoritaires ont imposé un dirigisme étatique absolu, visant l'autarcie économique et le réarmement massif au détriment des libertés individuelles pour préparer la guerre. À l'inverse, les démocraties ont opté pour un interventionnisme modéré (comme le New Deal américain ou le Front populaire en France), qui visait à réguler le capitalisme et créer des protections sociales tout en préservant la démocratie. En somme, là où les démocraties ont choisi la voie de l'État-providence, les dictatures ont choisi celle de l'économie de guerre."*

## Causes Racines
1. **Absence des colonnes `initial_quiz_answer`, `detailed_content`, `progress_percent` et `distractors` sur la BDD Supabase de production (`PGRST204`)** :
   Lors du fallback `PGRST204`, `initial_quiz_answer` était purement abandonné avant l'enregistrement.
2. **Écrasement de `initialQuizQuestion` dans `review-queue-builder.ts`** :
   Quand `initialQuizAnswer` était absent, le builder écrasait `initialQuizQuestion` ET `initialQuizAnswer` par `safeCards[0]` (la 1ère flashcard sur la date du krach).
3. **Deck live de Baptiste (`326cc1b2-35ae-44c8-b5a3-09aed924ed6e`) figé en base** :
   Le deck avait déjà ses 5 cartes initiales en base, court-circuitant toute régénération IA.

## Résolution
1. Déploiement du codec transparent `lib/db-compat.ts` qui encode et décode automatiquement `initial_quiz_answer`, `detailed_content`, `progress_percent` et `distractors` dans les colonnes existantes en cas de `PGRST204`.
2. Réparation directe en base de production Supabase du deck de Baptiste (`326cc1b2-35ae-44c8-b5a3-09aed924ed6e`) avec 12 flashcards orthogonales, distracteurs dédiés, fiche complète et le corrigé exact en 3 parties.
3. Dans `review-queue-builder.ts`, interdiction absolue d'écraser `initialQuizQuestion` par `safeCards[0]`, et synthèse structurée en 3 parties à partir du Tiers 3 si `initialQuizAnswer` est absent.
