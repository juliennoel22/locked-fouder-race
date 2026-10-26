/**
 * Transparent DB Compatibility Codec (TECH-029 / BUG-027)
 * Packs and unpacks extended fields into base columns when PGRST204 occurs,
 * and transparently unpacks them on read so no delimiter ever leaks to the UI.
 */

const DETAILED_DELIM = "\n\n<!--LORENO_DETAILED-->\n";
const PROGRESS_REGEX = /\n<!--LORENO_PROGRESS:(\d+)-->$/;
const QUIZ_ANS_DELIM = "\n\n<!--LORENO_QUIZ_ANS-->\n";
const DISTRACTORS_DELIM = "\n\n<!--LORENO_DISTRACTORS-->\n";

export interface CompatCardLike {
  id?: string; deck_id?: string; front: string; back: string;
  distractors?: string[]; order_index?: number; created_at?: string;
}

export interface CompatDeckLike {
  id: string; user_id?: string; title: string; subject?: string | null;
  summary?: string | null; detailed_content?: string | null;
  initial_quiz_question?: string | null; initial_quiz_answer?: string | null;
  image_url?: string | null; image_urls?: string[] | null;
  progress_percent?: number | null; created_at?: string; updated_at?: string;
  flashcards?: CompatCardLike[];
}

export function unpackSummaryFields(
  rawSummary?: string | null,
  rawDetailed?: string | null,
  rawProgress?: number | null
): { summary: string; detailed_content: string | null; progress_percent: number } {
  let working = rawSummary || "";
  let extractedProgress: number | null = null;
  const progMatch = working.match(PROGRESS_REGEX);
  if (progMatch) {
    extractedProgress = parseInt(progMatch[1], 10);
    working = working.replace(PROGRESS_REGEX, "");
  }
  const parts = working.split(DETAILED_DELIM);
  const cleanSummary = (parts[0] || "").trim();
  const packedDetailed = parts.length > 1 ? parts.slice(1).join(DETAILED_DELIM).trim() : null;
  const detailed_content = rawDetailed?.trim() || packedDetailed || null;
  const progress_percent =
    typeof rawProgress === "number" && rawProgress > 0
      ? rawProgress
      : extractedProgress ?? (typeof rawProgress === "number" ? rawProgress : 0);
  return { summary: cleanSummary, detailed_content, progress_percent };
}

export function packSummaryFields(
  summary?: string | null,
  detailedContent?: string | null,
  progressPercent?: number | null
): string | null {
  const unpacked = unpackSummaryFields(summary, undefined, undefined);
  const finalDetailed = detailedContent !== undefined ? detailedContent : unpacked.detailed_content;
  const finalProgress = typeof progressPercent === "number" ? progressPercent : unpacked.progress_percent;
  let result = unpacked.summary;
  if (finalDetailed && finalDetailed.trim()) result = `${result}${DETAILED_DELIM}${finalDetailed.trim()}`;
  if (typeof finalProgress === "number" && finalProgress > 0) {
    result = `${result}\n<!--LORENO_PROGRESS:${Math.max(0, Math.min(100, Math.round(finalProgress)))}-->`;
  }
  return result || null;
}

export function unpackQuizFields(
  rawQuestion?: string | null,
  rawAnswer?: string | null
): { initial_quiz_question: string | null; initial_quiz_answer: string | null } {
  const parts = (rawQuestion || "").split(QUIZ_ANS_DELIM);
  const cleanQuestion = (parts[0] || "").trim() || null;
  const packedAnswer = parts.length > 1 ? parts.slice(1).join(QUIZ_ANS_DELIM).trim() : null;
  return { initial_quiz_question: cleanQuestion, initial_quiz_answer: rawAnswer?.trim() || packedAnswer || null };
}

export function packQuizFields(question?: string | null, answer?: string | null): string | null {
  const unpacked = unpackQuizFields(question, undefined);
  const finalQuestion = unpacked.initial_quiz_question || "";
  const finalAnswer = answer !== undefined ? answer : unpacked.initial_quiz_answer;
  if (!finalQuestion) return null;
  return finalAnswer?.trim() ? `${finalQuestion}${QUIZ_ANS_DELIM}${finalAnswer.trim()}` : finalQuestion;
}

export function packFlashcardBack(back: string, distractors?: string[] | null): string {
  const unpacked = unpackFlashcard<CompatCardLike>({ front: "", back });
  const valid = Array.isArray(distractors)
    ? distractors.filter((d) => typeof d === "string" && d.trim().length > 0)
    : unpacked.distractors || [];
  return valid.length > 0 ? `${unpacked.back}${DISTRACTORS_DELIM}${JSON.stringify(valid)}` : unpacked.back;
}

export function unpackFlashcard<T extends CompatCardLike>(card: T): T {
  const parts = (card.back || "").split(DISTRACTORS_DELIM);
  const cleanBack = (parts[0] || "").trim();
  let distractors = Array.isArray(card.distractors) && card.distractors.length > 0 ? card.distractors : undefined;
  if (!distractors && parts.length > 1) {
    try {
      const parsed = JSON.parse(parts.slice(1).join(DISTRACTORS_DELIM));
      if (Array.isArray(parsed)) distractors = parsed.filter((x): x is string => typeof x === "string");
    } catch {}
  }
  return { ...card, back: cleanBack, distractors };
}

export function unpackDeck<T extends CompatDeckLike>(deck: T): T {
  const { summary, detailed_content, progress_percent } = unpackSummaryFields(deck.summary, deck.detailed_content, deck.progress_percent);
  const { initial_quiz_question, initial_quiz_answer } = unpackQuizFields(deck.initial_quiz_question, deck.initial_quiz_answer);
  const flashcards = Array.isArray(deck.flashcards) ? [...deck.flashcards].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)).map((c) => unpackFlashcard(c)) : deck.flashcards;
  return { ...deck, summary, detailed_content, progress_percent, initial_quiz_question, initial_quiz_answer, flashcards };
}
