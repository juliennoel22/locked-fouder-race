---
id: SEC-016
title: "Structured Outputs JSON natifs Gemini & sécurisation multi-tenant generate-game"
author: "Julien"
type: "security"
status: "ready"
priority: "p0"
created_at: "2026-10-15"
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
Lors de l'audit critique du système backend :
1. **Sécurité Multi-Tenant** : `/api/decks/generate-game` utilise `SUPABASE_SERVICE_ROLE_KEY` qui bypasse le RLS. La route ne vérifie pas si `deck.user_id` correspond à la session utilisateur appelante. N'importe quel client connaissant un `deckId` UUID peut déclencher des coûts d'API Gemini ou lire les cartes d'un autre utilisateur.
2. **Fragilité du Parsing JSON** : Les réponses LLM sont encore extraites via des regex `rawJson.replace(/```json/g, "")`. Sur des cours complexes (droit, médecine), des guillemets non échappés peuvent corrompre le JSON et forcer un fallback dégradé.

## 2. Spécification Technique & Solution 80/20
1. **Contrôle d'accès propriétaire** :
   - Récupérer la session Supabase via `createClient()` de `@/lib/supabase/server`.
   - Si `deckId` n'est pas un deck démo, valider : `if (!user || user.id !== deck.user_id) return 403 Forbidden`.
2. **Structured Outputs Gemini Natifs** :
   - Configurer l'appel `interactions.create` avec `responseMimeType: "application/json"` et le schéma de validation Zod/JSON Schema strict.
   - Idem pour le Critic Layer dans `lib/ai-validator.ts`.
3. **Maintien du Critic Guardrail** :
   - Conserver la double vérification causale programmatique et fact-checking.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `ready`
