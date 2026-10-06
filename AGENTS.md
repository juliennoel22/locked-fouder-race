# AGENTS.md — DOCTRINE TECHNIQUE & RÈGLES D'EXÉCUTION (LORENO)

## 👤 Persona & Ton
- **Lead Developer & Porteur de Projet** : Julien Noel (Lead Fullstack Senior & Builder Produit orienté conversion).
- **Communication** : Cold logic, zéro condescendance, ultra-concis, direct, focus valeur et vitesse d'expédition.
- **Principe d'Anti-Hallucination** : Chaque réponse commence impérativement par le prénom de Julien ("Julien").

---

## 🎯 Le Tunnel Produit 80/20 (Validé & Non Négociable)
1. **Étape 1 : Gateway Auth Immédiate (Supabase)**
   - Dès l'arrivée, l'étudiant se connecte / s'inscrit via Supabase (Magic link / Email / Google) directement dans le Shell Mobile.
   - Chaque scan et deck est automatiquement rattaché à son `user_id`.
2. **Étape 2 : Scan Caméra, Compression Client & Supabase Storage**
   - Gros bouton central dans la Thumb Zone avec `capture="environment"` (déclenchement direct appareil photo smartphone).
   - **Compression Client Impérative (Canvas HTML5)** : Redimensionnement automatique max 1600px en JPEG qualité 0.8 avant tout envoi réseau (divise la photo de 5 Mo à < 400 Ko, upload instantané).
   - **Supabase Storage** : Upload direct dans le bucket public `course-scans/${user.id}/${deckId}.jpg` $\rightarrow$ Récupération de `image_url` injectée dans la table `decks`.
   - **Gemini 1.5 Flash Vision** : Envoi direct du payload compressé à `/api/scan` pour extraction JSON immédiate (< 2s).
3. **Étape 3 : Swipe Flashcards (Dopamine Max) + Effet Miroir & Offre Agressive**
   - Rendu immédiat des flashcards avec flip 3D au tap et swipe gestuel (Gauche = "À revoir" / Droite = "Je sais").
   - **Effet Miroir Photo** : Bouton *"Voir la note originale"* sur chaque carte permettant d'ouvrir un tiroir/modal affichant la photo scannée (`image_url`) pour vérifier le cours d'origine.
   - Gamification instantanée : Streak counter, bar de progression dynamique, confettis.
   - **Déclencheur Paywall Agressif** : Au pic de dopamine (fin du premier set de 5 cartes ou après 3 swipes réussis), popup d'offre bloquante :
     *"Score de rétention : 85% ! Pour débloquer la suite de ton cours + le Mode Examen Prédictif : Pack Fondateur à 9,99 € (Accès à vie, réservé aux 50 premiers)"* $\rightarrow$ Redirection directe vers Stripe Payment Link.

---

## 📱 Doctrine Mobile-First Absolue (Normes MAXREPLY / MAXED)
*Ce SaaS est promu sur TikTok/Reels : 95% du trafic et de la conversion s'effectue sur smartphone.*

1. **Mobile Shell par Défaut** :
   - Toute l'application est contenue dans un conteneur smartphone (`max-w-md mx-auto` ou `max-w-[480px] w-full mx-auto`).
   - Sur desktop, l'app s'affiche centrée comme une application mobile native élégante (shell avec ombre subtile ou bordure discrète), sans s'étaler sur 1920px.
2. **Dynamic Viewport Height (`100dvh`)** :
   - Toujours utiliser `min-h-[100dvh]` (jamais `100vh` ni `min-h-screen` qui débordent sous la barre Safari iOS / Chrome Android).
3. **Thumb Zone & Ergonomie Tactile** :
   - Les boutons d'action critiques (Prendre une photo, Swipe, Flip card, Achat) sont obligatoirement situés dans la zone naturelle du pouce (bas de l'écran).
   - Cibles tactiles (touch targets) de **minimum 44x44px** pour zéro miss-click.
4. **Anti-Zoom iOS & Safe Areas** :
   - Inputs et textareas forcés à `font-size: 16px` minimum sur mobile pour bloquer le zoom automatique iOS.
   - Respect impératif des safe-areas iPhone (`env(safe-area-inset-bottom)`, `env(safe-area-inset-top)`).
5. **Aesthetic & Design Tokens Sémantiques** :
   - Thème épuré avec tokens sémantiques stricts (zéro couleur hexadécimale arbitraire comme `[#4457f4]`).
   - Utiliser obligatoirement : `brand` (`#4457f4`), `brand-hover` (`#3345de`), `brand/10`, `border-brand/20`.

---

## 🤖 Normes Agentiques 2026 (Living Repo & Tool Contracts)
1. **Règle Stricte des Fichiers < 300 Lignes** :
   - Tout fichier doit impérativement faire **moins de 300 lignes** pour garantir un chargement contextuel ultra-rapide sans hallucination ni troncature.
   - Découper en sous-modules atomiques dès qu'un fichier approche 250 lignes.
2. **TypeScript Strict & Zéro `any`** :
   - Tous les types doivent être déclarés ou inférés depuis les schémas Zod dans `lib/validations.ts`.
   - Zéro casting permissif `as any`.
3. **Schémas Zod comme Source Unique de Vérité (`lib/validations.ts`)** :
   - Tout payload API entrant (POST, PATCH, DELETE) doit être validé via `schema.safeParse(body)` avant tout traitement DB ou IA.
4. **Orchestration des Connecteurs MCP Disponibles** :
   - **Supabase MCP** : Audit de schéma, requêtes SQL d'inspection, validation des migrations et RLS.
   - **Stripe MCP** : Vérification des transactions réelles, gestion des webhooks et payment links.
   - **Vercel MCP** : Surveillance des runtime logs en production, détection des erreurs 500 ou timeouts.
   - **PostHog MCP** : Analyse des funnels de conversion et télémétrie des parcours d'apprentissage.
   - **Meta Ads MCP** : Suivi des campagnes d'acquisition TikTok / Instagram Reels.
5. **Gouvernance Git & Pas d'Opérations Git par l'IA** :
   - L'IA ne manipule jamais git (commits, push, merges) en natif. Tout contrôle de version reste sous le contrôle de Julien.
6. **Code Complet Sans Placeholders** :
   - Aucun `// TODO`, `// ... rest of the code` ou implémentation partielle. Le code livré doit être immédiatement exécutable et testé par `npm run build`.
7. **Protocole de Feedbacks & Tâches (Living Agentic Backlog)** :
   - **Capture Rapide** : Tout retour de Baptiste ou idée brute est consigné dans `INBOX_BAPTISTE.md`.
   - **Fiches Atomiques** : Toute action priorisée devient une fiche dans `tasks/TASK-XXX.md` avec YAML Frontmatter strict (auteur, type, statut, fichiers impactés, critères).
   - **Mise à Jour Systématique par l'Agent** : Dès que Julien ou Baptiste formule un retour, l'agent doit spontanément consigner et mettre à jour `INBOX_BAPTISTE.md`, la fiche de tâche associée dans `tasks/`, l'index `tasks/BOARD.md`, ainsi que `MEMORY.md`.
   - **Clôture de Boucle** : Après chaque implémentation réussie et build vert, l'agent passe le statut à `resolved` et documente la résolution.
