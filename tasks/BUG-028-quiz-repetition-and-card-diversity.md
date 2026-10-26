---
id: BUG-028
type: bug
priority: P0
author: Baptiste / Julien
title: Répétition en boucle des questions, 5 biais Queue Builder & Corrigé en 3 parties
status: resolved
resolved_at: 2026-10-26
created_at: 2026-10-26
files_impacted:
  - components/review/review-queue-builder.ts
  - lib/eager-game-generator.ts
  - app/api/decks/generate-game/route.ts
  - lib/ai-validator.ts
  - app/api/scan/route.ts
  - app/api/tutor/route.ts
  - components/review/review-freetext-step.tsx
---

# BUG-028 : Répétition en boucle des questions & Biais du Queue Builder

## Contexte & Symptôme
L'utilisateur subissait la même question et réponse jusqu'à 6 fois d'affilée au fil du parcours :
*"Manque de pertinence dans les questions (c'est la 6 ème fois d'affilée que la même réponse est donnée avec à chaque fois les même questions ou légèrement reformulée)."*

## Causes Racines Identifiées (Audit Multi-Perspectives)
1. **Étape 1 (`mode === "flash"`)** : `concept(c0)` -> `flashcard(c0)` -> `quiz(c0)` affichait 3 fois de suite `c0` sans intercaler `c1`.
2. **Fallback `getDistinctCards`** : Le fallback repartait systématiquement de `safeCards[0]` à chaque étape.
3. **Étape 3 (`cSpacing`)** : Quand `retryCard` était `null`, `getDistinctCards(1, tier1Cards)[0]` renvoyait encore `c0`.
4. **Étape 6 (`cEndAlt`)** : `const [cEndAlt] = getDistinctCards(2, tier3Cards)` déstructurait le 1er élément (`cEndLast`) au lieu du 2nd, tombant dans le fallback `safeCards[0]`.
5. **Tri non garanti** : `deck.flashcards` depuis Supabase n'était pas systématiquement trié par `order_index`.
6. **Validation Saisie Libre trop laxiste** : Les stop-words français de 3 lettres (`"les"`, `"des"`, `"une"`) validaient n'importe quelle réponse.

## Résolution
1. Correction des 5 biais algorithmiques dans `components/review/review-queue-builder.ts` (intercalage `c1` à l'étape 1 en mode flash, offset par étape dans `getDistinctCards`, sélection de la dernière carte du Tiers 1 à l'étape 3, déstructuration `const [, cEndAlt]` à l'étape 6).
2. Tri systématique par `order_index` dans `unpackDeck` (`lib/db-compat.ts`), `app/deck/[id]/page.tsx` et `app/review/[id]/page.tsx`.
3. Prompting strict en 3 parties pour `initial_quiz_answer` et `responseSchema` sans `temperature: 0` dans `lib/ai-validator.ts`.
4. Utilisation de `after()` de `next/server` dans `app/api/scan/route.ts` et migration de `/api/tutor` vers `ai.models.generateContent` (`gemini-3.8-flash`).
5. Filtrage des stop-words français dans `checkFreeTextAnswer` (`components/review/review-freetext-step.tsx`).
