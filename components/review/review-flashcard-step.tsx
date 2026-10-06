"use client";

import { RotateCw, X, Check } from "lucide-react";
import { ReviewQueueItem } from "./review-types";

interface ReviewFlashcardStepProps {
  item: ReviewQueueItem;
  subjectTitle: string;
  isFlipped: boolean;
  onToggleFlip: () => void;
  onMistake: (item: ReviewQueueItem) => void;
  onSuccess: () => void;
}

export function ReviewFlashcardStep({
  item,
  subjectTitle,
  isFlipped,
  onToggleFlip,
  onMistake,
  onSuccess,
}: ReviewFlashcardStepProps) {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Carte avec retournement 3D */}
      <div className="relative w-full min-h-[260px] [perspective:1000px] select-none cursor-pointer my-auto">
        <div
          onClick={onToggleFlip}
          className={`relative w-full h-full min-h-[260px] rounded-3xl border-2 transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped
              ? "[transform:rotateY(180deg)] border-brand"
              : "border-zinc-200 hover:border-brand/40"
          }`}
        >
          {/* Face Recto */}
          <div className="absolute inset-0 w-full h-full p-6 bg-white rounded-3xl flex flex-col justify-between [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                Notion / Question
              </span>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1 group-hover:text-brand transition">
                <RotateCw className="w-3.5 h-3.5" />
                Tap pour retourner
              </span>
            </div>

            <div className="py-4">
              <p className="text-base sm:text-lg font-bold text-black leading-snug whitespace-pre-line">
                {item.front}
              </p>
            </div>

            <div className="text-[10px] text-zinc-400">{subjectTitle}</div>
          </div>

          {/* Face Verso (Réponse non-miroir) */}
          <div className="absolute inset-0 w-full h-full p-6 bg-white rounded-3xl flex flex-col justify-between [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                Réponse / Explication
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                Verso
              </span>
            </div>

            <div className="py-4">
              <p className="text-base sm:text-lg font-extrabold text-black leading-snug whitespace-pre-line">
                {item.back}
              </p>
            </div>

            <div className="text-[10px] text-emerald-600 font-bold">
              Connaissais-tu cette réponse ?
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action Thumb Zone Ergonomiques UX-010 */}
      <div className="flex items-center gap-3 pt-3">
        <button
          type="button"
          onClick={() => onMistake(item)}
          className="flex-1 h-14 sm:h-16 rounded-2xl border-2 border-red-200 bg-white hover:bg-red-50 text-red-600 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95 transition shadow-xs cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
          <span>À revoir</span>
        </button>

        <button
          type="button"
          onClick={onSuccess}
          className="flex-1 h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95 transition shadow-md cursor-pointer border border-emerald-400/40"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Je sais</span>
        </button>
      </div>
    </div>
  );
}
