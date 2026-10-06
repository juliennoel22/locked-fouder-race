"use client";

import { Layers, CheckCircle2, Bot } from "lucide-react";

interface NotebookActionBarProps {
  cardCount: number;
  isPro: boolean;
  onSelectFlashcards: () => void;
  onSelectQuiz: () => void;
  onSelectTutor: () => void;
  onOpenPaywall: () => void;
}

export function NotebookActionBar({
  cardCount,
  isPro,
  onSelectFlashcards,
  onSelectQuiz,
  onSelectTutor,
  onOpenPaywall,
}: NotebookActionBarProps) {
  return (
    <div className="sticky bottom-0 -mx-4 -mb-4 p-4 bg-white/95 backdrop-blur-md border-t border-zinc-200 z-30 shadow-2xl space-y-2.5">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-black">
          Lancer un entraînement
        </span>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Flashcards */}
          <button
            type="button"
            onClick={onSelectFlashcards}
            className="p-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-brand/50 hover:shadow-xs transition-all active:scale-[0.98] text-left flex items-center gap-3 shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                Flashcards
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">
                {cardCount} cartes
              </div>
            </div>
          </button>

          {/* Quiz examen */}
          <button
            type="button"
            onClick={onSelectQuiz}
            className="p-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-brand/50 hover:shadow-xs transition-all active:scale-[0.98] text-left flex items-center gap-3 shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                Quiz examen
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">
                Test chrono
              </div>
            </div>
          </button>
        </div>

        {/* Assistant IA */}
        <button
          type="button"
          onClick={() => {
            if (isPro) onSelectTutor();
            else onOpenPaywall();
          }}
          className="w-full p-3.5 rounded-2xl border border-brand/40 bg-zinc-950 text-white hover:border-brand transition-all active:scale-[0.98] text-left flex items-center justify-between shadow-xs group cursor-pointer"
        >
          <div className="flex items-center gap-3 truncate">
            <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <div className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                Assistant IA
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-brand text-white tracking-wide">
                  IA
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 truncate">
                {isPro ? "Tuteur 24/7" : "Débloquer"}
              </div>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shrink-0 ml-2 transition">
            {isPro ? "Ouvrir" : "PRO"}
          </span>
        </button>
      </div>
    </div>
  );
}
