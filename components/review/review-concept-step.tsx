"use client";

import { BookOpen, Check, Sparkles } from "lucide-react";
import { ReviewQueueItem } from "./review-types";

interface ReviewConceptStepProps {
  item: ReviewQueueItem;
  subjectTitle: string;
  onValidate: () => void;
}

export function ReviewConceptStep({
  item,
  subjectTitle,
  onValidate,
}: ReviewConceptStepProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between py-2 text-left animate-in fade-in duration-300 select-none">
      <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-5">
        {/* En-tête Badge */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lecture Active • {subjectTitle}</span>
          </span>
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Concept Clé</span>
          </span>
        </div>

        {/* Titre / Concept */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-snug">
            {item.front}
          </h2>
          <div className="w-12 h-1 bg-emerald-500 rounded-full" />
        </div>

        {/* Définition / Explication */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm sm:text-base text-zinc-800 leading-relaxed font-normal">
          <p className="whitespace-pre-line">{item.back}</p>
        </div>

        {/* Conseil mnémotechnique */}
        <p className="text-[11px] text-zinc-500 italic">
          💡 Conseil : Lis attentivement la définition avant de passer au test de rappel 3D.
        </p>
      </div>

      {/* Bouton d'action principal dans la Thumb Zone */}
      <div className="pt-4 pb-2">
        <button
          type="button"
          onClick={onValidate}
          className="w-full h-14 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-xl cursor-pointer"
        >
          <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
          <span>J&apos;ai assimilé ce concept</span>
        </button>
      </div>
    </div>
  );
}
