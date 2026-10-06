"use client";

import { ReviewItemType } from "./review-types";

interface ReviewProgressBarProps {
  type: ReviewItemType;
  currentIndex: number;
  totalCount: number;
  progressPercent: number;
}

export function ReviewProgressBar({
  type,
  currentIndex,
  totalCount,
  progressPercent,
}: ReviewProgressBarProps) {
  const stepLabel =
    type === "flashcard"
      ? "Étape 1 • Mémorisation Flashcards"
      : type === "quiz"
      ? "Étape 2 • Quiz Adaptatif"
      : "Étape 3 • Question Piège Examen";

  return (
    <div className="w-full space-y-1.5 pb-3">
      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
        <span className="flex items-center gap-1 text-brand">
          {stepLabel}
        </span>
        <span>
          {currentIndex + 1} / {totalCount}
        </span>
      </div>
      <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
        <div
          className="h-full bg-gradient-to-r from-brand to-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.max(5, progressPercent)}%` }}
        />
      </div>
    </div>
  );
}
