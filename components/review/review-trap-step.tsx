"use client";

import { HelpCircle, Check } from "lucide-react";
import { ReviewQueueItem } from "./review-types";

interface ReviewTrapStepProps {
  item: ReviewQueueItem;
  onValidate: () => void;
}

export function ReviewTrapStep({ item, onValidate }: ReviewTrapStepProps) {
  return (
    <div className="w-full p-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/60 to-white shadow-md space-y-4 text-left my-auto">
      <div className="flex items-center gap-2 text-amber-800 text-xs font-black">
        <HelpCircle className="w-4 h-4 text-amber-600" />
        <span>DÉFI FINAL : QUESTION PIÈGE D&apos;EXAMEN</span>
      </div>

      <p className="text-sm font-extrabold text-black leading-snug">
        {item.front}
      </p>

      <div className="p-3.5 rounded-2xl bg-amber-100/50 border border-amber-200 text-xs text-amber-950 leading-relaxed">
        <strong className="block mb-1 text-black font-bold">
          Réponse d&apos;examen attendue :
        </strong>
        <p className="whitespace-pre-line">{item.back}</p>
      </div>

      <button
        type="button"
        onClick={onValidate}
        className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm cursor-pointer"
      >
        <span>Valider le défi d&apos;examen</span>
        <Check className="w-4 h-4" />
      </button>
    </div>
  );
}
