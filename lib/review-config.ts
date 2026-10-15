import { ReviewItemType } from "@/components/review/review-types";

export type ReviewInterleavingMode = "flash" | "balanced" | "deep";

export interface ReviewStepDefinition {
  stepNumber: number;
  id: string;
  type: ReviewItemType;
  title: string;
  subtitle: string;
  targetPercent: number;
  position: "left" | "center" | "right";
  objectiveText: string;
}

export interface AiVolumeTier {
  maxWords: number;
  targetMinCards: number;
  targetMaxCards: number;
  recommendedCount: number;
}

/**
 * Tiers de volumétrie proportionnelle selon la taille réelle du cours scanné.
 * - Court (< 600 mots) : 6-8 cartes cibles (7 en moyenne)
 * - Moyen (600 - 1500 mots) : 10-12 cartes cibles (11 en moyenne)
 * - Long / Multi-pages (> 1500 mots, ex: 11 pages) : 16-18 cartes cibles (16 en moyenne)
 */
export const AI_VOLUME_TIERS: AiVolumeTier[] = [
  { maxWords: 600, targetMinCards: 6, targetMaxCards: 8, recommendedCount: 7 },
  { maxWords: 1500, targetMinCards: 10, targetMaxCards: 12, recommendedCount: 11 },
  { maxWords: Infinity, targetMinCards: 16, targetMaxCards: 18, recommendedCount: 16 },
];

export function getAiVolumeTarget(text: string): { targetCount: number; minCards: number; maxCards: number } {
  const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const tier = AI_VOLUME_TIERS.find((t) => words <= t.maxWords) || AI_VOLUME_TIERS[AI_VOLUME_TIERS.length - 1];
  return { targetCount: tier.recommendedCount, minCards: tier.targetMinCards, maxCards: tier.targetMaxCards };
}

export function resolveInterleavingMode(rawMode?: string | null): ReviewInterleavingMode {
  if (rawMode === "flash" || rawMode === "balanced" || rawMode === "deep") {
    return rawMode;
  }
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("loreno_review_mode");
    if (saved === "flash" || saved === "balanced" || saved === "deep") {
      return saved;
    }
  }
  return "flash";
}

/**
 * SOURCE UNIQUE DE VÉRITÉ : Configuration déclarative du gameplay en formule panachée progressive (Interleaving).
 * Chaque palier mixe intelligemment plusieurs formats pour maximiser la rétention cognitive selon Duolingo/Gizmo.
 */
export const REVIEW_STEPS_CONFIG: ReviewStepDefinition[] = [
  {
    stepNumber: 1,
    id: "step-1",
    type: "concept",
    title: "Amorçage Notions",
    subtitle: "Lecture & Flashcards 3D",
    targetPercent: 17,
    position: "left",
    objectiveText: "Découvre les concepts fondamentaux et ancre tes premiers réflexes 3D.",
  },
  {
    stepNumber: 2,
    id: "step-2",
    type: "flashcard",
    title: "Consolidation",
    subtitle: "Flashcards & QCM Express",
    targetPercent: 33,
    position: "right",
    objectiveText: "Renforce ta mémoire avec des cartes 3D et des QCMs de discrimination.",
  },
  {
    stepNumber: 3,
    id: "step-3",
    type: "quiz",
    title: "Challenge Notions",
    subtitle: "Quiz & Premier Rappel",
    targetPercent: 50,
    position: "center",
    objectiveText: "Défie les distracteurs pièges et teste ton premier rappel libre.",
  },
  {
    stepNumber: 4,
    id: "step-4",
    type: "chest",
    title: "Coffre Trésor",
    subtitle: "Bonus Rétention (+50 XP)",
    targetPercent: 67,
    position: "left",
    objectiveText: "Coffre bonus ! Valide cette étape pour débloquer ton boost de rétention mi-parcours.",
  },
  {
    stepNumber: 5,
    id: "step-5",
    type: "free_text",
    title: "Rappel Actif",
    subtitle: "Saisie Libre sans filet",
    targetPercent: 83,
    position: "right",
    objectiveText: "Entraînement de rappel actif exigeant : écris tes réponses sans indice.",
  },
  {
    stepNumber: 6,
    id: "step-6",
    type: "exam_trap",
    title: "Épreuve Finale",
    subtitle: "Question Piège & Verdict",
    targetPercent: 100,
    position: "center",
    objectiveText: "Affronte la question piège du professeur pour décrocher la mention d'examen !",
  },
];

export function getStepConfig(step: number): ReviewStepDefinition {
  const safeStep = Math.max(1, Math.min(REVIEW_STEPS_CONFIG.length, step));
  return REVIEW_STEPS_CONFIG[safeStep - 1] || REVIEW_STEPS_CONFIG[0];
}
