# LEARNINGS & ERREURS SURMONTÉES (LORENO)
*Registre déterministe d'auto-immunisation contre les régressions (alimenté par le harnais Antigravity & `/learn`).*

---

## 🎯 Architecture & Invariants Loreno
1. **Next.js App Router & Turbopack** :
   - Fichiers d'actions ou endpoints API doivent valider systématiquement les payloads avec Zod (`lib/validations.ts`).
   - Ne jamais importer de modules Node (`crypto`, `fs`) dans des contextes Edge ou composants client.
2. **Mobile Viewport 100dvh** :
   - Éviter `100vh` et `min-h-screen` sur les conteneurs racines du shell mobile ; utiliser `min-h-[100dvh]` pour neutraliser les barres d'outils mobiles Safari et Chrome.
3. **Cibles Tactiles Mobile-First** :
   - Toute cible tactile sur smartphone doit mesurer $\ge 44 \times 44$ px (`pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11`).
4. **Compression Image Client** :
   - La photo scannée doit être redimensionnée via Canvas HTML5 avant l'envoi Supabase/Gemini pour garantir un payload < 400 Ko.

---

## 🛡️ Registre des Résolutions de Pannes

### 1. Inférence Générique TypeScript dans `lib/db-compat.ts`
- **Contexte** : Codec de compatibilité DB (`packFlashcardBack`).
- **Symptôme** : Erreur TS2339 lors du `npm run build` : `Property 'distractors' does not exist on type '{ front: string; back: string; }'`.
- **Cause Racine** : `unpackFlashcard({ front: "", back })` inférait le type étroit `{ front: string, back: string }` au lieu du type générique `CompatCardLike`.
- **Solution Déterministe** : Typage explicite du générique `unpackFlashcard<CompatCardLike>({ front: "", back })` garantissant la présence optionnelle de `distractors`.
