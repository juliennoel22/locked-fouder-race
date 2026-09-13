"use client";

import { X, ArrowDown, ArrowUp, Sparkles, ArrowRight } from "lucide-react";

interface OnboardingTourBubbleProps {
  show: boolean;
  onDismiss?: () => void;
  stepNumber?: number;
  totalSteps?: number;
  badgeText?: string;
  title?: string;
  description?: string;
  arrowDirection?: "down" | "up" | "none";
  actionLabel?: string;
  onAction?: () => void;
  showDismiss?: boolean;
}

export function OnboardingTourBubble({
  show,
  onDismiss,
  stepNumber = 1,
  totalSteps = 3,
  badgeText,
  title = "Choisis ton mode pour réviser",
  description = "Clique ci-dessous sur Flashcards ou Quiz pour lancer ton cours.",
  arrowDirection = "down",
  actionLabel,
  onAction,
  showDismiss = true,
}: OnboardingTourBubbleProps) {
  if (!show) return null;

  return (
    <div className="mb-2.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 border border-violet-400/40 text-white shadow-2xl space-y-2 animate-in slide-in-from-top-2 duration-200 select-none">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-white text-violet-800 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
            {badgeText || `Étape ${stepNumber}/${totalSteps}`}
          </span>
          <h2 className="text-sm font-bold text-white tracking-tight truncate">
            {title}
          </h2>
        </div>
        {showDismiss && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="w-6 h-6 rounded-md bg-black/20 hover:bg-black/40 text-violet-200 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between pt-0.5 gap-2.5">
        <p className="text-xs text-violet-100/95 leading-snug">
          {description}
        </p>
        {arrowDirection === "down" && (
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
            <ArrowDown className="w-4 h-4 animate-bounce stroke-[2.5]" />
          </div>
        )}
        {arrowDirection === "up" && (
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
            <ArrowUp className="w-4 h-4 animate-bounce stroke-[2.5]" />
          </div>
        )}
        {arrowDirection === "none" && (
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="w-full mt-1.5 py-2.5 px-4 rounded-xl bg-white hover:bg-violet-50 text-violet-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}

