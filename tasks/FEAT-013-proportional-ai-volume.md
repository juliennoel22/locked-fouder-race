---
id: FEAT-013
title: "Volumétrie proportionnelle IA multi-pages & profils modulables"
author: "Julien"
type: "feature"
status: "resolved"
priority: "p1"
created_at: "2026-10-06"
resolved_at: "2026-10-15"
affected_files:
  - lib/review-config.ts
  - app/api/decks/generate-game/route.ts
  - components/review/review-types.ts
  - components/review/review-queue-builder.ts
  - components/review/review-dev-banner.tsx
  - components/AdaptativeReviewPlayer.tsx
  - app/review/[id]/page.tsx
acceptance_criteria:
  - "L'API calibre le volume d'items selon le nombre de mots du cours (6 à 18 flashcards, 4 à 8 QCMs)"
  - "Les scans de partiels denses (11 pages) génèrent assez de matière pour alimenter les 6 nœuds sans redondance"
  - "Progression chronologique stricte en 3 tiers (Début, Cœur, Fin/Pièges)"
  - "Modes de session modulables (Flash 60s, Balanced 90s, Deep 2min) commutables à chaud via Dev Banner"
  - "Persistance SRS locale immédiate (cartes faibles réinjectées dans les étapes suivantes)"
  - "npm run build passe avec 0 erreur et tous les fichiers restent < 300 lignes"
---

# FEAT-013 : Volumétrie proportionnelle IA multi-pages & Profils Modulables

## 1. Contexte & Problème Observé
Initialement, qu'un étudiant scanne 1 page d'introduction ou 11 pages de droit constitutionnel ou médecine, `/api/decks/generate-game` générait un volume fixe de 5 flashcards.
Pour un examen universitaire ou une session de révision complète, c'était insuffisant pour alimenter de manière progressive et riche les 6 étapes de la roadmap.

## 2. Spécification Technique & Solution Livrée
1. **Tiers de Volumétrie IA Déclaratifs (`lib/review-config.ts`)** :
   - Court (< 600 mots) : 6-8 cartes cibles (moyenne 7).
   - Moyen (600 - 1500 mots) : 10-12 cartes cibles (moyenne 11).
   - Long / Multi-pages (> 1500 mots, 11 pages de Baptiste) : 16-18 cartes cibles (moyenne 16).
2. **Ordonnancement Chronologique Strict (`app/api/decks/generate-game/route.ts`)** :
   - Découpage par l'IA en 3 tiers (Tiers 1 = début/définitions, Tiers 2 = mécanismes centraux, Tiers 3 = synthèse et pièges d'examen).
3. **Profils de Session Modulables (`ReviewInterleavingMode`)** :
   - Mode `flash` : 3-4 items par étape (~60s), idéal pour la complétion mobile et TikTok.
   - Mode `balanced` : 4-5 items par étape (~90s).
   - Mode `deep` : 5-7 items par étape (~2min).
   - Commutable à chaud via le composant isolé `ReviewDevBanner` ou le query param `?mode=flash|balanced|deep`.
4. **Espacement SRS Hybride Zéro Latence** :
   - Enregistrement immédiat des erreurs dans `localStorage.getItem('loreno_weak_cards_' + deckId)`.
   - Réinjection prioritaire de la carte faible dans les étapes 3 et 5.
5. **Conformité Architecturale** :
   - Tous les fichiers restent strictement sous la barre des 300 lignes.
   - `npm run build` vert (43/43 routes, 0 erreur TypeScript).

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `resolved`
- **Build** : Validé (0 erreur Next.js / TypeScript).
