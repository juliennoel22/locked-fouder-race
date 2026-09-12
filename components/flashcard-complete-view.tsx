"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface FlashcardCompleteViewProps {
  knownCount: number;
  totalCount: number;
  onReset?: () => void;
  onComplete?: () => void;
}

export function FlashcardCompleteView({
  knownCount,
  totalCount,
  onReset,
  onComplete,
}: FlashcardCompleteViewProps) {
  const safeTotal = Math.max(1, totalCount);
  const safeKnown = Math.min(safeTotal, Math.max(0, knownCount));
  const scorePercent = Math.round((safeKnown / safeTotal) * 100);
  const reviewCount = safeTotal - safeKnown;

  // Déclencher les confettis si bon score
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("loreno_retention_score", String(scorePercent));
    }
    if (scorePercent >= 60) {
      try {
        confetti({
          particleCount: scorePercent === 100 ? 100 : 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [scorePercent]);

  const getFeedback = () => {
    if (scorePercent === 100) {
      return {
        badge: "🏆 Maîtrise parfaite",
        title: "Score de rétention maximal !",
        description: "Tu maîtrises l'intégralité de ces concepts pour le jour des partiels.",
      };
    }
    if (scorePercent >= 80) {
      return {
        badge: "🎯 Excellent travail",
        title: "Très bon score de rétention !",
        description: "Presque tout est acquis. Un dernier coup d'œil et ce sera parfait.",
      };
    }
    if (scorePercent >= 60) {
      return {
        badge: "💡 Bonne base",
        title: "Notions bien comprises !",
        description: "Tu as la majorité des concepts. Pense à revoir les fiches manquantes.",
      };
    }
    if (scorePercent >= 40) {
      return {
        badge: "📚 À consolider",
        title: "Score de rétention moyen",
        description: "Plusieurs points clés méritent d'être retravaillés avant l'examen.",
      };
    }
    return {
      badge: "⚠️ À revoir d'urgence",
      title: "Concepts non maîtrisés",
      description: "Prends le temps de relire les explications pour bien ancrer les bases.",
    };
  };

  const feedback = getFeedback();

  return (
    <div className="w-full py-4 flex flex-col items-center text-center space-y-5 select-none animate-in fade-in duration-300">
      {/* Badge et Note */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-black">
          <Trophy className="w-3.5 h-3.5 text-zinc-800" />
          <span>{feedback.badge}</span>
        </div>

        <div className="space-y-1">
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-black">
            {scorePercent}%
          </div>
          <h2 className="text-lg font-bold text-black">{feedback.title}</h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {feedback.description}
          </p>
        </div>
      </div>

      {/* Barre de répartition visuelle */}
      <div className="w-full max-w-xs bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
        <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden flex">
          <div
            className="bg-black h-full transition-all duration-500"
            style={{ width: `${scorePercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-zinc-200">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            <div className="text-left">
              <span className="font-bold text-black">{safeKnown}</span>
              <p className="text-[10px] text-zinc-500">Maîtrisée{safeKnown > 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-zinc-200">
            <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="text-left">
              <span className="font-bold text-black">{reviewCount}</span>
              <p className="text-[10px] text-zinc-500">À revoir</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-xs space-y-2.5 pt-2">
        {onComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <span>Sauvegarder et continuer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className={`w-full h-12 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] ${
              !onComplete ? "h-14 bg-black text-white hover:bg-zinc-800" : ""
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recommencer la série ({safeTotal} cartes)</span>
          </button>
        )}
      </div>
    </div>
  );
}
