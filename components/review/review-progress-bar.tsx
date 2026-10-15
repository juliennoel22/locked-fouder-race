"use client";

import { ReviewItemType } from "./review-types";

interface ReviewProgressBarProps {
  type: ReviewItemType;
  currentIndex: number;
  totalCount: number;
  progressPercent: number;
  stepNumber?: number;
}

export function ReviewProgressBar({
  type,
  currentIndex,
  totalCount,
  progressPercent,
  stepNumber,
}: ReviewProgressBarProps) {
  const stepLabel =
    type === "concept"
      ? "Concepts Clés"
      : type === "flashcard"
      ? "Mémorisation 3D"
      : type === "quiz"
      ? "QCM Chronométré"
      : type === "chest"
      ? "Coffre Trésor"
      : type === "free_text"
      ? "Rappel Saisie Libre"
      : "Épreuve Finale";

  const displayTitle = stepNumber
    ? `Étape ${stepNumber} sur 6 • ${stepLabel}`
    : stepLabel;

  return (
    <div className="w-full space-y-1.5 pb-3">
      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
        <span className="flex items-center gap-1 text-brand font-black">
          {displayTitle}
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
