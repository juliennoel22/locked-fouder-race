# 📄 Loreno.app — Procès-Verbal & Synthèse Stratégique (Appel Fathom du 16 Septembre)

> **Document de Référence Produit & Roadmap**  
> *Participants* : Julien Noel & Baptiste  
> *Objet* : Analyse des retours utilisateurs, Benchmark Astra AI, Correction des bugs et Stratégie d'Acquisition Virale.

---

## 🎯 1. Directives Clés & Vision Produit

1. **Benchmark de Qualité : Astra AI ($25M ARR)**
   - L'expérience de révision doit égaler la fluidité et la qualité d'Astra AI : transformer les notes de cours en un parcours de révision complet, beau et sans friction.
   - **Flux Utilisateur Cible** : Ingestion notes $\rightarrow$ Fiche de cours complète Markdown $\rightarrow$ Entraînement adaptatif gamifié Duolingo Style (Quiz, Flashcards, Re-injection des erreurs).

2. **Simplicité & Modularité (80/20)**
   - Ne pas surcharger l'app de 40 fonctionnalités complexes inutilisées.
   - Faire une fonctionnalité maître (le parcours de révision adaptatif) qui fonctionne à la perfection.

---

## 🚀 2. Spécifications du Système d'Affiliation Virale ("Give & Get" + Solde Cash)

Inspiré du modèle Minestrator Affiliation (https://minestrator.com/affiliation) :

### Mécanique A : Virale "Give & Get" (Accès Pro Offert)
- Chaque utilisateur possède un **code d'affiliation unique** (ex: `JULIEN-8821`) et un **lien de parrainage** (`https://loreno.app?ref=JULIEN-8821`).
- **Condition** : Si 5 amis s'inscrivent via son lien personnel, le parrain et les filleuls débloquent **3 jours d'accès Premium Pro offerts**.

### Mécanique B : Commission Cash & Solde Cumulable
- **Commission** : Lorsqu'un filleul achète le Pack Premium (9,99 €) avec le code du parrain :
  - Le parrain accumule une commission de **20% (2,00 €)** dans son **Solde Affilié**.
  - Le filleul bénéficie d'une réduction immédiate (ex: 10% de réduction ou 3 jours offerts).
- **Utilisation du Solde** :
  - **Option 1 (In-App)** : Utiliser le solde accumulé pour débloquer l'abonnement Premium directement.
  - **Option 2 (Virement Bancaire)** : Demander un retrait par virement bancaire (IBAN) dès que le solde atteint le seuil minimum de **70,00 €**.

---

## 🛠️ 3. Audit des Retours Utilisateurs & Bugs Traités

### Bugs & Correctifs Validés (MVP)
- [x] **Connexion Sécurisée** : Passage au Magic Link / Code OTP à 6 chiffres.
- [x] **Verification Stripe Côté Serveur** : Securisation des accès via Webhook Stripe.
- [x] **Rate Limiting IA** : Protection Gemini API contre la sur-utilisation.
- [x] **Suppression des Doublons** : Ingestion directe avec réutilisation de `json.deckId`.
- [x] **Fiches Synthétiques Développées** : Fiches Markdown complètes (`detailed_content`) générées d'emblée au scan (< 2s).
- [x] **Cartes 3D 1-Tap** : Animation flip 3D instantanée tactile sans effet miroir.
- [x] **Decouplage Scan vs Jeu JIT** : Scan instantané $\rightarrow$ Fiche de cours $\rightarrow$ Rituel de préparation Duolingo au 1er entraînement.

### Backlog V2 (À Venir)
- [ ] **Système d'Affiliation Virale** (Give & Get + Solde 70€ virement).
- [ ] **Streaks & Relances Notifications/Mail**.
- [ ] **Onboarding Date d'Épreuve** pour calibrer l'intensité du tuteur.
- [ ] **Mode Audio / Podcast de cours (TTS)**.
- [ ] **Mode Focus App Blocker (Opal style)**.
