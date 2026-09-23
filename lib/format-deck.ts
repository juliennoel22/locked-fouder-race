import { NotebookItem, ScanResult } from "@/types/loreno";

export interface RawDeckData {
  id: string;
  title: string;
  subject?: string | null;
  summary?: string | null;
  detailed_content?: string | null;
  initial_quiz_question?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  progress_percent?: number | null;
  created_at?: string;
  flashcards?: Array<{ front: string; back: string; order_index?: number }>;
}

export function formatDeckItem(deck: RawDeckData): NotebookItem {
  const sortedCards = (deck.flashcards || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const scanData: ScanResult = {
    title: deck.title,
    subject: deck.subject || "Général",
    summary: deck.summary || "",
    detailed_content: deck.detailed_content || "",
    initial_quiz_question: deck.initial_quiz_question || "",
    flashcards: sortedCards.map((f) => ({ front: f.front, back: f.back })),
  };
  const createdDate = deck.created_at
    ? new Date(deck.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    : "Récemment";

  const allUrls = deck.image_urls && deck.image_urls.length > 0
    ? deck.image_urls
    : deck.image_url
    ? [deck.image_url]
    : [];

  return {
    id: deck.id,
    title: deck.title,
    subject: deck.subject || "Général",
    emoji: "📝",
    date: createdDate,
    sourceCount: sortedCards.length || 5,
    deck: scanData,
    detailed_content: deck.detailed_content || null,
    progress_percent: typeof deck.progress_percent === "number" ? deck.progress_percent : 0,
    imageUrl: deck.image_url || (allUrls.length > 0 ? allUrls[0] : null),
    imageUrls: allUrls,
  };
}
