import { NotebookItem, ScanResult } from "@/types/loreno";

export interface RawDeckData {
  id: string;
  title: string;
  subject?: string | null;
  summary?: string | null;
  initial_quiz_question?: string | null;
  image_url?: string | null;
  created_at?: string;
  flashcards?: Array<{ front: string; back: string; order_index?: number }>;
}

export function formatDeckItem(deck: RawDeckData): NotebookItem {
  const sortedCards = (deck.flashcards || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const scanData: ScanResult = {
    title: deck.title,
    subject: deck.subject || "Général",
    summary: deck.summary || "",
    initial_quiz_question: deck.initial_quiz_question || "",
    flashcards: sortedCards.map((f) => ({ front: f.front, back: f.back })),
  };
  const createdDate = deck.created_at
    ? new Date(deck.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    : "Récemment";

  return {
    id: deck.id,
    title: deck.title,
    subject: deck.subject || "Général",
    emoji: "📝",
    date: createdDate,
    sourceCount: sortedCards.length || 5,
    deck: scanData,
    imageUrl: deck.image_url,
  };
}
