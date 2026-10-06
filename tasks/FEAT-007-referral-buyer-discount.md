---
id: FEAT-007
title: "Réduction tarifaire automatique pour le nouvel acheteur arrivant via un lien d'affiliation"
author: "Baptiste"
type: "feature"
status: "ready"
priority: "p1"
created_at: "2026-10-04"
affected_files:
  - app/api/stripe/checkout/route.ts
  - components/dashboard/share-modal.tsx
acceptance_criteria:
  - "L'acheteur arrivant via ?ref=XXX bénéficie automatiquement d'une réduction (ex: coupon Stripe parrainage)"
  - "Le parrain reçoit ses 3 jours Pro et le filleul bénéficie de sa réduction à l'achat"
  - "Le bandeau ou modal de checkout met en avant cet avantage bilatéral"
  - "npm run build passe avec 0 erreur"
---

# FEAT-007 : Réduction tarifaire automatique pour le nouvel acheteur arrivant via un lien d'affiliation

## 1. Contexte & Problème Observé
Baptiste a souligné : *"Il faut aussi une réduction pour le gars qui achète"*.
Actuellement, le système de parrainage récompense le parrain avec 3 jours Pro, mais le filleul (l'acheteur potentiel) n'a pas d'incitation financière directe au moment de passer à la caisse sur Stripe.

## 2. Spécification Technique & Solution 80/20
- Dans `/api/stripe/checkout/route.ts`, si un code de parrainage valide est présent dans le cookie `loreno_ref` :
  - Appliquer automatiquement un `discounts: [{ coupon: '...' }]` ou une `promotion_code` sur la session Checkout Stripe (ex: -20% ou réduction dédiée).
- Afficher un message de réassurance au moment du paiement : *"Réduction de parrainage appliquée !"*.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-04
- **Statut final** : `ready`
