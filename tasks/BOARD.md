# 📋 AGENTIC TASK BOARD — LORENO

> **Tableau de Bord des Tâches Atomiques**  
> *Dernière mise à jour* : 2026-10-04 (Intégration du batch de retours Baptiste)

---

## 🚦 Vue Kanban Synthétique

| ID | Type | Priorité | Titre | Auteur | Statut | Fichier |
|---|:---:|:---:|---|:---:|:---:|:---:|
| `BUG-003` | `bug` | `P0` | Fiabilité & cohérence des questions/réponses IA | Baptiste | 🟢 `resolved` | [`tasks/BUG-003-ia-quiz-answer-consistency.md`](file:///home/julien/git/locked-fouder-race/tasks/BUG-003-ia-quiz-answer-consistency.md) |
| `BUG-004` | `bug` | `P0` | Déblocage du palier 2 et progression roadmap | Baptiste | 🟢 `resolved` | [`tasks/BUG-004-roadmap-progression-unlock.md`](file:///home/julien/git/locked-fouder-race/tasks/BUG-004-roadmap-progression-unlock.md) |
| `BUG-005` | `bug` | `P0` | Persistance session mobile (déconnexions Safari/Chrome) | Baptiste | 🟢 `resolved` | [`tasks/BUG-005-mobile-session-persistence.md`](file:///home/julien/git/locked-fouder-race/tasks/BUG-005-mobile-session-persistence.md) |
| `BUG-006` | `bug` | `P0` | Masquage du paywall pour les abonnés Pro | Baptiste | 🟢 `resolved` | [`tasks/BUG-006-hide-paywall-for-pro-users.md`](file:///home/julien/git/locked-fouder-race/tasks/BUG-006-hide-paywall-for-pro-users.md) |
| `FEAT-007` | `feature` | `P1` | Réduction tarifaire automatique pour le filleul acheteur | Baptiste | 🟢 `resolved` | [`tasks/FEAT-007-referral-buyer-discount.md`](file:///home/julien/git/locked-fouder-race/tasks/FEAT-007-referral-buyer-discount.md) |
| `FEAT-008` | `feature` | `P1` | Densité & exhaustivité fiches sur scans 11 pages | Baptiste | 🟢 `resolved` | [`tasks/FEAT-008-multipage-scan-density.md`](file:///home/julien/git/locked-fouder-race/tasks/FEAT-008-multipage-scan-density.md) |
| `UX-009` | `ux` | `P1` | Auto-scroll palier actif + clic ouverture fiche de cours | Baptiste | 🟢 `resolved` | [`tasks/UX-009-roadmap-scroll-and-card-preview.md`](file:///home/julien/git/locked-fouder-race/tasks/UX-009-roadmap-scroll-and-card-preview.md) |
| `UX-010` | `ux` | `P2` | Bouton copier texte viral + grossissement boutons cartes | Baptiste | 🟡 `ready` | [`tasks/UX-010-share-copy-text-and-flashcard-buttons.md`](file:///home/julien/git/locked-fouder-race/tasks/UX-010-share-copy-text-and-flashcard-buttons.md) |
| `FEAT-011` | `feature` | `P2` | Distracteurs QCM indépendants & mode saisie libre | Baptiste | 🟡 `ready` | [`tasks/FEAT-011-qcm-independent-options-and-text-input.md`](file:///home/julien/git/locked-fouder-race/tasks/FEAT-011-qcm-independent-options-and-text-input.md) |
| `TASK-001` | `chore` | `P0` | Refactoring modulaire < 300L & Zod strict | Julien | 🟢 `resolved` | [`tasks/CHORE-001-modular-refactor.md`](file:///home/julien/git/locked-fouder-race/tasks/CHORE-001-modular-refactor.md) |
| `TASK-002` | `ux` | `P1` | Harmonisation Design System tokens sémantiques `brand` | Julien | 🟢 `resolved` | [`tasks/UX-002-semantic-brand-tokens.md`](file:///home/julien/git/locked-fouder-race/tasks/UX-002-semantic-brand-tokens.md) |

---

## 🔄 Flux d'Exécution pour l'Agent IA & Julien
1. **Validation & Arbitrage** : Julien valide l'ordre d'attaque des tâches P0/P1.
2. **Exécution Atomique** : Traitement tâche par tâche avec strict respect des règles (< 300 lignes, zéro `any`, tokens `brand`).
3. **Contrôle & Build** : `npm run build` systématiquement vert avant passage à `resolved`.
