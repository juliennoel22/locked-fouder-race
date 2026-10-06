import { Flashcard } from "@/types/loreno";

export type ReviewItemType = "flashcard" | "quiz" | "exam_trap";

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
  onFinish?: () => void;
}
