---
id: BUG-030
type: bug
priority: P0
author: Julien
title: Verrouillage UX Production (Roadmap Dev Mode, Stockage Photo Miroir, Cache & Exam Trap)
status: resolved
resolved_at: 2026-10-26
created_at: 2026-10-26
files_impacted:
  - app/deck/[id]/page.tsx
  - components/review/course-path-map.tsx
  - app/api/scan/route.ts
  - app/api/decks/append/route.ts
  - app/dashboard/page.tsx
  - app/dashboard/new/page.tsx
  - components/dashboard/scan-modal.tsx
  - components/AdaptativeReviewPlayer.tsx
---

# BUG-030 : Verrouillage UX Production (Roadmap, Photo Miroir, Cache & Exam Trap)

## Causes Racines Corrigées
1. **Nœuds Roadmap déverrouillés en production** : `app/deck/[id]/page.tsx` passait systématiquement `onUpdateProgress` et `onCompleteNode`, ce qui activait `isClickable = true` sur tous les nœuds verrouillés et affichait le bouton "⚡ Mode Test" aux utilisateurs réels. De plus, `course-path-map.tsx` testait `progressPercent < 100` au lieu de `effectiveProgress < 100`.
2. **URLs `blob:` éphémères dans `decks.image_url`** : Les photos scannées n'étaient pas uploadées sur le bucket `course-scans` de Supabase Storage, rendant la modale Photo Miroir cassée après rechargement.
3. **Résurrection des cours supprimés** : `sessionStorage.getItem("loreno_scan_cache")` n'était pas nettoyé quand le cours existait déjà en base, recréant le cours supprimé au rechargement suivant.
4. **Double modale et boucle sur `exam_trap`** : Cliquer sur "Je suis tombé dedans" à l'Étape 6 ouvrait `ReviewErrorModal` par-dessus le corrigé déjà affiché et ré-injectait immédiatement le même `exam_trap`.

## Résolution
1. Passage de `onUpdateProgress` et `onCompleteNode` strictement conditionné à `showDevMode === true` et utilisation de `effectiveProgress < 100`.
2. Upload serveur vers le bucket Supabase Storage `course-scans` dans `app/api/scan/route.ts` avec génération d'URL signée et filtrage des `blob:` URLs.
3. Nettoyage systématique de `loreno_scan_cache` dans `app/dashboard/page.tsx` et `app/dashboard/new/page.tsx`.
4. Dans `AdaptativeReviewPlayer.tsx`, validation directe de la fin d'étape après enregistrement de l'erreur sur `exam_trap` sans double modale ni boucle infinie.
