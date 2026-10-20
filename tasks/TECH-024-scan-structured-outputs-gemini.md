---
id: TECH-024
title: "Structured Outputs natifs & responseSchema strict sur /api/scan"
author: "Julien"
type: "chore"
status: "resolved"
priority: "P1"
created_at: "2026-10-20"
resolved_at: "2026-10-20"
affected_files:
  - app/api/scan/route.ts
  - app/api/decks/append/route.ts
acceptance_criteria:
  - "Remplacement de ai.interactions.create par ai.models.generateContent avec gemini-3.8-flash"
  - "Garantie de typage strict avec responseMimeType: 'application/json' et responseSchema de @google/genai"
  - "Support multimodal inlineData pour images JPEG/PNG et documents PDF multi-pages"
  - "Suppression des regex manuelles de parsing JSON (match, replace markdown)"
  - "Maintien de la règle stricte < 300 lignes sur app/api/scan/route.ts et app/api/decks/append/route.ts"
  - "npm run build passe avec 0 erreur TypeScript et linting vert"
---

# TECH-024 : Structured Outputs Natifs & responseSchema Strict sur /api/scan

## 1. Contexte & Problème Observé
Le méga-audit technique (`docs/LORENO_MEGA_AUDIT.md` point 4.1) a identifié que si `generate-game` et `ai-validator` avaient déjà migré sur les Structured Outputs natifs de Gemini, `/api/scan` et `/api/decks/append` utilisaient encore `ai.interactions.create` avec extraction manuelle par regex `rawText.match(/\{[\s\S]*\}/)`.
Sur des notes manuscrites très complexes ou des documents multi-pages denses, ce parsing manuel présentait un risque d'échec d'extraction JSON.

## 2. Spécification Technique & Solution Livrée
1. **Migration vers `ai.models.generateContent` (`gemini-3.8-flash`)** :
   - Injection des documents via le format de `Part` standard `{ inlineData: { mimeType, data: base64 } }`.
   - Définition d'un `responseSchema` strict imposant les champs `title`, `subject`, `summary`, et `detailed_content`.
2. **Harmonisation de `/api/decks/append`** :
   - Même architecture pour l'enrichissement de cours existant.
3. **Zéro Régression & Respect des Contraintes** :
   - `app/api/scan/route.ts` : 294 lignes (< 300L).
   - `app/api/decks/append/route.ts` : 176 lignes (< 300L).
   - Validation `npm run build` complète (44/44 pages, code 0).

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-20
- **Statut final** : `resolved`
- **Résolution** : Remplacement complet de `ai.interactions.create` par `ai.models.generateContent` avec `responseSchema` sur `/api/scan` et `/api/decks/append`. Nettoyage linter (Header.tsx, review-concept-step.tsx) et build Next.js 16 vert.

