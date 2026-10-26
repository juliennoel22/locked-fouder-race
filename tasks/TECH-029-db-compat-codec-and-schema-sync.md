---
id: TECH-029
type: chore
priority: P0
author: Julien
title: Codec de compatibilité DB transparent (PGRST204) & Migration SQL consolidée
status: resolved
resolved_at: 2026-10-26
created_at: 2026-10-26
files_impacted:
  - lib/db-compat.ts
  - supabase/migrations/20261026_full_schema_sync.sql
  - lib/format-deck.ts
  - app/api/decks/route.ts
  - app/api/decks/append/route.ts
  - app/api/decks/generate-game/route.ts
  - lib/eager-game-generator.ts
  - app/api/scan/route.ts
---

# TECH-029 : Codec de compatibilité DB transparent & Migration SQL consolidée

## Contexte
Plusieurs colonnes (`detailed_content`, `progress_percent`, `initial_quiz_answer` sur `decks`, `distractors` sur `flashcards`) et tables (`review_logs`, `feedback`, `user_referrals`) n'avaient pas encore été exécutées manuellement dans le SQL Editor de la base Supabase de production, provoquant des erreurs `PGRST204` et la perte silencieuse des données enrichies lors des fallbacks.

## Résolution
1. Création de `supabase/migrations/20261026_full_schema_sync.sql` regroupant de façon idempotente toutes les colonnes et tables requises.
2. Création de `lib/db-compat.ts` (< 120 lignes, zéro `any`) qui encode automatiquement `detailed_content`, `progress_percent`, `initial_quiz_answer` et `distractors` dans `summary`, `initial_quiz_question` et `back` en cas de `PGRST204`, et les décode de façon transparente dans tous les lecteurs.
