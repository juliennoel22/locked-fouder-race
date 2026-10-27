---
id: UX-033
type: ux
priority: P0
author: Julien
title: Intégrité de la copy du Paywall & Élimination des fausses promesses ("Tuteur IA", etc.)
status: resolved
resolved_at: 2026-10-27
created_at: 2026-10-27
files_impacted:
  - components/paywall-modal.tsx
  - app/page.tsx
  - app/dashboard/page.tsx
acceptance_criteria:
  - "La modale de paywall ne promet aucune fonctionnalité inexistante (pas de faux 'Tuteur IA d'examen', pas de 'Détection des questions pièges' si vendue comme module autonome séparé)"
  - "La proposition de valeur est 100% alignée sur le produit réel : fiches mémo exhaustives, flashcards illimitées, entraînement actif SRS 6 étapes et fiches de révision débloquées"
  - "Toute modification de copy est documentée avec un comparatif strict Avant / Après validé par Julien"
  - "npm run build passe avec 0 erreur"
---

# UX-033 : Intégrité de la copy du Paywall & Élimination des fausses promesses ("Tuteur IA", etc.)

## 1. Contexte & Problème Observé
Capture utilisateur : `media_1793115772625_2c9bda64.png`.

Sur la modale de paywall Stripe (`components/paywall-modal.tsx`), deux arguments de vente sont entourés et posent un problème critique d'éthique et de conformité légale / réputationnelle (fausses promesses) :
1. **"Tuteur IA d'examen sur tes notes"** : Il n'existe pas aujourd'hui de chatbot conversationnel / tuteur interactif autonome dans Loreno. L'utilisateur paie en croyant avoir un tuteur personnalisé en direct et se retrouve frustré.
2. **"Détection des questions pièges d'examen"** : L'Étape 6 propose une carte piège générée lors du scan, mais la formuler comme un module de détection autonome surévalue la fonctionnalité réelle.
3. Sous-titre : *"Accède à toutes les fiches, aux questions pièges des partiels et au tuteur IA."*

## 2. Analyse des textes actuels vs Réalité Produit

### Copy Actuelle (`components/paywall-modal.tsx`) :
- **Sous-titre** : *"Accède à toutes les fiches, aux questions pièges des partiels et au tuteur IA."*
- **Bullet 1** : `Scans & Flashcards illimités sur tous tes cours` (Réel)
- **Bullet 2** : `Détection des questions pièges d'examen` (Surévalué)
- **Bullet 3** : `Tuteur IA d'examen sur tes notes` (Fausse promesse)

### Proposition de Copy Alignée (À faire valider par Julien) :
- **Sous-titre** : *"Mémorise tous tes cours et valide tes examens sans stress."*
- **Bullet 1** : `Scans & Flashcards illimités sur tous tes cours` (Notes, polys, PDF)
- **Bullet 3** : `Fiches de synthèse générées en 2 secondes`

## 3. Plan d'Action (Prêt pour implémentation)
1. Présenter à Julien la proposition exacte Avant / Après pour validation formelle.
2. Mettre à jour `components/paywall-modal.tsx` une fois approuvé.
3. Auditer également `app/page.tsx` (qui mentionne encore "Tuteur IA" dans les 3 piliers) pour harmoniser le discours produit.
4. Valider `npm run build`.
