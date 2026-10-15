"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Trophy, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ReviewCompletedModalProps {
  deckId: string;
  deckTitle: string;
  progressPercent: number;
  totalCards: number;
  errorCount: number;
  stepNumber?: number;
  onRestart: () => void;
  onNextStep?: () => void;
}

export function ReviewCompletedModal({
  deckId,
  deckTitle,
  progressPercent,
  totalCards,
  errorCount,
  stepNumber = 1,
  onRestart,
  onNextStep,
}: ReviewCompletedModalProps) {
  const isFinalStep = stepNumber >= 6 || progressPercent >= 100;
  const nextStepNumber = Math.min(6, stepNumber + 1);
  useEffect(() => {
    try {
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 } });
      setTimeout(() => {
        confetti({ particleCount: 90, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
        confetti({ particleCount: 90, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
      }, 250);
    } catch {}
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-6 px-2 text-center animate-in fade-in duration-300">
      <div className="space-y-6 pt-4">
        {/* Trophée & Victoire */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-brand/20 animate-in zoom-in-75 duration-300">
            <Trophy className="w-10 h-10" />
          </div>
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full inline-block">
            {isFinalStep ? "Parcours Adaptatif Terminé" : `Étape ${stepNumber} sur 6 Validée`}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            {isFinalStep ? "Session Validée à 100% !" : `Palier ${stepNumber} Débloqué !`}
          </h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {isFinalStep
              ? `Tu as révisé et validé l'intégralité des 6 étapes de ${deckTitle}.`
              : `Progression enregistrée (+${Math.round(100 / 6)}%). Tu peux enchaîner ou reprendre plus tard.`}
          </p>
        </div>

        {/* Statistiques de la session */}
        <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto">
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-0.5">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Maîtrise</span>
            <div className="text-lg font-black text-emerald-600">{progressPercent}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-0.5">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Items</span>
            <div className="text-lg font-black text-zinc-900">{totalCards}</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-0.5">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Erreurs</span>
            <div className="text-lg font-black text-brand">{errorCount}</div>
          </div>
        </div>
      </div>

      {/* Actions de navigation */}
      <div className="space-y-2.5 pt-6 max-w-sm w-full mx-auto">
        {!isFinalStep ? (
          <>
            {onNextStep ? (
              <button
                type="button"
                onClick={onNextStep}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md cursor-pointer"
              >
                <span>Passer à l&apos;Étape {nextStepNumber}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href={`/review/${deckId}?step=${nextStepNumber}`}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md"
              >
                <span>Passer à l&apos;Étape {nextStepNumber}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href={`/deck/${deckId}`}
              className="w-full h-11 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
            >
              <span>Retourner à la roadmap</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href={`/deck/${deckId}`}
              className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md"
            >
              <span>Consulter la fiche du cours</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onRestart}
                className="flex-1 h-11 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rejouer</span>
              </button>

              <Link
                href="/dashboard"
                className="flex-1 h-11 rounded-xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center justify-center transition active:scale-[0.98]"
              >
                <span>Bibliothèque</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
