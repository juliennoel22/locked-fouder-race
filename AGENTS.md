# AGENTS.md — DOCTRINE TECHNIQUE & RÈGLES D'EXÉCUTION (SNAPSTUDY)

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

## 📱 Doctrine Mobile-First Absolue (Héritage MAXREPLY / MAXED)
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
5. **Aesthetic & Conversion** :
   - Thème sombre épuré (zinc-950/black, touches amber/orange énergétiques), micro-animations fluides, zéro latence perçue.

---

## ⚡ Doctrine d'Exécution Commando (Hackathon 24H)
1. **Règle 80/20 Absolue** : Priorité totale à l'impact utilisateur et à l'encaissement Stripe. Pas de fioritures, pas de sur-ingénierie.
2. **Modularité & Taille des Fichiers** : Tout fichier doit impérativement faire **moins de 300 lignes**. Découper en composants et sous-modules réutilisables.
3. **TypeScript Strict** : Zéro `any`. Interfaces et types explicites pour toutes les structures (Flashcards, Deck, OCR, Chat).
4. **Pas d'opérations Git par l'IA** : L'IA ne manipule jamais git (commits, push, merges) en natif. Tout contrôle de version reste sous le contrôle de Julien.
5. **Code Complet Sans Placeholders** : Aucun `// TODO`, `// ... rest of the code` ou implémentation partielle. Le code livré doit être immédiatement exécutable.

---

## 🏗️ Architecture & Stack Technique
- **Framework** : Next.js 15 App Router (starter public `with-supabase`).
- **Style & UI** : Tailwind CSS, Lucide React, Canvas Confetti. Mobile-first container.
- **Backend & Storage** : Supabase (SSR client `@supabase/ssr`, Auth email/magic link, tables `decks` & `flashcards`, bucket public `course-scans` via `supabase/schema.sql`).
- **Intelligence Artificielle** :
  - **Gemini 1.5 Flash** (`@google/genai`) : vision multimodale (analyse de notes manuscrites, structuration JSON) + Tuteur d'Examen interactif.
- **Monétisation** : Redirection directe vers un **Stripe Payment Link** (`https://buy.stripe.com/...`) sans overhead de webhook complexe pour le MVP 24h.
