---
id: UX-009
title: "Auto-scroll sur le palier actif et ouverture directe de la fiche de cours"
author: "Baptiste"
type: "ux"
status: "ready"
priority: "p1"
created_at: "2026-10-04"
affected_files:
  - app/review/[id]/page.tsx
  - components/review/roadmap-path.tsx
  - components/review/summary-drawer.tsx
acceptance_criteria:
  - "À l'ouverture de la page de révision, la vue scrolle automatiquement vers le palier où en est l'étudiant (comme Duolingo)"
  - "Cliquer sur la carte d'en-tête du cours ouvre directement la fiche de révision complète"
  - "Comportement fluide sur Safari iOS et Chrome Android"
  - "npm run build passe avec 0 erreur"
---

# UX-009 : Auto-scroll sur le palier actif et ouverture directe de la fiche de cours

## 1. Contexte & Problème Observé
Baptiste a relevé deux points de navigation sur la page de révision :
1. (Vocal 8) : L'arrivée sur la page roadmap positionne l'étudiant tout en bas de la page au lieu de le placer là où en est sa progression réelle (effet Duolingo).
2. (Vocal 20) : Cliquer sur le gros bloc / bouton en haut portant le nom du cours (ex: "L'impact de la crise de 1929") devrait afficher immédiatement la fiche de révision pour relire son cours avant d'attaquer les quiz.

## 2. Spécification Technique & Solution 80/20
- Utiliser un `ref` sur le nœud actif avec `scrollIntoView({ behavior: 'smooth', block: 'center' })` après le premier rendu.
- Rendre le header de cours interactif pour déclencher l'ouverture du tiroir de fiche synthétique (`SummaryDrawer`).

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-04
- **Statut final** : `ready`
