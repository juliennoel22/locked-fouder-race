---
id: FEAT-018
title: "Persistance cross-device SRS & table review_logs"
author: "Julien"
type: "feature"
status: "resolved"
priority: "p1"
created_at: "2026-10-15"
resolved_at: "2026-10-15"
affected_files:
  - app/api/review/log/route.ts
  - components/AdaptativeReviewPlayer.tsx
  - components/review/review-queue-builder.ts
  - supabase/schema.sql
acceptance_criteria:
  - "Création de la table review_logs (user_id, deck_id, card_front, rating, step_number, created_at)"
  - "Sauvegarde immédiate dans localStorage (zéro latence) + synchronisation asynchrone par batch vers /api/review/log"
  - "L'étudiant retrouve ses cartes faibles et son niveau de rétention en passant de son smartphone à son ordinateur"
  - "Fallback gracieux si la table Supabase n'est pas encore migrée (PGRST204 ignorer silencieusement)"
  - "npm run build passe avec 0 erreur et tous les fichiers restent < 300 lignes"
---

# FEAT-018 : Persistance Cross-Device SRS & Table review_logs

## 1. Contexte & Problème Observé
Initialement, le moteur de Spaced Repetition (SRS) stockait les cartes à renforcer uniquement dans le `localStorage` du téléphone. En changeant d'appareil, l'étudiant perdait son historique et son espacement cognitif.

## 2. Spécification Technique & Solution Livrée
1. **Route API Dédiée (`app/api/review/log/route.ts`)** :
   - Méthode `POST` : Valide via Zod et persiste par batch les interactions (`cardFront`, `rating`, `stepNumber`) avec RLS sécurisé.
   - Méthode `GET` : Récupère les cartes faibles récentes (`rating === 'again'`) pour hydrater le cache local d'un nouvel appareil.
   - Fallback gracieux en cas de table distante non encore migrée.
2. **Client Hybride Zéro Latence (`components/AdaptativeReviewPlayer.tsx`)** :
   - En jeu : réactivité instantanée via `localStorage` (0ms de latence perçue).
   - Fin de palier : envoi en arrière-plan non-bloquant de la session.
   - Démarrage : hydratation automatique depuis l'API si le cache local est vierge.
3. **Schéma SQL Immuable (`supabase/schema.sql`)** :
   - Table `review_logs` avec indexes `(user_id, deck_id)` et `(created_at DESC)` prête pour les futures optimisations de stabilité mémoire (FSRS).
4. **Conformité & Lignes de Code** :
   - `app/api/review/log/route.ts` : 106 lignes (< 300L).
   - `components/AdaptativeReviewPlayer.tsx` : 293 lignes (< 300L).
   - `npm run build` validé (44 routes, 0 erreur).

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `resolved`
- **Build** : Validé (0 erreur Next.js / TypeScript).
