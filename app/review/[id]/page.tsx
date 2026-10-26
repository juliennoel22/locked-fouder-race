"use client";

import { useEffect, useState, use, Suspense, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Deck, Flashcard } from "@/types/loreno";
import { DEMO_DECK } from "@/lib/demo-deck";
import { Header } from "@/components/Header";
import { AdaptativeReviewPlayer } from "@/components/AdaptativeReviewPlayer";
import { LessonLoadingOverlay } from "@/components/review/lesson-loading-overlay";
import { createClient } from "@/lib/supabase/client";
import { resolveInterleavingMode } from "@/lib/review-config";
import { unpackDeck } from "@/lib/db-compat";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

function hydrateMissingExamAnswer(deck: Deck): string | null {
  if (deck.initial_quiz_answer && deck.initial_quiz_answer.trim()) {
    return deck.initial_quiz_answer.trim();
  }
  if (!deck.initial_quiz_question?.trim()) {
    return null;
  }
  const ensureDot = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);
  const cards = deck.flashcards || [];
  if (cards.length >= 3) {
    const cA = ensureDot(cards[Math.max(0, cards.length - 3)].back);
    const cB = ensureDot(cards[Math.max(0, cards.length - 2)].back);
    const cC = ensureDot(cards[cards.length - 1].back);
    return `${cA} À l'inverse, ${cB.charAt(0).toLowerCase()}${cB.slice(1)} En somme, ${cC.charAt(0).toLowerCase()}${cC.slice(1)}`;
  }
  if (cards.length > 0) {
    return ensureDot(cards[cards.length - 1].back);
  }
  return deck.summary || null;
}

export function ReviewSessionView({ deckId }: { deckId: string }) {
  const searchParams = useSearchParams();
  const rawStep = searchParams.get("step");
  const urlStepNumber = rawStep ? parseInt(rawStep, 10) : undefined;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState<boolean>(false);
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const hasTriggeredRef = useRef<boolean>(false);

  const effectiveStepNumber = useMemo(() => {
    if (urlStepNumber && urlStepNumber >= 1 && urlStepNumber <= 6) {
      return urlStepNumber;
    }
    let progress = deck?.progress_percent || 0;
    try {
      if (typeof window !== "undefined" && deck?.id) {
        const stored = localStorage.getItem(`loreno_progress_${deck.id}`);
        if (stored) progress = Math.max(progress, Number(stored));
      }
    } catch {}
    if (progress >= 100) return 1;
    const completedSteps = Math.floor((progress / 100) * 6);
    return Math.min(6, completedSteps + 1);
  }, [urlStepNumber, deck]);

  useEffect(() => {
    async function loadDeck() {
      if (deckId === "demo-droit-constitutionnel" || deckId === "demo") {
        setDeck(DEMO_DECK);
        setIsGeneratingLesson(false);
        setIsApiReady(true);
        setLoading(false);
        return;
      }

      if (deckId.startsWith("demo-histoire")) {
        try {
          const stored = localStorage.getItem("loreno_mock_history_deck");
          if (stored) {
            const unpacked = unpackDeck(JSON.parse(stored) as Deck);
            setDeck({
              ...unpacked,
              initial_quiz_answer: hydrateMissingExamAnswer(unpacked),
            });
            setIsGeneratingLesson(false);
            setIsApiReady(true);
            setLoading(false);
            return;
          }
        } catch {}
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("decks")
          .select("*, flashcards(*)")
          .eq("id", deckId)
          .single();

        const rawLoaded: Deck = error || !data ? DEMO_DECK : (data as Deck);
        const unpacked = unpackDeck(rawLoaded);
        const hydratedDeck: Deck = {
          ...unpacked,
          initial_quiz_answer: hydrateMissingExamAnswer(unpacked),
        };
        setDeck(hydratedDeck);

        const hasCards = Array.isArray(hydratedDeck.flashcards) && hydratedDeck.flashcards.length > 0;
        if (!hasCards && deckId !== "demo-droit-constitutionnel" && deckId !== "demo") {
          setIsGeneratingLesson(true);
          setIsApiReady(false);
        } else {
          setIsGeneratingLesson(false);
          setIsApiReady(true);
        }
      } catch (err) {
        console.error("Erreur chargement session révision :", err);
        setDeck(DEMO_DECK);
        setIsGeneratingLesson(false);
        setIsApiReady(true);
      } finally {
        setLoading(false);
      }
    }

    loadDeck();
  }, [deckId]);

  useEffect(() => {
    if (!deck || !isGeneratingLesson || hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    async function generateGameCards() {
      try {
        const res = await fetch("/api/decks/generate-game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deckId: deck!.id }),
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.flashcards)) {
          const sortedCards = [...(json.flashcards as Flashcard[])].sort(
            (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
          );
          setDeck((prev) =>
            prev
              ? unpackDeck({
                  ...prev,
                  flashcards: sortedCards,
                  initial_quiz_question: json.initial_quiz_question || prev.initial_quiz_question,
                  initial_quiz_answer: json.initial_quiz_answer || prev.initial_quiz_answer,
                })
              : null
          );
        }
      } catch (err) {
        console.error("Erreur génération de leçon JIT :", err);
      } finally {
        setIsApiReady(true);
      }
    }

    generateGameCards();
  }, [deck, isGeneratingLesson]);

  if (loading) {
    return (
      <main className="min-h-[100dvh] w-full bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
        <p className="text-xs text-zinc-500 font-medium">Chargement de ta session...</p>
      </main>
    );
  }

  if (!deck) return null;

  if (isGeneratingLesson) {
    return (
      <LessonLoadingOverlay
        deckTitle={deck.title}
        isReady={isApiReady}
        onComplete={() => setIsGeneratingLesson(false)}
      />
    );
  }

  const sortedFlashcards = [...(deck.flashcards || [])].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  return (
    <main className="min-h-[100dvh] w-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-background text-foreground">
        <Header
          backHref={`/deck/${deck.id}`}
          title={`Étape ${effectiveStepNumber} / 6`}
        />

        <div className="flex-1 flex flex-col min-h-0">
          <AdaptativeReviewPlayer
            key={`player-${deck.id}-step-${effectiveStepNumber}`}
            deckId={deck.id}
            deckTitle={deck.title}
            subject={deck.subject}
            flashcards={sortedFlashcards}
            initialQuizQuestion={deck.initial_quiz_question}
            initialQuizAnswer={deck.initial_quiz_answer}
            stepNumber={effectiveStepNumber}
            mode={resolveInterleavingMode(searchParams.get("mode"))}
          />
        </div>
      </div>
    </main>
  );
}

function ReviewPageInner({ params }: ReviewPageProps) {
  const resolvedParams = use(params);
  return <ReviewSessionView deckId={resolvedParams.id} />;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100dvh] w-full bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-500 font-medium">Chargement de ta session...</p>
        </main>
      }
    >
      <ReviewPageInner params={params} />
    </Suspense>
  );
}
