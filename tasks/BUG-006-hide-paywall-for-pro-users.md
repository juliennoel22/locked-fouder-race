---
id: BUG-006
title: "Masquage du paywall et des bandeaux d'achat pour les utilisateurs Pro"
author: "Baptiste"
type: "bug"
status: "ready"
priority: "p0"
created_at: "2026-10-04"
affected_files:
  - app/review/[id]/page.tsx
  - components/review/review-completed-modal.tsx
  - components/dashboard/mobile-nav.tsx
acceptance_criteria:
  - "Un utilisateur Pro (`is_pro === true`) ne voit AUCUN bandeau 'débloque tes cours' ni popup bloquante"
  - "Le texte 'accès illimité à vie à 9,99€' est complètement supprimé au profit de l'offre d'abonnement mensuelle"
  - "Les fonctionnalités Pro sont immédiatement accessibles sans friction pour le titulaire"
  - "npm run build passe avec 0 erreur"
---

# BUG-006 : Masquage du paywall et des bandeaux d'achat pour les utilisateurs Pro

## 1. Contexte & Problème Observé
Baptiste indique (Vocal 14) qu'en étant abonné Pro, il voit encore le message : *"débloque tes cours, accès illimité à vie à 9,99"*.
Non seulement un utilisateur Pro ne devrait jamais voir d'incitation à payer, mais le texte mentionne encore l'ancien modèle "à vie" au lieu du modèle abonnement.

## 2. Spécification Technique & Solution 80/20
- Conditionner l'affichage des bandeaux et modals de paiement à `!isPro`.
- Vérifier `user.user_metadata?.is_pro` ou la table `users/subscriptions` sur toutes les vues de révision et dashboard.
- Remplacer tout wording résiduel "à vie" par l'offre officielle d'abonnement.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-04
- **Statut final** : `ready`
