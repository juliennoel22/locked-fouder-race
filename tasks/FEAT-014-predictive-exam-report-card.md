---
id: FEAT-014
title: "Bulletin prédictif d'examen (/20) & diagnostic de lacunes"
author: "Julien"
type: "feature"
status: "ready"
priority: "p1"
created_at: "2026-10-06"
affected_files:
  - components/review/review-completed-modal.tsx
  - components/AdaptativeReviewPlayer.tsx
  - types/loreno.ts
acceptance_criteria:
  - "L'écran de complétion affiche une note estimée sur 20 réaliste basée sur les erreurs"
  - "Diagnostic clair avec points forts acquis et 1 à 2 notions critiques à revoir"
  - "CTA d'upsell Pro orienté réussite aux partiels (Mode Examen Prédictif)"
  - "npm run build passe avec 0 erreur"
---

# FEAT-014 : Bulletin prédictif d'examen (/20) & diagnostic de lacunes

## 1. Contexte & Problème Observé
L'écran de fin actuel affiche "Session validée à 100%" avec des confettis, peu importe le nombre d'erreurs commises. L'étudiant ne sait pas ce qu'il maîtrise ni quel score il obtiendrait en situation réelle de partiel. Cela diminue l'impact psychologique et la valeur perçue de Loreno par rapport à un tuteur privé.

## 2. Spécification Technique & Solution 80/20
1. **Formule de Notation Académique** :
   - Calcul de la note sur 20 pondérée :
     `note = Math.max(6, Math.min(20, 20 - (erreurs_qcm * 2) - (erreurs_texte * 3) - (piege_rate ? 4 : 0)))`.
2. **Diagnostic Précis** :
   - Afficher les notions réussies sans hésitation ("Points forts").
   - Lister les 1 ou 2 questions ratées ou hésitées avec leur correction directe ("À revoir avant l'épreuve").
3. **Levier de Conversion Pro** :
   - Bandeau incitatif : "Débloque la banque de 15 questions d'annales corrigées avec Loreno Pro".

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-06
- **Statut final** : `ready`
