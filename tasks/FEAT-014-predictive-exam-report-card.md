---
id: FEAT-014
title: "Bulletin prédictif d'examen (/20) & diagnostic de lacunes"
author: "Julien"
type: "feature"
status: "resolved"
priority: "p1"
created_at: "2026-10-06"
affected_files:
  - components/review/review-completed-modal.tsx
  - components/AdaptativeReviewPlayer.tsx
acceptance_criteria:
  - "L'écran de complétion affiche une note estimée sur 20 réaliste basée sur les erreurs"
  - "Diagnostic clair avec points forts acquis et 1 à 2 notions critiques à revoir"
  - "CTA d'upsell Pro orienté réussite aux partiels (Mode Examen Prédictif)"
  - "npm run build passe avec 0 erreur"
---

# FEAT-014 : Bulletin prédictif d'examen (/20) & diagnostic de lacunes

## 1. Contexte & Problème Observé
L'écran de fin précédent affichait passivement "Session validée à 100%" sans note ni retour concret sur la performance. L'étudiant manquait d'un ancrage réaliste sur son niveau de maîtrise en condition d'épreuve.

## 2. Spécification Technique & Solution 80/20
1. **Formule de Notation Académique Prédictive** :
   - Note sur 20 calculée dynamiquement : `Math.max(6, Math.min(20, Math.round(20 - (errorCount * 2.5))))`.
   - Mentions académiques : Très Bien (>=16), Bien (>=14), Assez Bien (>=12), Passable (>=10), Ajourné (<10).
2. **Diagnostic Express des Notions** :
   - Nombre de notions clés maîtrisées sans hésitation.
   - Liste des notions critiques nécessitant un rattrapage immédiat.
3. **Levier de Conversion Pro & Dopamine** :
   - Encadré incitatif vers le "Mode Examen Loreno Pro" avec annales corrigées.
   - Célébration par arpège triomphal audio et confettis.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-15
- **Statut final** : `resolved`
- **Fichiers impactés** : `components/review/review-completed-modal.tsx` (185L), `components/AdaptativeReviewPlayer.tsx` (277L).
- **Vérification** : Calcul de la note vérifié avec 0, 1 et multi-erreurs, rendu mobile responsive sous 480px.
