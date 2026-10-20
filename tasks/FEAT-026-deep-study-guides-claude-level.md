---
id: FEAT-026
title: "Fiches de Révision Haute Densité avec Schémas Visuels, Tableaux et Callouts Pédagogiques (Niveau Claude 3.5 & ChatGPT)"
author: "Julien"
type: "feature"
status: "resolved"
priority: "P1"
created_at: "2026-10-20"
affected_files:
  - components/markdown-view.tsx
  - app/api/scan/route.ts
  - lib/demo-deck.ts
acceptance_criteria:
  - "Rendu responsive des tableaux Markdown complets (| Col1 | Col2 |) avec scroll tactile horizontal sur mobile"
  - "Rendu visuel des schémas / diagrammes de flux ASCII et Mermaid dans un conteneur code typé avec badge Schéma"
  - "Callout boxes stylisées intelligentes : Piège du Professeur (ambre/rouge), Mémo Mnémotechnique (vert), Application Partiel (brand/violet)"
  - "Prompting Gemini 3.8 Flash dans /api/scan exigeant systématiquement un schéma logique, un tableau comparatif et des callouts typés"
  - "Mise à niveau du cours démo (Droit Constitutionnel) avec les nouveaux composants visuels"
  - "npm run build passe avec 0 erreur et tous les fichiers restent < 300 lignes"
---

# FEAT-026 : Fiches de Révision Haute Densité avec Schémas Visuels & Callouts (Niveau Claude / ChatGPT)

## 1. Contexte & Deep Research
À la suite du retour de Baptiste sur la complétude des fiches et des benchmarks récents de Claude Artifacts et ChatGPT Canvas, les fiches de révision de niveau supérieur reposent sur 3 piliers visuels non négociables :
1. **L'Organigramme / Schéma Logique** : Diagramme de flux textuel synthétisant en 5 secondes les causes $\rightarrow$ mécanismes $\rightarrow$ conséquences.
2. **Le Tableau Comparatif Haute Densité** : Mise en opposition directe des concepts, régimes, formules ou dates.
3. **Les Callouts Typés "High-Yield"** : Encadrés visuels pour les pièges du barème d'examen, mémos mnémotechniques et cas pratiques.

## 2. Spécification Technique
1. **Moteur de Rendu `components/markdown-view.tsx`** :
   - Parser multi-lignes pour détecter et assembler les tableaux Markdown (`| ... |`).
   - Détection des blocs de code clôturés (```) avec rendu en boîte diagramme dédiée.
   - Détection sémantique des citations `>` : distinction visuelle entre `⚠️ Piège`, `💡 Mémo`, `🎯 Application`.
2. **Prompting Gemini 3.8 Flash dans `app/api/scan/route.ts`** :
   - Consignes strictes pour inclure systématiquement :
     - 1 Schéma conceptuel / flux ASCII dans un bloc de code.
     - 1 Tableau comparatif récapitulatif.
     - Au moins 2 callouts d'examen (`> ⚠️` et `> 💡`).
3. **Mise à niveau du `DEMO_DECK` (`lib/demo-deck.ts`)** :
   - Démonstration immédiate de la puissance visuelle sans nécessiter de nouveau scan.

## 3. Résolution & Vérifications
- **Moteur de rendu Markdown (`components/markdown-view.tsx`)** :
  - Support natif des blocs diagrammes/schémas dans des conteneurs sombres typés avec badge de flux conceptuel.
  - Support complet des tableaux Markdown avec scroll horizontal tactile mobile et zebra striping.
  - Détection sémantique des callouts : Pièges (`⚠️`), Mémoire (`💡`), Application (`🎯`).
  - Strictement maintenu à 286 lignes (< 300L).
- **Extraction Gemini 3.8 Flash (`app/api/scan/route.ts`)** :
  - SYSTEM_PROMPT enrichi pour exiger systématiquement 1 schéma ASCII/diagramme, 1 tableau comparatif et 2 callouts typés.
  - Strictement maintenu à 291 lignes (< 300L).
- **Cours Démo enrichi (`lib/demo-deck.ts`)** :
  - Intégration de l'organigramme de séparation des pouvoirs, tableau comparatif Présidentiel vs Parlementaire, et 3 callouts d'examen.
- **Validation** :
  - `npm run lint` : 0 erreur.
  - `npm run build` : 44/44 pages validées avec code 0.
