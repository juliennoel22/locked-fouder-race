"use client";

import { X, ArrowUp } from "lucide-react";

interface OnboardingTourBubbleProps {
  show: boolean;
  onDismiss: () => void;
}

export function OnboardingTourBubble({ show, onDismiss }: OnboardingTourBubbleProps) {
  if (!show) return null;

  return (
    <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 border border-violet-400/30 text-white shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white text-violet-700 flex items-center justify-center shrink-0 shadow-md">
          <ArrowUp className="w-5 h-5 animate-bounce stroke-[2.5]" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-bold text-white tracking-tight">
            Clique sur <strong className="underline decoration-white/60">Flashcards</strong> ou <strong className="underline decoration-white/60">Quiz</strong>
          </p>
          <p className="text-xs text-violet-100/90 font-medium">
            Pour démarrer et tester ton premier cours
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/40 text-violet-100 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
