import { NotebookItem } from "@/types/loreno";

export const INITIAL_NOTEBOOKS: NotebookItem[] = [
  {
    id: "droit-const",
    title: "Droit Constitutionnel — Séparation des Pouvoirs",
    subject: "Droit Public",
    emoji: "⚖️",
    date: "Il y a 2 heures",
    sourceCount: 5,
    deck: {
      title: "Droit Constitutionnel — Séparation des Pouvoirs",
      subject: "Droit Public",
      summary:
        "Théorie formulée par Locke et Montesquieu (1748) séparant les pouvoirs législatif, exécutif et judiciaire pour prévenir la tyrannie.",
      initial_quiz_question:
        "Quelle est la différence fondamentale entre la séparation stricte et la séparation souple des pouvoirs ?",
      flashcards: [
        {
          front: "Qui a théorisé la séparation des pouvoirs en France ?",
          back: "Montesquieu dans 'De l'esprit des lois' (1748).",
        },
        {
          front: "Quels sont les 3 pouvoirs traditionnellement identifiés ?",
          back: "Législatif (faire la loi), Exécutif (l'appliquer), Judiciaire (la sanctionner).",
        },
        {
          front: "Comment se caractérise un régime présidentiel strict ?",
          back: "Absence de moyens d'action réciproques (pas de dissolution, pas de censure).",
        },
        {
          front: "Comment se caractérise un régime parlementaire souple ?",
          back: "Collaboration des pouvoirs avec droit de dissolution et motion de censure.",
        },
        {
          front: "Quelle phrase célèbre résume cette théorie ?",
          back: "'Pour qu'on ne puisse abuser du pouvoir, il faut que le pouvoir arrête le pouvoir.'",
        },
      ],
    },
  },
  {
    id: "physio-cardio",
    title: "Physiologie & Pression Artérielle",
    subject: "Médecine / PASS",
    emoji: "🩺",
    date: "Hier",
    sourceCount: 8,
    deck: {
      title: "Physiologie & Pression Artérielle",
      subject: "Médecine / PASS",
      summary:
        "Régulation de la pression artérielle par les barorécepteurs, le système rénine-angiotensine-aldostérone et le débit cardiaque.",
      initial_quiz_question: "Quel récepteur carotidien détecte les variations brutales de pression artérielle ?",
      flashcards: [
        {
          front: "Quelle est la formule fondamentale de la pression artérielle ?",
          back: "PA = Débit Cardiaque (DC) × Résistances Vasculaires Périphériques (RVP).",
        },
        {
          front: "Quel organe sécrète la rénine ?",
          back: "L'appareil juxtaglomérulaire du rein en réponse à l'hypotension.",
        },
        {
          front: "Quel est l'effet de l'angiotensine II ?",
          back: "Puissante vasoconstriction artériolaire et stimulation de l'aldostérone.",
        },
      ],
    },
  },
  {
    id: "bio-photo",
    title: "Biologie Cellulaire : La Photosynthèse",
    subject: "Sciences de la Vie",
    emoji: "🔬",
    date: "Il y a 3 jours",
    sourceCount: 6,
    deck: {
      title: "Biologie Cellulaire : La Photosynthèse",
      subject: "Sciences de la Vie",
      summary:
        "Conversion de l'énergie photonique en glucides via la phase photochimique (thylakoïdes) et le cycle de Calvin (stroma).",
      initial_quiz_question: "Dans quel compartiment chloroplastique se déroule la phase sombre (cycle de Calvin) ?",
      flashcards: [
        {
          front: "Quel est le donneur primaire d'électrons dans la photosynthèse oxygénique ?",
          back: "La molécule d'eau (H2O), dont la photolyse libère du dioxygène (O2).",
        },
        {
          front: "Dans quel compartiment se déroule le cycle de Calvin ?",
          back: "Dans le stroma des chloroplastes.",
        },
      ],
    },
  },
  {
    id: "macro-islm",
    title: "Macroéconomie : Le Modèle IS-LM",
    subject: "Économie & Gestion",
    emoji: "📊",
    date: "Il y a 5 jours",
    sourceCount: 7,
    deck: {
      title: "Macroéconomie : Le Modèle IS-LM",
      subject: "Économie & Gestion",
      summary:
        "Équilibre simultané sur le marché des biens et services (IS) et le marché de la monnaie (LM) formalisé par Hicks et Hansen.",
      initial_quiz_question: "Quel est l'effet d'une politique monétaire expansionniste sur la courbe LM ?",
      flashcards: [
        {
          front: "Que représente la courbe IS ?",
          back: "L'équilibre sur le marché des biens et services (Investissement = Épargne).",
        },
        {
          front: "Quel effet a une hausse de la dépense publique (G) sur IS ?",
          back: "Déplacement de la courbe IS vers la droite d'un facteur égal au multiplicateur keynésien.",
        },
      ],
    },
  },
];
