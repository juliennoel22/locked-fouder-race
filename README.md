# SnapStudy ⚡ — Hackathon FounderRace 2026

> **Prends en photo tes notes de cours (même illisibles) : obtiens tes fiches de révision interactives en 3 secondes et un prof IA qui te fait passer ton partiel blanc.**

Projet développé par **Julien Noel** dans le cadre du **Hackathon FounderRace 2026** (12 au 13 Septembre 2026 — Sprint 24h).  
Thème officiel : **PRODUCTIVITÉ**.

---

## 📜 Conformité aux Règles du Jury
- **Template Public Utilisé** : Ce projet est initialisé à partir du starter public officiel [`with-supabase`](https://github.com/vercel/next.js/tree/canary/examples/with-supabase) de Vercel / Next.js.
- **Dépôt Public** : Le code source est intégralement public.
- **Vérification Revenus** : Clé API Stripe en lecture seule (Read-Only) fournie au jury pour validation du CA en direct.
- **Démo** : Vidéo pitch et démonstration fonctionnelle du produit.

---

## 🚀 Fonctionnalités Clés
1. **Scan Intelligent Multimodal** : Alimenté par **Gemini 1.5 Flash Vision**, capable de déchiffrer des notes manuscrites, des schémas et des polycopiés complexes.
2. **Decks de Flashcards 3D** :
   - Cartes avec retournement 3D fluide.
   - Système de révision active ("Je sais" / "À revoir").
   - Export instantané compatible Anki & Quizlet.
3. **Tuteur d'Examen IA** : Un chatbot qui commence immédiatement par te tester sur la question piège la plus probable du cours scanné.
4. **Pass Partiels Fondateur (9,99 €)** : Accès illimité aux scans et aux simulations de partiels.

---

## 🛠️ Stack Technique
- **Framework** : Next.js App Router (TypeScript)
- **Base de Données & Authentification** : Supabase
- **Intelligence Artificielle** : Google Gemini 1.5 Flash Vision & Chat
- **Styles** : Tailwind CSS, Lucide Icons, Canvas Confetti
- **Paiements** : Stripe Payment Links

---

## 📦 Installation & Démarrage Local

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Renseigner GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Lancer le serveur de développement
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) pour tester l'application.