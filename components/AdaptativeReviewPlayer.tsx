"use client";

import { useState, useMemo, useCallback } from "react";
import { ReviewErrorModal } from "./review/review-error-modal";
import { ReviewCompletedModal } from "./review/review-completed-modal";
import {
  ReviewItemType,
  ReviewQueueItem,
  AdaptativeReviewPlayerProps,
} from "./review/review-types";
import { ReviewProgressBar } from "./review/review-progress-bar";
import { ReviewFlashcardStep } from "./review/review-flashcard-step";
import { ReviewQuizStep } from "./review/review-quiz-step";
import { ReviewTrapStep } from "./review/review-trap-step";

export type { ReviewItemType, ReviewQueueItem };

export function AdaptativeReviewPlayer({
  deckId,
  deckTitle,
  subject,
  flashcards,
  initialQuizQuestion,
  initialQuizAnswer,
}: AdaptativeReviewPlayerProps) {
  const buildInitialQueue = useCallback((): ReviewQueueItem[] => {
    const queue: ReviewQueueItem[] = [];

    // 1. Étape 1 : Flashcards
    flashcards.forEach((card, idx) => {
      queue.push({
        id: `fc-${idx}-${Date.now()}`,
        type: "flashcard",
        front: card.front,
        back: card.back,
        distractors: card.distractors,
      });
    });

    // 2. Étape 2 : Quiz notionnel
    flashcards.forEach((card, idx) => {
      queue.push({
        id: `qz-${idx}-${Date.now()}`,
        type: "quiz",
        front: card.front,
        back: card.back,
        distractors: card.distractors,
      });
    });

    // 3. Étape 3 : Question piège (avec sa réponse dédiée spécifique)
    if (initialQuizQuestion?.trim()) {
      const matchingCard = flashcards.find(
        (f) =>
          f.front.toLowerCase().includes(initialQuizQuestion.toLowerCase().slice(0, 15)) ||
          initialQuizQuestion.toLowerCase().includes(f.front.toLowerCase().slice(0, 15))
      );
      const resolvedAnswer =
        initialQuizAnswer?.trim() ||
        matchingCard?.back ||
        "Analyse les principes clés de ta fiche de cours pour justifier ta réponse d'examen.";

      queue.push({
        id: `trap-${Date.now()}`,
        type: "exam_trap",
        front: initialQuizQuestion,
        back: resolvedAnswer,
      });
    }

    return queue;
  }, [flashcards, initialQuizQuestion, initialQuizAnswer]);

  const [queue, setQueue] = useState<ReviewQueueItem[]>(() => buildInitialQueue());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [errorModalData, setErrorModalData] = useState<{
    isOpen: boolean;
    question: string;
    correctAnswer: string;
  }>({ isOpen: false, question: "", correctAnswer: "" });

  const currentItem = queue[currentIndex];
  const totalItemsCount = queue.length;
  const progressPercent =
    totalItemsCount > 0
      ? Math.min(100, Math.round((currentIndex / totalItemsCount) * 100))
      : 0;

  const currentOptions = useMemo(() => {
    if (!currentItem || currentItem.type === "flashcard") return [];
    const correct = currentItem.back;

    if (Array.isArray(currentItem.distractors) && currentItem.distractors.length >= 2) {
      const selectedDistractors = currentItem.distractors.slice(0, 3);
      return [correct, ...selectedDistractors].sort(() => Math.random() - 0.5);
    }

    const others = flashcards
      .filter((f) => f.back !== correct)
      .map((f) => f.back);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    return [correct, ...shuffledOthers].sort(() => Math.random() - 0.5);
  }, [currentItem, flashcards]);

  const saveProgressToDb = useCallback(
    async (percent: number) => {
      if (!deckId || deckId.startsWith("demo-")) return;
      try {
        await fetch("/api/decks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deckId, progress_percent: percent }),
        });
      } catch (e) {
        console.error("Erreur sauvegarde progress_percent :", e);
      }
    },
    [deckId]
  );

  const handleNextItem = () => {
    setIsFlipped(false);
    if (currentIndex + 1 >= queue.length) {
      setIsCompleted(true);
      saveProgressToDb(100);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleMistake = (item: ReviewQueueItem) => {
    setErrorCount((prev) => prev + 1);
    setErrorModalData({
      isOpen: true,
      question: item.front,
      correctAnswer: item.back,
    });

    setQueue((prev) => [
      ...prev,
      {
        ...item,
        id: `${item.id}-retry-${Date.now()}`,
        isRetry: true,
      },
    ]);
  };

  const handleQuizAnswer = (selected: string) => {
    if (!currentItem) return;
    if (selected === currentItem.back) {
      handleNextItem();
    } else {
      handleMistake(currentItem);
    }
  };

  const handleRestart = () => {
    setQueue(buildInitialQueue());
    setCurrentIndex(0);
    setErrorCount(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <ReviewCompletedModal
        deckId={deckId}
        deckTitle={deckTitle}
        progressPercent={100}
        totalCards={flashcards.length}
        errorCount={errorCount}
        onRestart={handleRestart}
      />
    );
  }

  if (!currentItem) return null;

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-2 select-none">
      <ReviewProgressBar
        type={currentItem.type}
        currentIndex={currentIndex}
        totalCount={queue.length}
        progressPercent={progressPercent}
      />

      <div className="flex-1 flex flex-col justify-center py-4">
        {currentItem.type === "flashcard" && (
          <ReviewFlashcardStep
            item={currentItem}
            subjectTitle={subject || deckTitle}
            isFlipped={isFlipped}
            onToggleFlip={() => setIsFlipped((prev) => !prev)}
            onMistake={handleMistake}
            onSuccess={handleNextItem}
          />
        )}

        {currentItem.type === "quiz" && (
          <ReviewQuizStep
            item={currentItem}
            options={currentOptions}
            onSelectOption={handleQuizAnswer}
          />
        )}

        {currentItem.type === "exam_trap" && (
          <ReviewTrapStep item={currentItem} onValidate={handleNextItem} />
        )}
      </div>

      <ReviewErrorModal
        isOpen={errorModalData.isOpen}
        question={errorModalData.question}
        correctAnswer={errorModalData.correctAnswer}
        onDismiss={() => {
          setErrorModalData((prev) => ({ ...prev, isOpen: false }));
          handleNextItem();
        }}
      />
    </div>
  );
}
