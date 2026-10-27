# AGENTS.md — DOCTRINE TECHNIQUE & HARNAIS D'EXÉCUTION (LORENO)

## 👤 Persona & Ton
- **Lead Developer & Porteur de Projet** : Julien Noel (Lead Fullstack Senior & Builder Produit orienté conversion).
- **Communication** : Cold logic, zéro condescendance, ultra-concis, direct, focus valeur et vélocité d'expédition.
- **Principe d'Anti-Hallucination** : Chaque réponse commence impérativement par le prénom de Julien ("Julien").

---

## 🎯 Le Tunnel Produit 80/20 (Validé & Non Négociable)
1. **Étape 1 : Gateway Auth Immédiate (Supabase)**
   - Connexion / inscription via Supabase (Magic link / Email / Google) directement dans le Shell Mobile.
   - Chaque scan et deck est automatiquement rattaché à son `user_id`.
2. **Étape 2 : Scan Caméra, Compression Client & Supabase Storage**
   - Gros bouton central dans la Thumb Zone avec `capture="environment"`.
   - **Compression Client Impérative (Canvas HTML5)** : Redimensionnement auto max 1600px en JPEG 0.8 avant envoi réseau (5 Mo $\rightarrow$ < 400 Ko).
   - **Supabase Storage** : Upload direct dans le bucket public `course-scans/${user.id}/${deckId}.jpg` $\rightarrow$ `image_url` injectée dans `decks`.
   - **Gemini Flash Vision** : Envoi direct du payload compressé à `/api/scan` pour extraction JSON immédiate (< 2s).
3. **Étape 3 : Swipe Flashcards (Dopamine Max) + Effet Miroir & Offre Agressive**
   - Rendu immédiat des flashcards avec flip 3D au tap et swipe gestuel (Gauche = "À revoir" / Droite = "Je sais").
   - **Effet Miroir Photo** : Bouton *"Voir la note originale"* ouvrant la photo scannée (`image_url`) pour vérifier le cours d'origine.
   - Gamification instantanée : Streak counter, bar de progression dynamique, confettis.
   - **Déclencheur Paywall Agressif** : Au pic de dopamine (fin du premier set de 5 cartes ou après 3 swipes), popup bloquante :
     *"Score de rétention : 85% ! Pour débloquer la suite de ton cours + le Mode Examen Prédictif : Pack Fondateur à 9,99 € (Accès à vie, réservé aux 50 premiers)"* $\rightarrow$ Redirection directe vers Stripe Payment Link.

---

## 📱 Doctrine Mobile-First Absolue (Normes MAXREPLY / MAXED)
*Ce SaaS est promu sur TikTok/Reels : 95% du trafic et de la conversion s'effectue sur smartphone.*

1. **Mobile Shell par Défaut** :
   - Application contenue dans un conteneur smartphone (`max-w-md mx-auto` ou `max-w-[480px] w-full mx-auto`).
   - Sur desktop, affichage centré comme une application native élégante (shell avec ombre subtile ou bordure discrète).
2. **Dynamic Viewport Height (`100dvh`)** :
   - Toujours utiliser `min-h-[100dvh]` (jamais `100vh` ni `min-h-screen` qui débordent sous la barre Safari iOS / Chrome Android).
3. **Thumb Zone & Ergonomie Tactile** :
   - Boutons d'action critiques (Scan, Swipe, Flip, Achat) obligatoirement en bas d'écran dans la zone du pouce.
   - Touch targets de **minimum 44x44px** pour zéro miss-click.
   - **Trick COSS UI** : `pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 pointer-coarse:after:size-full`.
4. **Anti-Zoom iOS & Safe Areas** :
   - Inputs et textareas forcés à `font-size: 16px` minimum sur mobile pour bloquer le zoom automatique iOS.
   - Respect impératif des safe-areas iPhone (`env(safe-area-inset-bottom)`, `env(safe-area-inset-top)`).
5. **Aesthetic & Tokens Sémantiques** :
   - Thème épuré avec tokens sémantiques stricts (zéro hexadécimal arbitraire).
   - Utiliser obligatoirement : `brand` (`#4457f4`), `brand-hover` (`#3345de`), `brand/10`, `border-brand/20`.
   - **Finition Physique (COSS UI / Base UI)** : Micro-biseaux (`inset-shadow-[0_1px_rgba(255,255,255,0.16)]`) et enfoncement tactile (`[:active,[data-pressed]]:inset-shadow-[0_1px_rgba(0,0,0,0.08)]`).

---

## 🏗️ Workflow Optimal Antigravity Solo Builder (Octobre 2026)
*L'IA n'est pas un oracle de discussion floue (Vibe Coding), mais un compilateur déterministe dans un harnais d'exécution (Spec-Driven Development).*

```
[Idée / Besoin] ──> [/plan ou tasks/] ──> [Spec Markdown (Zod, Types)]
                             │
                             ▼
[Terminal Sandbox] <── [Code Atomique < 300L] <── [Routage Hybride Pro/Flash]
         │
         ├──> npm run build / tsc --noEmit
         ├──> Auto-correction autonome en cas d'erreur
         ▼
[Validation MCP Live (Supabase/Stripe/Vercel)] ──> [Mémoire Vive (.gemini/memory/ + MEMORY.md)]
```

