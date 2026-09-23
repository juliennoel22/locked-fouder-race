"use client";

import { useEffect, useState, use, Suspense, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Deck } from "@/types/loreno";
import { DEMO_DECK } from "@/lib/demo-deck";
import { Header } from "@/components/Header";
import { AdaptativeReviewPlayer } from "@/components/AdaptativeReviewPlayer";
import { LessonLoadingOverlay } from "@/components/review/lesson-loading-overlay";
import { createClient } from "@/lib/supabase/client";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export function ReviewSessionView({ deckId }: { deckId: string }) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState<boolean>(false);
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const hasTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    async function loadDeck() {
      if (deckId === "demo-droit-constitutionnel" || deckId === "demo") {
        setDeck(DEMO_DECK);
        setIsGeneratingLesson(false);
        setIsApiReady(true);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("decks")
          .select("*, flashcards(*)")
          .eq("id", deckId)
          .single();

        const loadedDeck: Deck = (error || !data) ? DEMO_DECK : data;
        setDeck(loadedDeck);

        const hasCards = Array.isArray(loadedDeck.flashcards) && loadedDeck.flashcards.length > 0;
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

  // Génération Just-in-Time par l'IA la toute première fois que l'étudiant joue
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
          setDeck((prev) => (prev ? {
            ...prev,
            flashcards: json.flashcards,
            initial_quiz_question: json.initial_quiz_question || prev.initial_quiz_question,
          } : null));
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
      <main className="min-h-[100dvh] w-full bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
        <p className="text-xs text-zinc-500 font-medium">Chargement de ta session...</p>
      </main>
    );
  }

  if (!deck) return null;

  // Première fois que l'étudiant joue : affichage du rituel de préparation avec checklist et orbe
  if (isGeneratingLesson) {
    return (
      <LessonLoadingOverlay
        deckTitle={deck.title}
        isReady={isApiReady}
        onComplete={() => setIsGeneratingLesson(false)}
      />
    );
  }

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black">
        {/* Header avec lien de retour direct à la fiche de cours */}
        <Header
          backHref={`/deck/${deck.id}`}
          title="Entraînement Adaptatif"
        />

        {/* Moteur Adaptatif Duolingo Style */}
        <div className="flex-1 flex flex-col min-h-0">
          <AdaptativeReviewPlayer
            deckId={deck.id}
            deckTitle={deck.title}
            subject={deck.subject}
            flashcards={deck.flashcards || []}
            initialQuizQuestion={deck.initial_quiz_question}
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
        <main className="min-h-[100dvh] w-full bg-white flex flex-col items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-500 font-medium">Chargement de ta session...</p>
        </main>
      }
    >
      <ReviewPageInner params={params} />
    </Suspense>
  );
}
