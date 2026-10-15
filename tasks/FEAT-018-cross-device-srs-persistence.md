---
id: FEAT-018
title: "Persistance cross-device SRS & table review_logs"
author: "Julien"
type: "feature"
status: "ready"
priority: "p1"
created_at: "2026-10-15"
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
  - "npm run build passe avec 0 erreur"
---

# FEAT-018 : Persistance Cross-Device SRS & Table review_logs

## 1. Contexte & Problème Observé
Le moteur de Spaced Repetition (SRS) stocke actuellement les cartes à renforcer dans `localStorage.getItem('loreno_weak_cards_' + deckId)`.
Si l'étudiant révise sur son smartphone puis passe sur son ordinateur, ses faiblesses ne sont pas partagées. De plus, il est impossible de calculer la rétention cognitive dans le temps sans historique d'interactions immuable.

## 2. Spécification Technique & Solution 80/20
1. **Modèle de données ultra-léger `review_logs`** :
   - `id` (UUID)
   - `user_id` (UUID, indexé)
   - `deck_id` (UUID, indexé)
   - `card_front` (Text)
   - `rating` ('again' | 'good' | 'hard')
   - `step_number` (Int)
   - `created_at` (Timestamptz)
2. **Stratégie Hybride Zéro Latence** :
   - En cours de jeu : interaction fluide instantanée avec `localStorage`.
   - À la complétion d'un palier : envoi asynchrone non-bloquant de la liste des interactions à `POST /api/review/log`.
3. **Chargement Cross-Device** :
   - Au lancement d'une session, le serveur ou client charge les cartes faibles récentes depuis `review_logs` et peuple le cache local.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `ready`
