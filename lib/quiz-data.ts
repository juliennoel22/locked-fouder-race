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
  summary:
    "Théorie formulée par Locke et systématisée par Montesquieu dans De l'esprit des lois (1748). Elle distingue les pouvoirs législatif, exécutif et judiciaire pour éviter la tyrannie.",
  detailed_content: `# Fiche de Révision : Droit Constitutionnel — Séparation des Pouvoirs\n\n## 1. Concepts Clés & Définitions\n- **Séparation des Pouvoirs** : Principe forgé par Locke et formalisé par Montesquieu (*De l'esprit des lois*, 1748).\n- **Finalité** : Prévenir la tyrannie : *"le pouvoir arrête le pouvoir"*.\n\n## 2. Tripartition des Pouvoirs\n1. **Législatif** : voter la loi et le budget.\n2. **Exécutif** : appliquer les lois et diriger l'administration.\n3. **Judiciaire** : trancher les litiges et sanctionner les infractions.\n\n## 3. Régimes Présidentiel vs Parlementaire\n- **Séparation stricte** : Indépendance absolue sans armes réciproques (Ex : USA).\n- **Séparation souple** : Collaboration avec armes réciproques (dissolution / motion de censure).`,
  initial_quiz_question:
    "Quelle est la différence fondamentale entre la séparation stricte des pouvoirs (régime présidentiel) et la séparation souple (régime parlementaire) ?",
  flashcards: [
    {
      front: "Qui a théorisé la séparation des pouvoirs en France ?",
      back: "Montesquieu dans De l'esprit des lois (1748).",
    },
    {
      front: "Quels sont les 3 pouvoirs traditionnels ?",
      back: "Législatif (faire la loi), Exécutif (appliquer la loi), Judiciaire (sanctionner).",
    },
    {
      front: "Comment se caractérise une séparation stricte des pouvoirs ?",
      back: "Absence de moyens d'action réciproques (aucun droit de dissolution ni de motion de censure). Exemple : États-Unis.",
    },
    {
      front: "Comment se caractérise une séparation souple des pouvoirs ?",
      back: "Collaboration et moyens de pression réciproques (dissolution de l'Assemblée vs responsabilité ministérielle).",
    },
    {
      front: "Quelle maxime de Montesquieu résume le contrôle réciproque ?",
      back: "'Pour qu'on ne puisse abuser du pouvoir, il faut que, par la disposition des choses, le pouvoir arrête le pouvoir.'",
    },
  ],
};

