# 🗺️ ROADMAP.md — PLAN D'ATTAQUE & FEUILLE DE ROUTE LORENO

> **Plan d'Exécution & Suivi des Jalons Produit**  
> *Dernière mise à jour* : Octobre 2026 | *Lead* : Julien Noel & Agent IA Antigravity  
> *Sources des feedbacks* : Retours Baptiste (`INBOX_BAPTISTE.md`), Audits Prod, Vocaux 04/10.

---

## 📍 1. Où en Sommes-Nous ? (État des Lieux Live)

### ✅ Ce qui est déjà délivré et opérationnel (Fondations V1)
- **Infra Live & Prerendered** : Domaine `https://www.loreno.app` sur Vercel avec Next.js 16 App Router.
- **Base Supabase & Storage** : Tables `decks`, `flashcards`, bucket public `course-scans` et RLS configurés.
- **Paiements Stripe Live** : Compte Stripe dédié (`acct_1UEmQlAH5Oe6wyUi`) avec lien de paiement 9,99 € actif.
- **Cœur IA Vision** : Route `/api/scan` connectée à Gemini Flash avec extraction JSON de fiches Markdown et flashcards.
- **Architecture Propre** : Code 100% sous 300 lignes par fichier, contrats Zod stricts, tokens sémantiques `brand`.

### ⚠️ Ce qui bloque la mise en main client (Les "Reviews" de Baptiste)
1. **Intégrité IA (P0)** : Des hallucinations causales dans les quiz d'examen détruisent la crédibilité pédagogique.
2. **Progression Roadmap (P0)** : Après le nœud 1, le nœud 2 reste verrouillé dans le parcours.
3. **Persistance Auth Mobile (P0)** : Déconnexions répétées à chaque réouverture du navigateur sur smartphone.
4. **Paywall Pro (P0)** : Le bandeau d'achat s'affiche encore pour les utilisateurs ayant souscrit au pass Pro.
5. **Multi-Pages (P1)** : Les scans de 11 pages sont moins denses que ceux de 4 pages.
6. **Affiliation Filleul (P1)** : Pas de réduction automatique appliquée au panier du filleul.

---

## 🚀 2. Les 4 Sprints d'Exécution

```mermaid
graph LR
    S1["Sprint 1 : P0 Stabilisation (Bloquants)"] --> S2["Sprint 2 : P1 Qualité & Conversion"]
    S2 --> S3["Sprint 3 : P2 Ergonomie & Quiz Avancés"]
    S3 --> S4["Sprint 4 : Démo & Échelle"]
```

---

### 🔴 Sprint 1 : P0 — Fiabilité, Progression & Auth (Immédiat)
*Objectif : Rendre le flux de scan et de révision 100% stable et sans rupture d'expérience.*

