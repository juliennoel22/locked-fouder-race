"use client";

import { ReviewItemType } from "./review-types";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

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
    <div className="w-full space-y-1.5 pb-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span className="font-bold text-foreground tracking-tight">
          {displayTitle}
        </span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {currentIndex + 1} / {totalCount}
        </span>
      </div>
      <Progress value={progressPercent} className="w-full">
        <ProgressTrack className="h-1.5 bg-muted">
          <ProgressIndicator
            className="bg-brand transition-all duration-300"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
