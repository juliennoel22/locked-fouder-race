import { Flashcard } from "@/types/loreno";

export type ReviewItemType =
  | "concept"
  | "flashcard"
  | "quiz"
  | "chest"
  | "free_text"
  | "exam_trap";

export interface ReviewQueueItem {
  id: string;
  type: ReviewItemType;
  front: string;
  back: string;
  distractors?: string[];
  isRetry?: boolean;
}

export interface AdaptativeReviewPlayerProps {
  deckId: string;
  deckTitle: string;
  subject?: string | null;
  flashcards: Flashcard[];
  initialQuizQuestion?: string | null;
  initialQuizAnswer?: string | null;
  stepNumber?: number;
  onFinish?: () => void;
}
