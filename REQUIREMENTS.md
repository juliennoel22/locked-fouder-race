# 📐 REQUIREMENTS.md — SPÉCIFICATIONS & EXIGENCES TECHNIQUES LORENO (SaaS IA B2C)

> **Document de Référence & Contrat d'Exigences Produit**  
> *Statut* : Actif (Octobre 2026) | *Application* : [Loreno.app](https://www.loreno.app)  
> *Stack* : Next.js 16 (App Router), Supabase SSR, Gemini 1.5/2.5 Flash, Stripe Live, Tailwind v3 / CSS Modules.

---

## 🎯 1. Thèse Produit & Métriques Clés B2C
Loreno transforme une prise de note manuscrite d'étudiant en un kit d'examen prêt à l'emploi en moins de 3 secondes :
1. **Time-to-Value (TTV) < 5s** : De la photo au premier swipe de flashcard.
2. **Qualité Cognitive 10/10** : Fiche synthétique mais exhaustive, questions sans hallucination causale, distracteurs QCM non interchangeables.
3. **Conversion & Rétention** : Boucle de swipe dopamine, révision adaptative (réinjection des erreurs), paywall contextuel Pro (9,99 €) masqué pour les abonnés actifs.

---

## 🧠 2. Meilleures Pratiques d'Ingénierie SaaS IA B2C (Standard 2026)

### 2.1 Latence & Fast-Path vs Slow-Path
- **Compression Client Impérative** : Redimensionnement Canvas HTML5 max 1600px en JPEG 0.8 avant tout envoi réseau (réduction de 5 Mo à < 400 Ko).
- **Fast-Path (Lecture / Cache)** : Les decks déjà générés et les profils sont servis via Supabase SSR avec cache HTTP et réhydratation instantanée (< 100ms).
- **Slow-Path (Génération Vision)** : Utilisation d'un modèle ultra-rapide et économique (Gemini Flash) avec UI optimiste (skeletons animés, barre de progression) et reprise sur incident.

### 2.2 Fiabilité Absolue des Structured Outputs (Contrat Zod)
- **Zero Raw LLM Output** : Toute réponse d'IA passe obligatoirement par un schéma Zod (`lib/validations.ts`).
- **Déterminisme Prompting** : `temperature: 0.2` pour l'extraction de fiches et quiz ; prompt forçant une causalité stricte Question $\leftrightarrow$ Réponse pour éliminer les anachronismes (ex: crise de 1929 vs Front Populaire).
- **Auto-Correction & Fallback** : Si le parsing JSON échoue, un parser d'assainissement regex extrait le premier bloc `{...}` valide avant rejet d'erreur.

### 2.3 Rétention & Spaced Repetition (SRS)
- **Algorithme Adaptatif Léger** : Les cartes swipées à gauche ("À revoir") sont réinjectées en fin de cycle ou dans les quiz des nœuds suivants.
- **Progression Duolingo** : Déblocage séquentiel garanti des nœuds (Nœud $N+1$ débloqué dès réussite du Nœud $N$).
- **Habit Loop** : Streaks quotidiens, micro-animations au succès (confettis), sauvegarde automatique de l'avancement (`progress_percent`).

### 2.4 Ergonomie Tactile & Mobile-First
- **Shell Mobile Universel** : Conteneur centré `max-w-md mx-auto` sur desktop, `min-h-[100dvh]` sur mobile.
- **Anti-Zoom iOS** : Tous les `input` et `textarea` sont forcés à `font-size: 16px` minimum.
- **Thumb Zone** : Boutons critiques (Photo, Swipe, Valider, Acheter) d'au moins **44x44px** situés dans les 30% inférieurs de l'écran.
- **Persistance de Session Mobile** : Stockage des tokens Supabase en cookies `HttpOnly` / `SameSite=Lax` via `@supabase/ssr` avec auto-refresh pour éliminer les déconnexions intempestives sur Safari iOS.

---

## 📋 3. Spécifications Fonctionnelles Détaillées

### F-01 : Authentification & Persistance Session
- **Spécification** : Inscription / Connexion Magic Link, Email/Mot de passe ou compte invité persistant.
- **Critère d'Acceptation** : L'utilisateur reste connecté lors de la fermeture/réouverture de Safari/Chrome mobile. Les requêtes SSR valident la session sans redirection intempestive.

### F-02 : Scan Caméra Multi-Pages & Compression
- **Spécification** : Upload direct ou capture appareil photo de 1 à 15 photos simultanées.
- **Critère d'Acceptation** : Les photos sont compressées sur le client, envoyées à Supabase Storage (`course-scans/${user.id}/${deckId}.jpg`), et traitées sans perte de granularité sur 11+ pages.

### F-03 : Génération de Fiches & Flashcards IA
- **Spécification** : Extraction conjointe :
  - `detailed_content` : Fiche de révision structurée en Markdown (titres, définitions, dates clés, pièges d'examen).
  - `flashcards` : Minimum 5 à 15 paires recto/verso pertinentes.
  - `initial_quiz_question` : Question d'évaluation immédiate.
- **Critère d'Acceptation** : Zéro hallucination historique/scientifique ; rigueur logique entre questions et réponses.

### F-04 : Parcours Adaptatif de Révision (Roadmap Nœuds)
- **Spécification** : Vue roadmap style Duolingo. Auto-scroll au chargement sur le palier actif.
- **Critère d'Acceptation** : Terminer le palier 1 débloque immédiatement le palier 2 en BDD (`progress_percent` mis à jour). Clic sur l'en-tête du cours ouvre la fiche complète.

### F-05 : Variété des Quiz & Distracteurs Réalistes
- **Spécification** :
  - Distracteurs QCM indépendants (pas de simples permutations des 4 réponses).
  - Mode saisie libre (input texte avec tolérance orthographique par l'IA ou regex).
- **Critère d'Acceptation** : L'étudiant ne peut pas déduire la bonne réponse par élimination croisée.

### F-06 : Paywall Cohérent & Affiliation
- **Spécification** :
  - Masquage total des bannières/modales d'achat pour les utilisateurs ayant `is_pro === true`.
  - Affiliation 20% : Le filleul recevant un lien `?ref=CODE` bénéficie d'une réduction automatique Stripe (coupon) à l'achat + 3 jours Pro offerts.
- **Critère d'Acceptation** : Aucun wording obsolète ("à vie à 9,99€") visible par un Pro ; coupon Stripe fonctionnel sur le checkout.

---

## 🔒 4. Exigences Non-Fonctionnelles & Règles Code
1. **Fichiers < 300 lignes** : Tout composant ou route API dépassant 250 lignes est découpé en sous-modules (`/components/submodule/`).
2. **Type Safety** : Strict TypeScript, 0 type `any`, schémas Zod comme source de vérité.
3. **Tokens de Design** : Utilisation exclusive des tokens sémantiques `brand`, `brand-hover`, `border-brand/20`.
4. **Build Check** : Aucun commit sans `npm run build` validé sans erreur.
