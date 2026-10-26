import { NotebookItem, ScanResult } from "@/types/loreno";
import { unpackDeck } from "@/lib/db-compat";

export interface RawDeckData {
  id: string;
  title: string;
  subject?: string | null;
  summary?: string | null;
  detailed_content?: string | null;
  initial_quiz_question?: string | null;
  initial_quiz_answer?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  progress_percent?: number | null;
  created_at?: string;
  flashcards?: Array<{
    front: string;
    back: string;
    distractors?: string[];
    order_index?: number;
  }>;
}

export function formatDeckItem(rawDeck: RawDeckData): NotebookItem {
  const deck = unpackDeck(rawDeck);
  const sortedCards = deck.flashcards || [];

  const scanData: ScanResult = {
    title: deck.title,
    subject: deck.subject || "Général",
    summary: deck.summary || "",
    detailed_content: deck.detailed_content || "",
    initial_quiz_question: deck.initial_quiz_question || "",
    initial_quiz_answer: deck.initial_quiz_answer || undefined,
    flashcards: sortedCards.map((f) => ({
      front: f.front,
      back: f.back,
      distractors: f.distractors,
    })),
  };

  const createdDate = deck.created_at
    ? new Date(deck.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    : "Récemment";

  const validImageUrl =
    deck.image_url && !deck.image_url.startsWith("blob:") ? deck.image_url : null;

  const allUrls = (
    deck.image_urls && deck.image_urls.length > 0
      ? deck.image_urls
      : validImageUrl
      ? [validImageUrl]
      : []
  ).filter((u) => Boolean(u) && !u.startsWith("blob:"));

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
    imageUrl: validImageUrl || (allUrls.length > 0 ? allUrls[0] : null),
    imageUrls: allUrls,
  };
}