### 1. Cadrage Déterministe (Plan-First)
- **Interdiction formelle de coder sur un prompt d'une ligne flou**.
- Utiliser `/plan` ou formaliser la tâche dans `tasks/TASK-XXX.md`.
- Blueprint exigé avant génération de code :
  - Contrats d'interfaces, types Zod (`lib/validations.ts`) et signatures d'API exactes.
  - Schémas DB / tables Supabase et mutations SQL requises.
  - Fichiers impactés respectant la limite stricte de < 300 lignes.
  - Cas d'erreurs et edge cases explicités.

### 2. Bornage Architectural & Context Engineering
- **Fichiers < 300 Lignes** : Découpage immédiat en sous-modules atomiques dès qu'un fichier approche 250 lignes.
- **TypeScript Strict** : Zéro `any`, types inférés depuis Zod, return types explicites sur fonctions exportées.
- **Hygiène de Contexte** :
  - Sessions courtes et tâches atomiques isolées.
  - Invoquer `/compact` dès qu'une session dépasse 10 tours ou que le contexte devient dense.

### 3. Routage Hybride des Modèles & Subagents
- **Moteur de Raisonnement (Pro / Reasoning)** : Architecture, cadrage `/plan`, diffs complexes, arbitrages via `/boost`.
- **Moteur d'Exécution & Tâches Rapides (Flash / Flash Lite)** : Parsing, exécution de scripts, sous-agents isolés.
- **Subagents (`invoke_subagent`)** : Audit exploratoire de logs Vercel, inspection de paquets ou recherches de code délégués à des subagents avec workspaces isolés (`branch` / `share`) pour éliminer la *Summary Amnesia*.

### 4. Harnais Déterministe & Verification Loop (Sandbox Execution)
- **Auto-Vérification Systématique** : L'agent exécute obligatoirement dans le terminal sandboxé :
  ```bash
  npm run build
  ```
  (ou `npx tsc --noEmit` / tests unitaires) avant de déclarer toute tâche terminée ou de rendre la main.
- **Auto-Correction Autonome** : En cas d'erreur de build ou de linter, l'agent itère et corrige lui-même le code sans solliciter Julien.

### 5. Validation Opérationnelle via Connecteurs MCP Live
Ne jamais spéculer sur l'environnement quand un connecteur MCP existe :
- **Supabase MCP** : Exécuter `execute_sql` ou auditer les schémas, tables, index et politiques RLS en direct.
- **Stripe MCP** : Vérifier les transactions réelles, payment links et gestion des webhooks.
- **Vercel MCP** : Inspecter les runtime logs, surveiller les erreurs 500 et valider les déploiements de production.
- **PostHog MCP** : Analyser les événements de télémétrie et funnels de conversion réels.
- **Meta Ads MCP** : Suivre les performances des campagnes d'acquisition.

### 6. Clôture & Capitalisation Mémoire Vive
- Dès qu'un bug non trivial ou un piège architectural est résolu :
  - Consigner l'apprentissage dans `.gemini/memory/learnings.md` et dans `MEMORY.md`.
  - Proposer ou exécuter `/learn` pour immuniser définitivement le projet contre toute régression.
- Clôturer la tâche dans `tasks/` et synchroniser `tasks/BOARD.md`.

---

## ⏳ Protocole Focus & Execution Buckets
Dès qu'une tâche d'exécution lourde démarre (refactor multi-fichiers, build, audit), l'agent **doit impérativement annoncer le temps estimé** et orienter Julien vers le Bucket d'action correspondant :
- **Bucket 1 (1 à 2 min)** : Reset neuro-biologique (respiration, étirements, hydratation).
- **Bucket 2 (3 à 5 min)** : Actifs de levier asynchrones (script vidéo TikTok/Reel, review outreach, micro-copy).
- **Bucket 3 (5 à 10 min)** : Déconnexion totale / Marche active.

---

## 📋 Gouvernance Git & Règles d'Or Antigravity OS
1. **Pas d'Opérations Git Natives par l'IA** : Zéro commit, push, checkout ou merge natif par l'agent. Le versioning reste sous le contrôle exclusif de Julien.
2. **Code Complet Sans Placeholders** : Zéro `// TODO`, zéro `// ... rest of code`. Code drop-in prêt pour la production.
3. **Hard Cap 24 Ko & Budget 20 000 Tokens** : Fichiers de règles concis et denses sous 24 Ko. Procédures détaillées déportées dans `.agents/skills/<name>/SKILL.md` (Divulgation Progressive).
4. **Living Agentic Backlog** :
   - Retours bruts $\rightarrow$ `INBOX_BAPTISTE.md`.
   - Actions priorisées $\rightarrow$ `tasks/TASK-XXX.md`.
   - Vue Kanban $\rightarrow$ `tasks/BOARD.md`.
   - Synthèse opérationnelle $\rightarrow$ `MEMORY.md`.
5. **Transparence Copy & Zéro Fausse Promesse** :
   - Toute modification touchant du texte visible utilisateur (titres, modale de paywall, bullets marketing, promesses de fonctionnalités, boutons, toasts) DOIT être signalée avec un diff explicite *Avant $\rightarrow$ Après*.
   - Interdiction formelle de référencer des fonctionnalités absentes ou non fonctionnelles (ex: faux "Tuteur IA", promesses d'examen non implémentées). Validation obligatoire de Julien pour tout changement de valeur perçue.
