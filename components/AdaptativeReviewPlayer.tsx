"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReviewErrorModal } from "./review/review-error-modal";
import { ReviewCompletedModal } from "./review/review-completed-modal";
import {
  ReviewItemType,
  ReviewQueueItem,
  AdaptativeReviewPlayerProps,
} from "./review/review-types";
import { ReviewProgressBar } from "./review/review-progress-bar";
import { ReviewConceptStep } from "./review/review-concept-step";
import { ReviewFlashcardStep } from "./review/review-flashcard-step";
import { ReviewQuizStep } from "./review/review-quiz-step";
import { ReviewChestStep } from "./review/review-chest-step";
import { ReviewTrapStep } from "./review/review-trap-step";
import { ReviewFreeTextStep } from "./review/review-freetext-step";
import { buildQueueForStep } from "./review/review-queue-builder";

export type { ReviewItemType, ReviewQueueItem };

export function AdaptativeReviewPlayer({
  deckId,
  deckTitle,
  subject,
  flashcards,
  initialQuizQuestion,
  initialQuizAnswer,
  stepNumber = 1,
}: AdaptativeReviewPlayerProps) {
  const router = useRouter();
  const currentStep = Math.max(1, Math.min(6, stepNumber));

  const initQueue = useCallback((): ReviewQueueItem[] => {
    return buildQueueForStep({
      step: currentStep,
      flashcards,
      initialQuizQuestion,
      initialQuizAnswer,
      deckTitle,
    });
  }, [currentStep, flashcards, initialQuizQuestion, initialQuizAnswer, deckTitle]);

  const [queue, setQueue] = useState<ReviewQueueItem[]>(() => initQueue());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    setQueue(initQueue());
    setCurrentIndex(0);
    setErrorCount(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, [initQueue]);

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

  const stepCompletionPercent = useMemo(() => {
    return Math.min(100, Math.round((currentStep / 6) * 100));
  }, [currentStep]);

  const currentOptions = useMemo(() => {
    if (!currentItem || currentItem.type !== "quiz") return [];
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
      if (!deckId) return;
      const targetPercent = Math.max(0, Math.min(100, Math.round(percent)));

      try {
        if (typeof window !== "undefined") {
          const stored = Number(localStorage.getItem(`loreno_progress_${deckId}`) || 0);
          const maxPercent = Math.max(stored, targetPercent);
          localStorage.setItem(`loreno_progress_${deckId}`, String(maxPercent));
        }
      } catch {}

      if (deckId.startsWith("demo-")) return;
      try {
        await fetch("/api/decks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deckId, progress_percent: targetPercent }),
        });
      } catch (e) {
        console.error("Erreur sauvegarde progress_percent :", e);
      }
    },
    [deckId]
  );

  const handleNextItem = () => {
    setIsFlipped(false);
    const nextIdx = currentIndex + 1;

    if (nextIdx >= queue.length) {
      setIsCompleted(true);
      saveProgressToDb(stepCompletionPercent);
    } else {
      setCurrentIndex(nextIdx);
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
    setQueue(initQueue());
    setCurrentIndex(0);
    setErrorCount(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      router.push(`/review/${deckId}?step=${currentStep + 1}`);
    } else {
      router.push(`/deck/${deckId}`);
    }
  };

  if (isCompleted) {
    return (
      <ReviewCompletedModal
        deckId={deckId}
        deckTitle={deckTitle}
        progressPercent={stepCompletionPercent}
        totalCards={queue.length}
        errorCount={errorCount}
        stepNumber={currentStep}
        onRestart={handleRestart}
        onNextStep={handleNextStep}
      />
    );
  }

  if (!currentItem) return null;

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-2 select-none">
      {/* Barre Mode Test Rapidité en Jeu */}
      <div className="w-full mb-2 p-1.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-[11px] font-bold text-amber-900 shadow-2xs">
        <span className="flex items-center gap-1 font-black">
          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>TEST DEV (Étape {currentStep}/6) :</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleNextItem}
            className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] cursor-pointer shadow-xs active:scale-95 transition"
          >
            ⚡ Item suivant
          </button>
          <button
            type="button"
            onClick={() => {
              saveProgressToDb(stepCompletionPercent);
              setIsCompleted(true);
            }}
            className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs active:scale-95 transition"
          >
            🔓 Valider palier
          </button>
        </div>
      </div>

      <ReviewProgressBar
        type={currentItem.type}
        currentIndex={currentIndex}
        totalCount={queue.length}
        progressPercent={progressPercent}
        stepNumber={currentStep}
      />

      <div className="flex-1 flex flex-col justify-center py-4">
        {currentItem.type === "concept" && (
          <ReviewConceptStep
            item={currentItem}
            subjectTitle={subject || deckTitle}
            onValidate={handleNextItem}
          />
        )}

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

        {currentItem.type === "chest" && (
          <ReviewChestStep item={currentItem} onValidate={handleNextItem} />
        )}

        {currentItem.type === "free_text" && (
          <ReviewFreeTextStep
            item={currentItem}
            onSubmitAnswer={(isCorrect) => {
              if (isCorrect) handleNextItem();
              else handleMistake(currentItem);
            }}
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
