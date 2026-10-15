---
id: SEC-016
title: "Structured Outputs JSON natifs Gemini & sécurisation multi-tenant generate-game"
author: "Julien"
type: "security"
status: "resolved"
priority: "p0"
created_at: "2026-10-15"
resolved_at: "2026-10-15"
affected_files:
  - app/api/decks/generate-game/route.ts
  - lib/ai-validator.ts
acceptance_criteria:
  - "L'API /api/decks/generate-game vérifie que l'utilisateur connecté est bien le propriétaire du deck (deck.user_id === user.id) sauf pour les decks démo"
  - "Remplacement du parsing JSON regex artisanal par responseMimeType: 'application/json' et responseSchema de Google GenAI"
  - "Zéro crash de parsing même sur des citations avec guillemets imbriqués ou caractères spéciaux"
  - "Temps d'exécution sous les 3 secondes et fallback défensif maintenu"
  - "npm run build passe avec 0 erreur et tous les fichiers restent < 300 lignes"
---

# SEC-016 : Structured Outputs JSON Natifs & Sécurisation Multi-Tenant

## 1. Contexte & Problème Observé
1. **Sécurité Multi-Tenant** : `/api/decks/generate-game` utilisait `SUPABASE_SERVICE_ROLE_KEY` qui bypasse le RLS sans vérifier si `deck.user_id` correspond à la session utilisateur appelante.
2. **Fragilité du Parsing JSON** : Les réponses LLM étaient extraites via des regex `rawJson.replace(/```json/g, "")`.

## 2. Spécification Technique & Solution Livrée
1. **Vérification Multi-Tenant Stricte** :
   - Récupération de la session utilisateur via `@/lib/supabase/server`.
   - Contrôle d'accès : `if (deck.user_id && (!user || user.id !== deck.user_id)) return 403 Forbidden`.
   - Maintien de l'accès public pour les cours démo (`demo-droit-constitutionnel`, `demo`).
2. **Structured Outputs Gemini Natifs (`gemini-3.8-flash`)** :
   - Remplacement de l'Interactions API textuelle par `ai.models.generateContent` avec `responseMimeType: "application/json"` et `responseSchema` strict.
   - Parsing JSON direct sécurisé, éliminant tout risque de corruption ou d'échappement de guillemets.
   - Migration identique du Critic Layer dans `lib/ai-validator.ts`.
3. **Conformité & Lignes de Code** :
   - `app/api/decks/generate-game/route.ts` : 210 lignes (< 300L).
   - `lib/ai-validator.ts` : 86 lignes (< 300L).
   - `npm run build` vert (43 routes compilées, 0 erreur).

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `resolved`
- **Build** : Validé (0 erreur Next.js / TypeScript).
