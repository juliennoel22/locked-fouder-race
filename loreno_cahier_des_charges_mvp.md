# 📋 Loreno.app — Cahier des Charges & Master Prompt Ingénierie (MVP 10/10)

> **Document d'Ingénierie à transmettre à l'agent de code dans WSL**  
> *Projet* : `Loreno` (`\\wsl.localhost\Ubuntu\home\julien\git\locked-fouder-race`)  
> *Objectif* : Refonte du Cœur Produit (Fiches développées d'emblée, Dashboard bibliothèque, Parcours de révision Duolingo adaptatif et fixs UX/PRO).

---

## 🎯 1. Vue d'Ensemble & Directives d'Architecture

- **Mobile-First Lock** : Shell smartphone centré (`max-w-md mx-auto`), hauteur `100dvh`, anti-zoom iOS (inputs 16px min).
- **Framework & Infra** : Next.js 16 (App Router), Supabase (Auth, DB, Storage `course-scans`), Gemini 3.6 Flash (`@google/genai`), Stripe (`acct_1UEmR2AqwJcN83vt`).
- **Garantie Résilience** : Zéro crash sur rate-limit API ou coupure réseau (fallbacks gracieux systématiques).

---

## 🏁 Checkpoint 1 : BDD & Fiches de Cours Développées D'emblée

### 1.1 SQL Migration (Supabase)
Exécuter la migration suivante dans la console Supabase ou via CLI :

```sql
-- Migration : Ajout des fiches développées et de la progression
ALTER TABLE public.decks 
ADD COLUMN IF NOT EXISTS detailed_content TEXT,
ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;
```

### 1.2 TypeScript Types (`types/loreno.ts`)
Mettre à jour les interfaces :

```typescript
export interface ScanResult {
  title: string;
  subject: string;
  summary: string;
  detailed_content: string; // Fiche de cours complète en Markdown
  initial_quiz_question: string;
  flashcards: Array<{ front: string; back: string }>;
}

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  subject?: string;
  summary?: string;
  detailed_content?: string;
  initial_quiz_question?: string;
  image_url?: string;
  progress_percent?: number;
  created_at: string;
  updated_at: string;
}
```

### 1.3 Update Prompt & Handler API `/api/scan/route.ts`
Mettre à jour le `SYSTEM_PROMPT` dans `app/api/scan/route.ts` pour imposer la clé `detailed_content` :

```typescript
const SYSTEM_PROMPT = `Tu es le moteur OCR et d'analyse pédagogique d'élite de Loreno (https://www.loreno.app).
Tu reçois une photo de notes de cours (manuscrites, polycopié, tableau, schéma).
Ta mission est d'extraire l'essence du cours et de rédiger une FICHE DE RÉVISION COMPLÈTE.

Génère une réponse STRICTEMENT en format JSON avec cette structure exacte :
{
  "title": "Titre clair et concis du chapitre ou du cours",
  "subject": "Matière (ex: Droit, Médecine, Physique, Histoire, Économie)",
  "summary": "Synthèse percutante en 2 à 3 phrases clés",
  "detailed_content": "# Fiche de Révision : [Titre]\n\n## 1. Concepts Clés & Définitions\n...",
  "initial_quiz_question": "La question piège d'examen la plus probable",
  "flashcards": [
    { "front": "Question ou concept clé", "back": "Réponse synthétique" }
  ]
}

Règles pour "detailed_content" :
- Rédige une vraie fiche de cours exhaustive et structurée en Markdown.
- Inclus des sous-titres (##), des définitions en gras, des listes à puces et des exemples d'examen.
- Entre 5 et 8 flashcards percutantes maximum.`;
```

---

## 🏁 Checkpoint 2 : Dashboard Bibliothèque (Option A) & Cours Démo

### 2.1 Refonte `app/dashboard/page.tsx`
- Interface avec header "Mes Cours" et filtre par matière.
- Barre de recherche (`input`) avec filtrage en temps réel sur le titre et la matière.
- **Bouton principal "+ Scanner un cours"** redirigeant vers `/quiz` (écran d'upload).
- **Injection du Cours Démo** : Si `decks.length === 0`, injecter en affichage le deck de démonstration pré-chargé (*Droit Constitutionnel — Séparation des pouvoirs*) avec sa fiche détaillée et ses 5 flashcards.

### 2.2 Fix Duplication de Cours
- Dans le composant d'upload (`CameraUpload.tsx` / `app/quiz/page.tsx`), désactiver le bouton Submit dès le premier clic (`isSubmittingRef.current = true`) pour empêcher la création en double.

---

## 🏁 Checkpoint 3 : Parcours de Révision Adaptatif Gamifié (Style Duolingo)

### 3.1 Vue du Cours & Bouton Unique "Réviser"
Sur la page du cours (`app/deck/[id]/page.tsx`) :
- Afficher la **Fiche de Révision Complète** (`detailed_content`) au format Markdown propre (`react-markdown` ou prose Tailwind).
- Bouton CTA principal : **"Lancer la Révision Gamifiée"** (redirige vers `/review/[id]`).

### 3.2 Composant Parcours Adaptatif (`components/AdaptativeReviewPlayer.tsx`)
- Parcours séquentiel de révision (Étape 1: Flashcards $\rightarrow$ Étape 2: Quiz Notion 1 $\rightarrow$ Étape 3: Question Piège).
- **Gestion des Fautes (Option A)** :
  - En cas de mauvaise réponse : Affichage immédiat d'une pop-up pédagogique expliquant l'erreur.
  - La notion ratée est automatiquement **ré-injectée en fin de parcours** pour validation obligatoire.
- Écran de fin : Calcul du pourcentage de maîtrise, confettis de victoire, et sauvegarde du `progress_percent` dans la table `decks` Supabase.

---

## 🏁 Checkpoint 4 : Polish UX & Pastille PRO

### 4.1 Pastille PRO & Persistance (`components/Header.tsx`)
- Vérifier `user?.user_metadata?.is_pro || localStorage.getItem("loreno_pro") === "true"`.
- Si Pro active :
  - Afficher un badge doré `PRO` permanent en haut à droite.
  - Masquer tous les modals de paywall et débloquer le Tuteur IA sans limite.

### 4.2 Modal d'Avis (Feedback Modal)
- Ajouter un écouteur sur le clic arrière (`backdrop-click`) pour fermer la modal.
- Si le champ de texte est rempli (`feedbackText.length > 0`), afficher une popup de confirmation avant de fermer.

---

## 🤖 MASTER PROMPT (À copier-coller à ton agent de code dans WSL)

```markdown
# MISSION : Implémentation du Cœur Produit MVP de Loreno.app

Tu dois appliquer le cahier des charges ci-dessous dans le dépôt Loreno.app (`\\wsl.localhost\Ubuntu\home\julien\git\locked-fouder-race`).

---

### PROMPT INSTRUCTIONS D'EXÉCUTION PAS À PAS :

1. **CHECKPOINT 1 : Schema Supabase & API Scan**
   - Ajoute la colonne `detailed_content TEXT` et `progress_percent INTEGER DEFAULT 0` dans la table `decks`.
   - Mets à jour `types/loreno.ts` pour inclure `detailed_content` et `progress_percent`.
   - Modifie `app/api/scan/route.ts` pour demander à Gemini 3.6 Flash une fiche de révision complète en Markdown (`detailed_content`) d'emblée.
   - Mets à jour `MOCK_SCAN_RESULT` avec du contenu Markdown riche pour les fallbacks.
   - Enregistre `detailed_content` lors de l'insert dans la table `decks`.

2. **CHECKPOINT 2 : Dashboard Bibliothèque (Option A) & Cours Démo**
   - Refais `app/dashboard/page.tsx` pour afficher la bibliothèque de cours de l'étudiant avec barre de recherche et filtres.
   - Si l'utilisateur n'a pas encore de cours, affiche le cours de démonstration pré-chargé ("Droit Constitutionnel — Séparation des Pouvoirs").
   - Bloque la soumission multiple dans l'upload pour éliminer les doublons de cours.

3. **CHECKPOINT 3 : Parcours de Révision Adaptatif Gamifié (Duolingo Style)**
   - Sur la page du cours, affiche la fiche complète Markdown et un bouton unique "Lancer la Révision Gamifiée".
   - Crée le composant `components/AdaptativeReviewPlayer.tsx` avec un parcours étape par étape.
   - Applique l'Option A sur les fautes : explication immédiate et ré-injection de la notion ratée à la fin du parcours.
   - À la fin de la session, calcule le % de complétion et sauvegarde-le en BDD.

4. **CHECKPOINT 4 : Pastille PRO & Modal d'Avis**
   - Assure la visibilité permanente du badge PRO en haut à droite si `is_pro` est vrai.
   - Ferme la modal d'avis au clic extérieur avec message de confirmation si du texte a été commencé.

5. **VERIFICATION**
   - Lance `npm run build` et vérifie qu'il n'y a aucune erreur TypeScript.
```
