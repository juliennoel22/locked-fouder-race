"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { ReviewDevBanner } from "./review/review-dev-banner";
import { buildQueueForStep } from "./review/review-queue-builder";
import { ReviewInterleavingMode, resolveInterleavingMode } from "@/lib/review-config";

export type { ReviewItemType, ReviewQueueItem };

export function AdaptativeReviewPlayer({
  deckId,
  deckTitle,
  subject,
  flashcards,
  initialQuizQuestion,
  initialQuizAnswer,
  stepNumber = 1,
  mode: initialMode,
}: AdaptativeReviewPlayerProps) {
  const router = useRouter();
  const currentStep = Math.max(1, Math.min(6, stepNumber));
  const sessionLogsRef = useRef<Array<{ cardFront: string; rating: "again" | "good" | "hard"; stepNumber?: number }>>([]);
  const [activeMode, setActiveMode] = useState<ReviewInterleavingMode>(() =>
    resolveInterleavingMode(initialMode)
  );

  const initQueue = useCallback((): ReviewQueueItem[] => {
    return buildQueueForStep({
      step: currentStep,
      flashcards,
      initialQuizQuestion,
      initialQuizAnswer,
      deckTitle,
      deckId,
      mode: activeMode,
    });
  }, [currentStep, flashcards, initialQuizQuestion, initialQuizAnswer, deckTitle, deckId, activeMode]);

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
    sessionLogsRef.current = [];
  }, [initQueue]);

  // Hydratation cross-device des cartes faibles (FEAT-018)
  useEffect(() => {
    if (!deckId || deckId.startsWith("demo-")) return;
    try {
      if (typeof window !== "undefined" && !localStorage.getItem(`loreno_weak_cards_${deckId}`)) {
        fetch(`/api/review/log?deckId=${deckId}`)
          .then((r) => r.json())
          .then((res) => {
            if (res.success && Array.isArray(res.weakCards) && res.weakCards.length > 0) {
              localStorage.setItem(`loreno_weak_cards_${deckId}`, JSON.stringify(res.weakCards));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [deckId]);

  const [errorModalData, setErrorModalData] = useState<{
    isOpen: boolean;
    question: string;
    correctAnswer: string;
  }>({ isOpen: false, question: "", correctAnswer: "" });

  const currentItem = queue[currentIndex];
  const totalItemsCount = queue.length;
  const progressPercent = totalItemsCount > 0 ? Math.min(100, Math.round((currentIndex / totalItemsCount) * 100)) : 0;
  const stepCompletionPercent = useMemo(() => Math.min(100, Math.round((currentStep / 6) * 100)), [currentStep]);

  const currentOptions = useMemo(() => {
    if (!currentItem || currentItem.type !== "quiz") return [];
    const correct = currentItem.back;
    if (Array.isArray(currentItem.distractors) && currentItem.distractors.length >= 2) {
      return [correct, ...currentItem.distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
    }
    const others = flashcards.filter((f) => f.back !== correct).map((f) => f.back);
    return [correct, ...others.sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
  }, [currentItem, flashcards]);

  const saveProgressToDb = useCallback(
    async (percent: number) => {
      if (!deckId) return;
      const targetPercent = Math.max(0, Math.min(100, Math.round(percent)));
      try {
        if (typeof window !== "undefined") {
          const stored = Number(localStorage.getItem(`loreno_progress_${deckId}`) || 0);
          localStorage.setItem(`loreno_progress_${deckId}`, String(Math.max(stored, targetPercent)));
        }
      } catch {}

      if (deckId.startsWith("demo-")) return;
      try {
        await fetch("/api/decks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deckId, progress_percent: targetPercent }),
        });
        if (sessionLogsRef.current.length > 0) {
          fetch("/api/review/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deckId, logs: sessionLogsRef.current }),
          }).catch(() => {});
        }
      } catch (e) {
        console.error("Erreur sync session :", e);
      }
    },
    [deckId]
  );

  const handleNextItem = () => {
    setIsFlipped(false);
    if (currentItem && !currentItem.isRetry) {
      sessionLogsRef.current.push({ cardFront: currentItem.front, rating: "good", stepNumber: currentStep });
    }
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
    setErrorModalData({ isOpen: true, question: item.front, correctAnswer: item.back });
    sessionLogsRef.current.push({ cardFront: item.front, rating: "again", stepNumber: currentStep });
    try {
      if (typeof window !== "undefined" && deckId) {
        const stored = localStorage.getItem(`loreno_weak_cards_${deckId}`);
        const list: string[] = stored ? JSON.parse(stored) : [];
        if (!list.includes(item.front)) {
          list.push(item.front);
          localStorage.setItem(`loreno_weak_cards_${deckId}`, JSON.stringify(list.slice(-5)));
        }
      }
    } catch {}
    setQueue((prev) => [...prev, { ...item, id: `${item.id}-retry-${Date.now()}`, isRetry: true }]);
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
      <ReviewDevBanner
        currentStep={currentStep}
        mode={activeMode}
        onModeChange={(newMode) => {
          setActiveMode(newMode);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("loreno_review_mode", newMode);
            }
          } catch {}
        }}
        onNextItem={handleNextItem}
        onValidateStep={() => {
          saveProgressToDb(stepCompletionPercent);
          setIsCompleted(true);
        }}
      />

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
