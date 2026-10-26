---
id: BUG-031
type: bug
priority: P1
author: Baptiste / Julien
title: Boucle d'Affiliation (Bandeau Essai 3j, Paywall -20%, Récompense Parrain & Commission Stripe)
status: resolved
resolved_at: 2026-10-26
created_at: 2026-10-26
files_impacted:
  - components/dashboard/floating-scan-bar.tsx
  - app/api/referral/route.ts
  - components/referral-listener.tsx
  - lib/use-pro-status.ts
  - components/paywall-modal.tsx
  - app/api/webhooks/stripe/route.ts
---

# BUG-031 : Boucle d'Affiliation & Commission Stripe

## Causes Racines Corrigées
1. **Bandeau 3 jours Pro offerts jamais affiché (`floating-scan-bar.tsx`)** : La condition `{!isPro && isReferralTrial}` était toujours fausse car `isPro` vaut `true` pendant l'essai de parrainage.
2. **Filleul bloqué en Pro permanent sans pouvoir acheter à -20%** : `/api/referral` définissait `is_pro: true` et `referral-listener.tsx` définissait `loreno_pro=true` pour 30 jours, ce qui empêchait `isReferralTrial` d'être actif et bloquait l'ouverture de `PaywallModal` (`if (!isOpen || isPro) return null`).
3. **Récompense parrain (+3 jours tous les 5 invités) non appliquée à `pro_until`** : `/api/referral` incrémentait `pro_days_earned` sans prolonger `pro_until` du parrain.
4. **Commission cash de 20% non créditée dans le webhook Stripe** : `app/api/webhooks/stripe/route.ts` activait le statut Pro de l'acheteur sans créditer `balance_cents` et `total_earned_cents` du parrain.

## Résolution
1. Condition corrigée en `{isReferralTrial && onOpenPaywall && (` dans `components/dashboard/floating-scan-bar.tsx`.
2. Séparation claire entre abonné payant (`isPaidLifetime`) et essai parrainage (`pro_until`) dans `app/api/referral/route.ts`, `components/referral-listener.tsx`, `lib/use-pro-status.ts` et `components/paywall-modal.tsx`.
3. Prolongation automatique de `pro_until` (+3 jours) du parrain tous les 5 filleuls dans `app/api/referral/route.ts`.
4. Crédit automatique de 20% de commission (`balance_cents`, `total_earned_cents`) au parrain lors de `checkout.session.completed` dans `app/api/webhooks/stripe/route.ts`.
