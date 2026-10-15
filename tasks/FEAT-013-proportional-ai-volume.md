---
id: FEAT-013
title: "Volumétrie proportionnelle IA multi-pages"
author: "Julien"
type: "feature"
status: "ready"
priority: "p1"
created_at: "2026-10-06"
affected_files:
  - app/api/decks/generate-game/route.ts
  - lib/validations.ts
  - types/loreno.ts
acceptance_criteria:
  - "L'API calibre le volume d'items selon le nombre de mots du cours (6 à 18 flashcards, 4 à 8 QCMs)"
  - "Les scans de partiels denses (11 pages) génèrent assez de matière pour alimenter les 6 nœuds sans redondance"
  - "Validation Zod stricte du payload généré"
  - "npm run build passe avec 0 erreur"
---

# FEAT-013 : Volumétrie proportionnelle IA multi-pages

## 1. Contexte & Problème Observé
Actuellement, qu'un étudiant scanne 1 page d'introduction ou 11 pages de droit constitutionnel ou médecine, `/api/decks/generate-game` génère un volume d'échantillon fixe (5 flashcards + 1 piège). Pour un examen universitaire ou une session de révision complète, c'est insuffisant et cela rend les étapes 1, 2, 3 et 5 pauvres en contenu.

## 2. Spécification Technique & Solution 80/20
1. **Évaluation de la densité du cours** :
   - Calculer la longueur en mots de `detailed_content` :
     - Moins de 600 mots : 6 flashcards, 4 QCMs, 1 piège.
     - 600 à 1500 mots : 10 flashcards, 6 QCMs, 2 saisies libres, 1 piège.
     - Plus de 1500 mots : 16 flashcards, 8 QCMs, 4 saisies libres, 2 pièges.
2. **Distribution par étape** :
   - Les items sont attribués aux différentes étapes du parcours pour garantir une expérience fluide de 4 à 5 cartes par micro-session.
3. **Robustesse & Fallback** :
   - Temps d'exécution Gemini Flash maintenu sous 3 secondes.
   - Validation Zod avec schéma dynamique tolérant.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-06
- **Statut final** : `ready`
