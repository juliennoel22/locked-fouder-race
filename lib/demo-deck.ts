import { Deck, NotebookItem } from "@/types/loreno";

export const DEMO_DETAILED_CONTENT = `# Fiche de Révision : Droit Constitutionnel — Séparation des Pouvoirs

## 1. Concepts Clés & Définitions
- **La Séparation des Pouvoirs** : Principe cardinal d'organisation de l'État moderne formulé par John Locke (*Second Traité du gouvernement civil*, 1690) et formalisé de manière systématique par **Montesquieu** dans *De l'esprit des lois* (1748).
- **Finalité Politique** : Prévenir la tyrannie et préserver la liberté politique des citoyens. Selon Montesquieu : *"Pour qu'on ne puisse abuser du pouvoir, il faut que, par la disposition des choses, le pouvoir arrête le pouvoir."*

## 2. La Tripartition Traditionnelle des Fonctions
1. **Pouvoir Législatif** : Puissance d'édicter la loi générale, de voter le budget et de contrôler l'exécutif (Parlement, Assemblée Nationale, Sénat).
2. **Pouvoir Exécutif** : Mission d'appliquer les lois, de conduire la politique gouvernementale et d'administrer l'État (Chef de l'État, Premier Ministre, Gouvernement).
3. **Pouvoir Judiciaire** : Autorité juridictionnelle chargée de trancher les litiges et de veiller au respect de la légalité en sanctionnant les infractions (Juges et Tribunaux indépendants).

## 3. Les Deux Modèles d'Application
- **Séparation Stricte (Régime Présidentiel)** :
  - Spécialisation rigide des organes institutionnels avec indépendance mutuelle absolue.
  - Absence totale d'armes réciproques : pas de droit de dissolution de l'Assemblée par le Président, pas de motion de censure ni de responsabilité ministérielle du Parlement contre le Chef de l'État.
  - *Exemple archétypal* : Les États-Unis (Constitution de 1787 avec système de "Checks and Balances").
- **Séparation Souple (Régime Parlementaire)** :
  - Collaboration équilibrée et interdépendance fonctionnelle continue entre l'exécutif et le législatif.
  - Moyens d'action réciproques : le Premier ministre engage sa responsabilité devant les députés (motion de censure), tandis que l'exécutif dispose du pouvoir de dissoudre la chambre basse.
  - *Exemple historique* : Le Royaume-Uni (modèle de Westminster) ou la France sous les IIIe et IVe Républiques.

## 4. Pièges d'Examen & Subtilités Fréquentes
- **Le Mythe Montesquieu** : Montesquieu n'a en réalité jamais utilisé l'expression exacte de *"séparation des pouvoirs"*, mais évoquait une distribution et une faculté d'empêcher entre puissances.
- **La Ve République Française** : Régime hybride qualifié de *semi-présidentiel* par Maurice Duverger, doté d'un président fort élu au suffrage universel direct mais conservant les mécanismes parlementaires (dissolution article 12, censure article 49.2).`;

export const DEMO_FLASHCARDS = [
  {
    front: "Qui est l'auteur principal ayant théorisé la séparation des pouvoirs en France ?",
    back: "Montesquieu dans son ouvrage majeur 'De l'esprit des lois' publié en 1748.",
  },
  {
    front: "Quels sont les 3 pouvoirs traditionnellement identifiés ?",
    back: "1. Le pouvoir législatif (faire les lois)\n2. Le pouvoir exécutif (appliquer les lois)\n3. Le pouvoir judiciaire (trancher les litiges et sanctionner).",
  },
  {
    front: "Comment se caractérise un régime à séparation STRICTE des pouvoirs ?",
    back: "Absence de moyens d'action réciproques (pas de droit de dissolution de l'exécutif, pas de motion de censure du législatif). Exemple : États-Unis.",
  },
  {
    front: "Comment se caractérise un régime à séparation SOUPLE des pouvoirs ?",
    back: "Collaboration des pouvoirs avec moyens d'action réciproques (dissolution de l'Assemblée par l'exécutif, motion de censure parlementaire). Exemple : Régime parlementaire.",
  },
  {
    front: "Quelle phrase célèbre de Montesquieu résume le principe d'équilibre ?",
    back: "'Pour qu'on ne puisse abuser du pouvoir, il faut que, par la disposition des choses, le pouvoir arrête le pouvoir.'",
  },
];

export const DEMO_DECK: Deck = {
  id: "demo-droit-constitutionnel",
  user_id: "demo-user",
  title: "Droit Constitutionnel — Séparation des Pouvoirs",
  subject: "Droit Public",
  summary:
    "Théorie formulée par Locke et systématisée par Montesquieu dans De l'esprit des lois (1748). Elle distingue les pouvoirs législatif, exécutif et judiciaire pour éviter la tyrannie.",
  detailed_content: DEMO_DETAILED_CONTENT,
  initial_quiz_question:
    "Quelle est la différence fondamentale entre la séparation stricte des pouvoirs (régime présidentiel) et la séparation souple (régime parlementaire) ?",
  image_url: null,
  progress_percent: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  flashcards: DEMO_FLASHCARDS.map((f, i) => ({
    id: `demo-card-${i + 1}`,
    deck_id: "demo-droit-constitutionnel",
    front: f.front,
    back: f.back,
    order_index: i,
  })),
};

export const DEMO_NOTEBOOK_ITEM: NotebookItem = {
  id: DEMO_DECK.id,
  title: DEMO_DECK.title,
  subject: DEMO_DECK.subject || "Droit Public",
  emoji: "⚖️",
  date: "Cours Démo",
  sourceCount: DEMO_FLASHCARDS.length,
  deck: {
    title: DEMO_DECK.title,
    subject: DEMO_DECK.subject || "Droit Public",
    summary: DEMO_DECK.summary || "",
    detailed_content: DEMO_DETAILED_CONTENT,
    initial_quiz_question: DEMO_DECK.initial_quiz_question || "",
    flashcards: DEMO_FLASHCARDS,
  },
  detailed_content: DEMO_DETAILED_CONTENT,
  progress_percent: 0,
  imageUrl: null,
  imageUrls: [],
  isDemo: true,
};
