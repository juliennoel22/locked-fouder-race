import { Deck, NotebookItem } from "@/types/loreno";

export const DEMO_DETAILED_CONTENT = `# Fiche de Révision : Droit Constitutionnel — Séparation des Pouvoirs

## 1. Concepts Clés & Définitions
- **La Séparation des Pouvoirs** : Principe cardinal d'organisation constitutionnelle formulé par John Locke (*1690*) et systématisé par **Montesquieu** dans *De l'esprit des lois* (*1748*).
- **Finalité Politique** : Prévenir l'absolutisme et garantir les libertés individuelles. Maxime fondamentale : *"Pour qu'on ne puisse abuser du pouvoir, il faut que, par la disposition des choses, le pouvoir arrête le pouvoir."*

## 2. Architecture & Flux Institutionnel
\`\`\`diagram
┌────────────────────────────────────────────────────────┐
│             SOUVERAINETÉ NATIONALE & CITOYENS          │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
[LÉGISLATIF]           [EXÉCUTIF]           [JUDICIAIRE]
(Parlement)            (Gouvernement)       (Tribunaux)
• Édicte la loi        • Applique la loi    • Tranche les litiges
• Vote le budget       • Conduite de l'État • Contrôle légalité
       │                    │                    │
       └──────────────┬─────┴────────────────────┘
                      ▼
            [ORDRE CONSTITUTIONNEL]
\`\`\`

## 3. Tableau Comparatif des Modèles d'Application
| Critère d'Analyse | Régime Présidentiel (Stricte) | Régime Parlementaire (Souple) |
| :--- | :--- | :--- |
| **Séparation** | Étanche & spécialisation rigide | Souple avec collaboration continue |
| **Origine Exécutif** | Élection distincte & autonome | Issu de la majorité parlementaire |
| **Droit de Dissolution** | ❌ Aucun (indépendance totale) | ✅ Oui (arme de l'exécutif) |
| **Responsabilité Politique** | ❌ Nulle devant le Parlement | ✅ Oui (censure, confiance) |
| **Exemple Archétypal** | États-Unis (Constitution de 1787) | Royaume-Uni, Allemagne, Espagne |

## 4. Points Clés & Pièges d'Examen
> ⚠️ **Point critique du barème d'examen** : Ne confonds jamais séparation stricte et absence totale de relations. Aux États-Unis, le mécanisme des *Checks and Balances* (veto présidentiel, confirmation sénatoriale) organise un contre-pouvoir permanent sans responsabilité politique directe.

> 💡 **Mémoire & mnémotechnique** : Retiens la règle des 3 verbes cardinaux : **L**égiférer (Législatif), **E**xécuter (Exécutif), **J**uger (Judiciaire) — "L-E-J".

> 🎯 **Application directe & cas type** : Dans un commentaire sur l'Art. 16 de la DDHC de 1789 (*"Toute Société dans laquelle la garantie des Droits n'est pas assurée, ni la séparation des Pouvoirs déterminée, n'a point de Constitution"*), démontre que la séparation est érigée en condition d'existence même de l'État de droit.`;

export const DEMO_FLASHCARDS = [
  {
    front: "Qui est l'auteur principal ayant théorisé la séparation des pouvoirs en France ?",
    back: "Montesquieu dans son ouvrage majeur 'De l'esprit des lois' publié en 1748.",
    distractors: [
      "Jean-Jacques Rousseau dans 'Du contrat social' (1762).",
      "Alexis de Tocqueville dans 'De la démocratie en Amérique' (1835).",
      "René Cassin dans la 'Déclaration universelle des droits de l'homme' (1948).",
    ],
  },
  {
    front: "Quels sont les 3 pouvoirs traditionnellement identifiés ?",
    back: "1. Le pouvoir législatif (faire les lois)\n2. Le pouvoir exécutif (appliquer les lois)\n3. Le pouvoir judiciaire (trancher les litiges et sanctionner).",
    distractors: [
      "1. Le pouvoir exécutif\n2. Le pouvoir médiatique\n3. Le pouvoir syndical.",
      "1. Le pouvoir constitutionnel\n2. Le pouvoir préfectoral\n3. Le pouvoir communal.",
      "1. Le pouvoir régalien\n2. Le pouvoir militaire\n3. Le pouvoir monétaire.",
    ],
  },
  {
    front: "Comment se caractérise un régime à séparation STRICTE des pouvoirs ?",
    back: "Absence de moyens d'action réciproques (pas de droit de dissolution de l'exécutif, pas de motion de censure du législatif). Exemple : États-Unis.",
    distractors: [
      "Le Premier ministre peut dissoudre l'Assemblée à tout moment avec l'accord du Sénat.",
      "Le Parlement peut révoquer le Chef de l'État par un simple vote de confiance hebdomadaire.",
      "Le pouvoir judiciaire fusionne avec le Ministère de l'Intérieur pour accélérer la promulgation.",
    ],
  },
  {
    front: "Comment se caractérise un régime à séparation SOUPLE des pouvoirs ?",
    back: "Collaboration des pouvoirs avec moyens d'action réciproques (dissolution de l'Assemblée par l'exécutif, motion de censure parlementaire). Exemple : Régime parlementaire.",
    distractors: [
      "L'exécutif est nommé à vie et le Parlement ne peut se réunir qu'une fois tous les cinq ans.",
      "Le Président cumule les fonctions de Juge suprême et de Président de l'Assemblée Nationale.",
      "Interdiction stricte pour les ministres de se présenter devant les commissions parlementaires.",
    ],
  },
  {
    front: "Quelle phrase célèbre de Montesquieu résume le principe d'équilibre ?",
    back: "'Pour qu'on ne puisse abuser du pouvoir, il faut que, par la disposition des choses, le pouvoir arrête le pouvoir.'",
    distractors: [
      "'L'État, c'est moi et la souveraineté réside exclusivement dans la couronne.'",
      "'La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui.'",
      "'Tout homme qui a du pouvoir est porté à en déchoir s'il ne consulte pas le peuple.'",
    ],
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
  initial_quiz_answer:
    "La séparation stricte exclut tout moyen d'action réciproque (pas de droit de dissolution ni de motion de censure), tandis que la séparation souple repose sur une collaboration institutionnelle avec droits de dissolution et de censure.",
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
    initial_quiz_answer: DEMO_DECK.initial_quiz_answer || "",
    flashcards: DEMO_FLASHCARDS,
  },
  detailed_content: DEMO_DETAILED_CONTENT,
  progress_percent: 0,
  imageUrl: null,
  imageUrls: [],
  isDemo: true,
};
