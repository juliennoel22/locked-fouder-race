# 🗺️ ROADMAP.md — PLAN D'ATTAQUE & ÉTAT DES LIEUX COMPLET (LORENO)

> **Document Maître de Référence & Analyse sans Optimisme**  
> *Dernière mise à jour* : 6 Octobre 2026 | *Lead* : Julien Noel & Agent IA Antigravity  
> *Posture* : Scepticisme absolu, zéro complaisance, focus conversion & rétention étudiante vs Gizmo / Duolingo / TurboLearn.

---

## ⚖️ 1. L'Arbitrage Sceptique : Gros Chantier ou Simple Optimisation ?

### 🛑 Le Diagnostic sans filtre :
- **Est-ce un "gros gros gros travail" (réécriture complète) ?**  
  👉 **NON.** L'infrastructure (Next.js 16, Supabase SSR, cookies 1 an, compression client Canvas, Stripe live, Gemini Flash) est saine, robuste et déjà en production. Il n'y a aucun besoin de refaire l'architecture technique de base.
- **Est-ce juste "de la simple optimisation ou du cosmétique" ?**  
  👉 **NON PLUS.** Qualifier le travail restant de "simple optimisation" serait un biais d'optimisme dangereux. Il y a un **problème de conception pédagogique majeur** :  
  L'application souffre d'une **schizophrénie d'expérience** :
  - *La promesse visuelle* : Une roadmap serpentine façon Duolingo avec 6 étapes graduées (Concepts $\rightarrow$ Mémorisation 3D $\rightarrow$ Quiz $\rightarrow$ Coffre $\rightarrow$ Rappel Actif $\rightarrow$ Épreuve Finale).
  - *La réalité technique actuelle* : Quel que soit le nœud cliqué, le routeur envoie vers `/review/[id]` qui balance **l'intégralité du deck en une seule traite monolithique**, puis affiche "100% Validé" sans distinction.
- **La conclusion concrète** :  
  Ce n'est **ni 6 mois de dev, ni un coup de peinture**. C'est un **chantier chirurgical de découplage de 3 à 4 jours de dev (12 à 16h)** pour aligner la réalité du player sur la promesse de la roadmap.

---

## 🧱 2. Ce qui est SOLIDE, CONSOLIDÉ et DÉFINITIF (On n'y touche plus)

Ces briques ont été testées, auditées et répondent aux standards de production :

| Composant | Statut Réel | Preuve Technique / Pourquoi c'est blindé |
|---|:---:|---|
| **Auth & Session Mobile (1 an)** | 🟢 Béton | Cookies Supabase SSR paramétrés avec `maxAge: 31536000` (`lib/supabase/client.ts`, `server.ts`, `proxy.ts`). Zéro déconnexion parasite sur Safari iOS / Chrome Android. |
| **Pipeline Scan & Compression Client** | 🟢 Béton | Canvas HTML5 redimensionnant les photos à max 1600px en JPEG 0.8 avant envoi (`lib/image-compressor.ts`). Upload de 5 Mo réduit à < 400 Ko. Zéro timeout réseau en 4G. |
| **OCR & Synthèse Markdown (Gemini Flash)** | 🟢 Béton | Prompting haute densité (`app/api/scan/route.ts`). Restitution fidèle des cours jusqu'à 11+ pages en fiches Markdown structurées avec définitions en gras. |
| **Monétisation Stripe & Affiliation Live** | 🟢 Béton | Compte Stripe configuré (`acct_1UEmQlAH5Oe6wyUi`), lien de paiement 9,99 €/mois. Cookie parrain injecté automatiquement avec code promo `PARRAIN20` (-20% / 7,99 €) pour le filleul acheteur. |
| **Guardrail Anti-Hallucination IA** | 🟢 Béton | Critic Guardrail à `temperature: 0` (`lib/ai-validator.ts`) vérifiant l'alignement causal question/réponse et rejetant les inversions logiques. |
| **Génération Distracteurs QCM Indépendants** | 🟢 Béton | Zéro distractor permuté idiot. L'IA génère 3 faux choix plausibles spécifiques à la question (`app/api/decks/generate-game/route.ts`). |
| **Saisie Libre Active Recall** | 🟢 Béton | Composant `ReviewFreeTextStep` avec comparaison sémantique et tolérance aux fautes d'orthographe légères. |
| **Architecture du Code & Qualité** | 🟢 Béton | Zéro fichier > 300 lignes, Next.js 16 App Router propre, compilation `npm run build` en 0 erreur, typage TypeScript strict, zéro `any`, Zod schemas stricts. |

