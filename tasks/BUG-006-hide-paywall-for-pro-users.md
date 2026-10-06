---
id: BUG-006
title: "Masquage du paywall et des bandeaux d'achat pour les utilisateurs Pro"
author: "Baptiste"
type: "bug"
status: "resolved"
priority: "p0"
created_at: "2026-10-04"
affected_files:
  - components/paywall-modal.tsx
  - components/dashboard/floating-scan-bar.tsx
  - components/Header.tsx
  - components/dashboard/user-profile-modal.tsx
  - app/dashboard/page.tsx
acceptance_criteria:
  - "Un utilisateur Pro (`is_pro === true`) ne voit AUCUN bandeau 'débloque tes cours' ni popup bloquante"
  - "Le texte obsolète 'à vie' est complètement supprimé au profit du wording officiel 'Loreno Pro'"
  - "Les fonctionnalités Pro sont immédiatement accessibles sans friction pour le titulaire"
  - "npm run build passe avec 0 erreur"
---

# BUG-006 : Masquage du paywall et des bandeaux d'achat pour les utilisateurs Pro

## 1. Contexte & Problème Observé
Baptiste indique (Vocal 14) qu'en étant abonné Pro, il voyait encore le message : *"débloque tes cours, accès illimité à vie à 9,99"*.
Non seulement un utilisateur Pro ne doit jamais voir d'incitation à payer, mais le texte mentionnait encore l'ancien wording "à vie" au lieu de l'offre officielle.

## 2. Spécification Technique & Solution 80/20
- Conditionnement strict du rendu des bandeaux d'achat dans `floating-scan-bar.tsx` et `paywall-modal.tsx` par `!isPro`. Si `isPro === true`, aucun CTA de paywall ne s'affiche.
- Remplacement intégral des occurrences "à vie" par l'intitulé officiel "Loreno Pro".

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-06
- **Statut final** : `resolved`
- **Résolution** : Masquage systématique pour les membres Pro (`isPro`) + nettoyage exhaustif des formulations obsolètes "à vie" au profit de "Loreno Pro". Build `npm run build` validé sans erreur.
