---
id: FEAT-008
title: "Exhaustivité et haute densité des fiches de révision sur les scans multi-pages (jusqu'à 11 pages)"
author: "Baptiste"
type: "feature"
status: "ready"
priority: "p1"
created_at: "2026-10-04"
affected_files:
  - app/api/scan/route.ts
acceptance_criteria:
  - "Un lot de 11 pages scannées génère une fiche de révision exhaustive, dense et fidèle, couvrant tous les chapitres"
  - "Aucune perte d'information comparée à un scan de 3 ou 4 pages"
  - "Les définitions, repères chronologiques et points d'attention aux examens sont pleinement détaillés"
  - "npm run build passe avec 0 erreur"
---

# FEAT-008 : Exhaustivité et haute densité des fiches de révision sur les scans multi-pages (jusqu'à 11 pages)

## 1. Contexte & Problème Observé
Baptiste a testé le scan de son cours complet d'histoire (11 pages manuscrites fournies dans `docs/cours_baptiste/`). Il a constaté (Vocaux 16 & 17) que la fiche de révision produite était beaucoup moins complète qu'avec seulement 4 ou 5 pages. Le modèle compresse excessivement ou résume trop superficiellement lorsque le nombre de pages augmente.

## 2. Spécification Technique & Solution 80/20
- Dans `app/api/scan/route.ts`, adapter le prompt système pour les scans volumineux :
  - Ajuster les consignes de granularité : exiger une section dédiée par grande page ou sous-thème avec au moins 10-15 notions clés réparties.
  - Augmenter si nécessaire le `maxOutputTokens` pour éviter toute troncature silencieuse.
  - Tester directement avec les 11 photos de cours de Baptiste.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-04
- **Statut final** : `ready`