---

## 📋 3. Ce qu'il reste à faire EN DÉTAIL (Chantier par Chantier)

---

### 🎯 CHANTIER 1 (P0) : Découplage Réel des 6 Nœuds du Parcours
> **Objectif** : Transformer la roadmap en 6 vraies micro-sessions de 60 à 90 secondes avec sauvegarde de l'étape.

#### 1.1. Paramétrage d'URL et Filtrage de la File d'Attente
- **Fichiers impactés** : [`components/review/course-path-map.tsx`](file:///home/julien/git/locked-fouder-race/components/review/course-path-map.tsx), [`app/deck/[id]/page.tsx`](file:///home/julien/git/locked-fouder-race/app/deck/[id]/page.tsx), [`app/review/[id]/page.tsx`](file:///home/julien/git/locked-fouder-race/app/review/[id]/page.tsx), [`components/AdaptativeReviewPlayer.tsx`](file:///home/julien/git/locked-fouder-race/components/AdaptativeReviewPlayer.tsx).
- **Spécification technique** :
  - Le clic sur un nœud dans `PathNodeModal` ou la carte redirige vers `/review/[id]?step=X` (où X est 1 à 6).
  - Dans `AdaptativeReviewPlayer.tsx`, la queue est construite **exclusivement pour le palier actif** :
    - **Étape 1 (Concepts Clés)** : 4 fiches de lecture/découverte avec validation simple "J'ai compris".
    - **Étape 2 (Mémorisation 3D)** : 4 ou 5 cartes flashcards avec flip 3D et évaluation swipe (Je sais / À revoir).
    - **Étape 3 (Test de Notions)** : 4 questions QCM chronométrées avec les 3 distracteurs uniques.
    - **Étape 4 (Coffre Trésor)** : Écran palier dopamine (gain de flammes / XP, récapitulatif de rétention intermédiaire).
    - **Étape 5 (Rappel Avancé)** : 2 à 3 exercices de saisie libre (`free_text`) pour tester la mémoire active sans indice.
    - **Étape 6 (Épreuve Finale)** : La question piège d'examen (`exam_trap`) + délivrance du bulletin prédictif.
- **Sauvegarde d'état** :
  - À la fin d'une étape, la progression `loreno_progress_${deckId}` passe à `Math.round((step / 6) * 100)` (ex: 17%, 33%, 50%, 67%, 83%, 100%).
  - Mise à jour en base via `PATCH /api/decks` pour synchronisation multi-appareils.
  - Redirection automatique vers `/deck/[id]` avec zoom/scroll sur le nœud suivant déverrouillé.

---

### 🧠 CHANTIER 2 (P1) : Volumétrie IA Proportionnelle à la Taille du Cours
> **Objectif** : Empêcher qu'un cours de 11 pages produise le même nombre ridicule de questions qu'un polycopié d'1 page.

#### 2.1. Calcul Dynamique du Volume de Génération
- **Fichiers impactés** : [`app/api/decks/generate-game/route.ts`](file:///home/julien/git/locked-fouder-race/app/api/decks/generate-game/route.ts), [`lib/validations.ts`](file:///home/julien/git/locked-fouder-race/lib/validations.ts).
- **Spécification technique** :
  - Analyser le volume de `detailed_content` ou du cours scanné :
    - *Cours court (< 500 mots)* : 6 cartes flashcards, 4 QCMs, 1 piège (total 11 items).
    - *Cours moyen (500 à 1500 mots)* : 10 cartes flashcards, 6 QCMs, 2 saisies libres, 1 piège (total 19 items).
    - *Cours dense (> 1500 mots, partiel 11 pages)* : 16 cartes flashcards, 8 QCMs, 4 saisies libres, 2 pièges (total 30 items répartis sur les 6 étapes).
  - Stocker les items avec un champ `step_target: 1 | 2 | 3 | 5 | 6` pour distribution déterministe.

---

### 🎓 CHANTIER 3 (P1) : Bulletin Prédictif d'Examen (/20) & Diagnostic de Faiblesses
> **Objectif** : Sortir du simple "100% Validé" qui ne renseigne pas l'étudiant, pour lui donner un verdict académique crédible.

#### 3.1. Refonte du Rapport de Fin de Session
- **Fichiers impactés** : [`components/review/review-completed-modal.tsx`](file:///home/julien/git/locked-fouder-race/components/review/review-completed-modal.tsx), [`components/AdaptativeReviewPlayer.tsx`](file:///home/julien/git/locked-fouder-race/components/AdaptativeReviewPlayer.tsx).
- **Spécification technique** :
  - Calcul de la **Note Prédictive sur 20** :
    - Formule pondérée : `Note = Max(6, 20 - (erreurs_qcm * 2.5) - (erreurs_freetext * 3) - (piege_rate ? 4 : 0))`.
  - Section **Diagnostic Express** :
    - *Points forts* : "Définitions fondamentales maîtrisées à 100%".
    - *Point critique à revoir* : La question où l'étudiant a hésité ou s'est trompé.
  - Call To Action orienté conversion :
    - Si l'utilisateur n'est pas Pro : *"Envie de t'entraîner sur les 14 autres pièges d'examen de ce cours ? Débloque le Mode Examen Pro."*

---

### ⚡ CHANTIER 4 (P2) : Dopamine Sensorielle (Haptics & Audio Chimes)
> **Objectif** : Donner une sensation physique d'impact sur mobile lors des bonnes et mauvaises réponses.

#### 4.1. Micro-Retours Haptiques Smartphone
- **Fichiers impactés** : [`components/review/review-flashcard-step.tsx`](file:///home/julien/git/locked-fouder-race/components/review/review-flashcard-step.tsx), [`components/review/review-quiz-step.tsx`](file:///home/julien/git/locked-fouder-race/components/review/review-quiz-step.tsx), [`components/review/review-freetext-step.tsx`](file:///home/julien/git/locked-fouder-race/components/review/review-freetext-step.tsx).
- **Spécification technique** :
  - Création d'un utilitaire `lib/haptics.ts` appelant `navigator.vibrate` en sécurité avec fallback silencieux :
    - Succès : `vibrate([20])` (léger tap net).
    - Erreur : `vibrate([40, 60, 40])` (double tap sourd).
    - Étape terminée : `vibrate([30, 40, 50, 40, 60])` (célébration).

---

## ⏱️ 4. Calendrier d'Exécution Réaliste

| Ticket | Tâche | Fichiers Principaux | Temps Réel | Risque |
|---|---|---|:---:|:---:|
| `FEAT-012` | **Micro-Sessions Découplées (`?step=1..6`)** | `AdaptativeReviewPlayer.tsx`, `app/deck/[id]/page.tsx`, `course-path-map.tsx` | **4 à 5h** | Faible |
| `FEAT-013` | **Volumétrie Proportionnelle IA** | `app/api/decks/generate-game/route.ts` | **2h** | Faible |
| `FEAT-014` | **Bulletin Prédictif d'Examen (/20)** | `components/review/review-completed-modal.tsx` | **3h** | Très faible |
| `UX-015` | **Micro-Haptics Mobile & Feedback** | `lib/haptics.ts`, composants review | **1h30** | Très faible |

**Total d'effort net pour hisser Loreno au niveau Gizmo / Duolingo** : **~11 heures d'ingénierie active** (réalisable en 2 à 3 sessions intenses).
