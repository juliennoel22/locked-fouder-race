"use client";

import { useState } from "react";
import { HelpCircle, Check, Eye, AlertTriangle, Sparkles, Send } from "lucide-react";
import { ReviewQueueItem } from "./review-types";

interface ReviewTrapStepProps {
  item: ReviewQueueItem;
  onValidate: () => void;
  onMistake?: () => void;
}

export function ReviewTrapStep({ item, onValidate, onMistake }: ReviewTrapStepProps) {
  const [userReasoning, setUserReasoning] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [verdict, setVerdict] = useState<"mastered" | "trapped" | null>(null);

  const handleReveal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsRevealed(true);
  };

  const handleFinish = (status: "mastered" | "trapped") => {
    setVerdict(status);
    if (status === "mastered") {
      onValidate();
    } else {
      if (onMistake) {
        onMistake();
      } else {
        onValidate();
      }
    }
  };

  return (
    <div className="w-full p-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 shadow-lg space-y-4 text-left my-auto transition-all duration-300">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-900 text-xs font-black">
          <HelpCircle className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>ÉPREUVE FINALE : QUESTION PIÈGE D&apos;EXAMEN</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
          Étape 6 / 6
        </span>
      </div>

      {/* Question */}
      <div className="space-y-1">
        <p className="text-base font-extrabold text-zinc-900 leading-snug">
          {item.front}
        </p>
        <p className="text-[11px] text-zinc-500 font-medium">
          Défie le correcteur : explicite ton raisonnement ou identifie le piège avant de voir la correction officielle.
        </p>
      </div>

      {/* Phase 1 : Mise à l'épreuve active */}
      {!isRevealed ? (
        <form onSubmit={handleReveal} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700">
              Ton analyse ou ta réponse :
            </label>
            <textarea
              value={userReasoning}
              onChange={(e) => setUserReasoning(e.target.value)}
              placeholder="Ex: Le piège porte sur la distinction entre... car l'article stipule..."
              rows={3}
              className="w-full p-3.5 rounded-2xl border border-amber-200 bg-white/90 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:brightness-105 active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{userReasoning.trim() ? "Confronter mon analyse au corrigé" : "Révéler le corrigé d'examen"}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Phase 2 : Révélation du verdict & analyse type */
        <div className="space-y-4 pt-1 animate-fadeIn">
          {userReasoning.trim() && (
            <div className="p-3 rounded-2xl bg-zinc-100/80 border border-zinc-200 text-xs text-zinc-800">
              <span className="block font-bold text-[10px] uppercase text-zinc-500 mb-0.5">
                Ton raisonnement initial :
              </span>
              <p className="italic font-medium">&ldquo;{userReasoning}&rdquo;</p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-300 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-[11px] uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Corrigé type & Décryptage du piège :</span>
            </div>
            <p className="whitespace-pre-line text-sm font-semibold text-zinc-900 leading-relaxed">
              {item.back}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-center text-xs font-bold text-zinc-600">
              Honnêtement, as-tu évité le piège ?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleFinish("trapped")}
                className="h-12 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-300 transition cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Je suis tombé dedans</span>
              </button>
              <button
                type="button"
                onClick={() => handleFinish("mastered")}
                className="h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Piège évité (+100 XP)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