| Ticket | Titre | Description & Fichiers Impactés | Statut |
|---|---|---|:---:|
| [`BUG-003`](file:///home/julien/git/locked-fouder-race/tasks/BUG-003-ia-quiz-answer-consistency.md) | **Cohérence IA Questions/Réponses** | Prompts d'alignement causal stricts + liaison `initial_quiz_answer` + correction des lecteurs `AdaptativeReviewPlayer` & `NotebookQuizView`. | 🟢 `resolved` |
| [`BUG-004`](file:///home/julien/git/locked-fouder-race/tasks/BUG-004-roadmap-progression-unlock.md) | **Déblocage Nœud 2 Roadmap** | Corriger la mise à jour de `progress_percent` et la condition de sélection dans `components/review/` pour déverrouiller le palier suivant après réussite. | 🟡 `ready` |
| [`BUG-005`](file:///home/julien/git/locked-fouder-race/tasks/BUG-005-mobile-session-persistence.md) | **Persistance Auth Mobile** | Paramétrer `@supabase/ssr` avec cookies `HttpOnly`, auto-refresh des tokens et gestion gracieuse hors-ligne pour Safari iOS / Chrome. | 🟡 `ready` |
| [`BUG-006`](file:///home/julien/git/locked-fouder-race/tasks/BUG-006-hide-paywall-for-pro-users.md) | **Masquage Paywall pour Abonnés Pro** | Vérifier systématiquement `is_pro` et masquer les modales et bandeaux paywall ; retirer les wordings obsolètes "à vie". | 🟡 `ready` |

---

### 🟠 Sprint 2 : P1 — Conversion, Multi-Pages & Ergonomie (Secondaire)
*Objectif : Optimiser le tunnel de transformation et la richesse pédagogique sur gros volumes de cours.*

| Ticket | Titre | Description & Fichiers Impactés | Statut |
|---|---|---|:---:|
| [`FEAT-007`](file:///home/julien/git/locked-fouder-race/tasks/FEAT-007-referral-buyer-discount.md) | **Réduction Achat Filleul (Affiliation)** | Intégrer un coupon de réduction Stripe automatique (ex: -20%) lorsque l'étudiant provient d'un lien `?ref=...`. | 🟡 `ready` |
| [`FEAT-008`](file:///home/julien/git/locked-fouder-race/tasks/FEAT-008-multipage-scan-density.md) | **Densité Fiches Multi-Pages (11p)** | Optimiser le prompt de synthèse et le chunking vision dans `/api/scan` pour préserver chaque chapitre sans compression excessive d'informations. | 🟡 `ready` |
| [`UX-009`](file:///home/julien/git/locked-fouder-race/tasks/UX-009-roadmap-scroll-and-card-preview.md) | **Scroll Auto Palier + Clic Fiche** | Auto-scroll centré sur le nœud actif lors du chargement de la roadmap + clic sur le badge titre pour ouvrir le tiroir de la fiche de cours. | 🟡 `ready` |

---

### 🟡 Sprint 3 : P2 — Ergonomie Tactile & Variété des Quiz
*Objectif : Perfectionner les interactions physiques et la valeur d'entraînement aux examens.*

| Ticket | Titre | Description & Fichiers Impactés | Statut |
|---|---|---|:---:|
| [`UX-010`](file:///home/julien/git/locked-fouder-race/tasks/UX-010-share-copy-text-and-flashcard-buttons.md) | **Partage Viral & Gros Boutons Touch** | Agrandissement des cibles tactiles "Je sais / À revoir" ($\ge$ 48px) ; copie du texte d'accroche viral complet pour WhatsApp/TikTok. | 🟡 `ready` |
| [`FEAT-011`](file:///home/julien/git/locked-fouder-race/tasks/FEAT-011-qcm-independent-options-and-text-input.md) | **Distracteurs Réels & Saisie Libre** | Génération de distracteurs QCM indépendants non-permutables + mode de saisie libre avec correction tolérante par l'IA. | 🟡 `ready` |

---

### 🟣 Sprint 4 : Démo, Métriques & Échelle (Post-Stabilisation)
- [ ] Enregistrement vidéo de démonstration mobile (< 2 minutes pour le jury).
- [ ] Dashboard analytique PostHog & Meta Ads pour monitorer le coût d'acquisition par scan.
- [ ] Relances Spaced Repetition (SRS) par notifications Web Push / Email.

---

## 🤝 3. Mode Opératoire & Collaboration Agentique Julien $\leftrightarrow$ Antigravity

Pour travailler vite, sans régression et avec un niveau de rigueur maximal :

1. **Règle de l'Unité de Travail (Tâche par Tâche)** :
   - On ne fait pas de refactor géant d'un coup. On sélectionne un ticket (ex: `BUG-003`), on l'attaque, on le teste, on valide `npm run build`, puis on passe au suivant.
2. **Cycle de Vie des Tickets** :
   - Statut initial : 🟡 `ready` $\rightarrow$ En cours : 🔵 `in_progress` $\rightarrow$ Clôturé : 🟢 `resolved` dans `tasks/BOARD.md` et `MEMORY.md`.
3. **Plafond Strict des 300 Lignes** :
   - Tout fichier approchant les 250 lignes est découpé en composants atomiques.
4. **Protocole des Buckets d'Action pour Julien** :
   - Dès qu'une tâche de génération ou d'analyse lourde démarre, l'agent annonce le temps estimé et t'oriente vers :
     - **Bucket 1 (1-2 min)** : Reset neuro-biologique (respiration, étirements).
     - **Bucket 2 (3-5 min)** : Actifs TikTok / Outreach créateurs étudiants.
     - **Bucket 3 (5-10 min)** : Pause déconnexion / marche.
5. **Gouvernance Git** :
   - L'agent ne manipule aucun git en natif ; tu conserves la main absolue sur les commits et le push en production.
