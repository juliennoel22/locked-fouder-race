"use client";

import { useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Trophy, RotateCcw, ArrowRight, Sparkles, GraduationCap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { triggerFeedback } from "@/lib/haptics";

interface ReviewCompletedModalProps {
  deckId: string;
  deckTitle: string;
  progressPercent: number;
  totalCards: number;
  errorCount: number;
  stepNumber?: number;
  weakNotions?: string[];
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
  weakNotions = [],
  onRestart,
  onNextStep,
}: ReviewCompletedModalProps) {
  const isFinalStep = stepNumber >= 6 || progressPercent >= 100;
  const nextStepNumber = Math.min(6, stepNumber + 1);

  // Formule de notation académique prédictive sur 20 (FEAT-014)
  const score20 = useMemo(() => {
    return Math.max(6, Math.min(20, Math.round(20 - errorCount * 2.5)));
  }, [errorCount]);

  const mention = useMemo(() => {
    if (score20 >= 16) return { label: "Mention Très Bien", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    if (score20 >= 14) return { label: "Mention Bien", badge: "bg-teal-50 text-teal-800 border-teal-200" };
    if (score20 >= 12) return { label: "Mention Assez Bien", badge: "bg-indigo-50 text-indigo-800 border-indigo-200" };
    if (score20 >= 10) return { label: "Mention Passable", badge: "bg-amber-50 text-amber-800 border-amber-200" };
    return { label: "Ajourné (À retravailler)", badge: "bg-rose-50 text-rose-800 border-rose-200" };
  }, [score20]);

  useEffect(() => {
    triggerFeedback("milestone");
    try {
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 } });
      setTimeout(() => {
        confetti({ particleCount: 90, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
        confetti({ particleCount: 90, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
      }, 250);
    } catch {}
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 px-2 text-center animate-in fade-in duration-300">
      <div className="space-y-4 pt-2">
        {/* Trophée & Victoire */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-brand/20 animate-in zoom-in-75 duration-300">
            <Trophy className="w-8 h-8" />
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand bg-brand/10 border border-brand/20 px-3 py-0.5 rounded-full inline-block">
            {isFinalStep ? "Parcours d'Examen Terminé" : `Étape ${stepNumber} sur 6 Validée`}
          </span>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            {isFinalStep ? "Bulletin Final Prédictif" : `Palier ${stepNumber} Débloqué !`}
          </h2>
          <p className="text-xs text-zinc-500 font-medium line-clamp-1">{deckTitle}</p>
        </div>

        {/* Bulletin Prédictif /20 & Mention Académique (FEAT-014) */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-zinc-50 to-white border-2 border-zinc-200/80 shadow-sm max-w-sm mx-auto space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-zinc-700 uppercase tracking-wide">
              <GraduationCap className="w-4 h-4 text-brand" />
              <span>Note Prédictive d&apos;Examen</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${mention.badge}`}>
              {mention.label}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-zinc-950">{score20}</span>
              <span className="text-base font-bold text-zinc-400">/ 20</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">
              {errorCount === 0 ? "Sans faute !" : `${errorCount} erreur${errorCount > 1 ? "s" : ""} identifiée${errorCount > 1 ? "s" : ""}`}
            </div>
          </div>

          {/* Diagnostic Notions */}
          <div className="pt-2 border-t border-zinc-100 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{Math.max(1, totalCards - errorCount)} notions clés maîtrisées</span>
            </div>
            {weakNotions.length > 0 && (
              <div className="flex items-start gap-1.5 text-rose-700 font-semibold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="line-clamp-1">Priorité rattrapage : {weakNotions[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Levier Upsell Pro : Mode Examen Prédictif */}
        {isFinalStep && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-left max-w-sm mx-auto flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Mode Examen Loreno Pro
              </span>
              <p className="text-[11px] font-semibold text-zinc-800">
                15 annales corrigées & fiches téléchargeables
              </p>
            </div>
            <Link
              href="/auth"
              className="shrink-0 px-3 py-1.5 rounded-xl bg-black text-white text-[11px] font-bold hover:bg-zinc-800 transition"
            >
              Débloquer
            </Link>
          </div>
        )}
      </div>

      {/* Actions de navigation */}
      <div className="space-y-2 pt-4 max-w-sm w-full mx-auto">
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
