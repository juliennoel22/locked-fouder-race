export interface Flashcard {
  id?: string;
  deck_id?: string;
  front: string;
  back: string;
  order_index?: number;
  created_at?: string;
}

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  subject?: string | null;
  summary?: string | null;
  initial_quiz_question?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  flashcards?: Flashcard[];
}

export interface ScanResult {
  title: string;
  subject: string;
  summary: string;
  initial_quiz_question: string;
  flashcards: Array<{
    front: string;
    back: string;
  }>;
}

export interface ScanApiResponse {
  success: boolean;
  deckId?: string;
  data?: ScanResult;
  imageUrl?: string;
  error?: string;
}
