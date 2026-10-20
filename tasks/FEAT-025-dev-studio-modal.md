---
id: FEAT-025
title: "Dev Studio Modal global & bouton flottant de test"
author: "Julien"
type: "feature"
status: "resolved"
priority: "P1"
created_at: "2026-10-20"
resolved_at: "2026-10-20"
affected_files:
  - components/dev-tools.tsx
  - app/layout.tsx
  - lib/use-pro-status.ts
  - app/deck/[id]/page.tsx
  - app/review/[id]/page.tsx
acceptance_criteria:
  - "Bouton flottant DEV discret accessible en environnement de développement ou via ?dev=true"
  - "Modal interactive avec bascule Pro/Freemium 1-clic et synchronisation réactive de tous les composants"
  - "Raccourcis de navigation directe vers Dashboard, Démo, Étape 1 et Étape 6"
  - "Actions de réinitialisation de l'onboarding et du cache de progression"
  - "Injecteur de mock deck d'histoire (Baptiste 1929) pour tester sans caméra"
  - "npm run build passe avec 0 erreur et fichiers < 300 lignes"
---

# FEAT-025 : Dev Studio Modal Global & Bouton Flottant de Test

## 1. Contexte & Problème Observé
Julien avait besoin de retrouver des options développeur rapides et complètes pour tester l'application en mode local ou démo : basculer le statut Pro en 1 clic, réinitialiser le tour d'onboarding, naviguer directement dans les étapes de révision sans passer par tous les écrans, et injecter des cours types pour les tests.

## 2. Spécification Technique & Solution Livrée
1. **Composant `components/dev-tools.tsx` (287 lignes)** :
   - Zéro flou, zéro backdrop bloquant : le panneau flotte discrètement en bas à droite (`fixed bottom-14 right-3`) sans masquer le reste de l'écran. L'application reste 100% visible et cliquable en arrière-plan.
   - **Section Contextuelle Dynamique par Page** :
     - Sur `/review/...` : bouton *"⚡ Compléter l'étape d'un coup (100%)"*, bouton *"⏭️ Item suivant"*, et saut direct à l'Étape 6.
     - Sur `/quiz` : bouton *"⚡ Valider Onboarding & Go Dashboard"*.
     - Sur `/deck/...` : bouton *"⚡ Progrès à 100%"* et lancement direct du Quiz.
     - Sur le reste : injection rapide du Deck Histoire de Baptiste.
   - **Contrôles Globaux** :
     - Toggle Pro 1-clic réactif.
     - Sélecteur de mode d'intensité (`flash`, `balanced`, `deep`).
     - Raccourcis Dashboard / Démo / Hard Reset.
2. **Support des Mocks Locaux & Synchronisation Événements** :
   - Prise en charge des événements `loreno_dev_complete_step` et `loreno_dev_next_item` dans `AdaptativeReviewPlayer` et `flashcard-player`.
3. **Validation** :
   - `npm run lint` vert (0 erreur).
   - `npm run build` vert (44/44 routes compilées avec succès, Suspense wrapper pour le SSR).
