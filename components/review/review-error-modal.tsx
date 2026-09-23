"use client";

import { AlertTriangle, ArrowRight, Lightbulb } from "lucide-react";

interface ReviewErrorModalProps {
  isOpen: boolean;
  question: string;
  correctAnswer: string;
  explanation?: string;
  onDismiss: () => void;
}

export function ReviewErrorModal({
  isOpen,
  question,
  correctAnswer,
  explanation,
  onDismiss,
}: ReviewErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-red-200 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-left">
        {/* En-tête Pop-up Pédagogique */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-red-950 uppercase tracking-wide">
              Pas tout à fait !
            </h3>
            <p className="text-[11px] text-red-700 font-medium">
              Option A : Notion ré-injectée en fin de parcours pour validation
            </p>
          </div>
        </div>

        {/* Rappel de la question */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Question
          </span>
          <p className="text-xs font-semibold text-zinc-900 leading-snug">
            {question}
          </p>
        </div>

        {/* Explication Pédagogique & Bonne Réponse */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>La bonne réponse :</span>
          </div>
          <p className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed font-medium">
            {correctAnswer}
          </p>
          {explanation && (
            <p className="text-[11px] text-emerald-800/80 pt-1 border-t border-emerald-200/50">
              {explanation}
            </p>
          )}
        </div>

        {/* Bouton pour poursuivre */}
        <button
          type="button"
          onClick={onDismiss}
          className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-md cursor-pointer"
        >
          <span>J&apos;ai compris, continuer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
