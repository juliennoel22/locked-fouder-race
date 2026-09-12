export interface QuizOption {
  id: string;
  label: string;
}

export const LEVEL_OPTIONS: QuizOption[] = [
  { id: "college", label: "Collège" },
  { id: "lycee", label: "Lycée (Seconde, Première, Terminale)" },
  { id: "universite", label: "Université / Fac / BUT / BTS" },
  { id: "prepa", label: "Prépa / Grandes Écoles" },
  { id: "autre", label: "Autre formation" },
];

export const GOAL_OPTIONS: QuizOption[] = [
  { id: "urgent", label: "🧨 J'ai un examen / partiel imminent (urgence)" },
  { id: "grades", label: "📈 Augmenter mes notes sans y passer mes nuits" },
  { id: "retention", label: "🧠 Retenir mes cours sans tout oublier" },
  { id: "procrastination", label: "⏱️ Vaincre la flemme et la procrastination" },
];

export const PAIN_OPTIONS: QuizOption[] = [
  { id: "time", label: "⏳ Manque de temps pour tout ficher" },
  { id: "methods", label: "🤯 Trop d'informations à trier et synthétiser" },
  { id: "discipline", label: "📱 Distractions et perte de focus" },
  { id: "stress", label: "😰 Stress de la page blanche avant l'épreuve" },
];

export const DEFAULT_SCAN_RESULT = {
  title: "Droit Constitutionnel — Séparation des Pouvoirs",
  subject: "Droit Public",
  summary: "Synthèse sur les principes de séparation des pouvoirs de Montesquieu.",
  initial_quiz_question: "Quelle est la différence fondamentale entre régime présidentiel et parlementaire ?",
  flashcards: [
    {
      front: "Qui a théorisé la séparation des pouvoirs ?",
      back: "Montesquieu dans De l'esprit des lois (1748).",
    },
    {
      front: "Quels sont les 3 pouvoirs traditionnels ?",
      back: "Législatif, Exécutif et Judiciaire.",
    },
  ],
};
