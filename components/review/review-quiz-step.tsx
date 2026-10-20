"use client";

import { ReviewQueueItem } from "./review-types";

interface ReviewQuizStepProps {
  item: ReviewQueueItem;
  options: string[];
  onSelectOption: (option: string) => void;
}

export function ReviewQuizStep({
  item,
  options,
  onSelectOption,
}: ReviewQuizStepProps) {
  return (
    <div className="w-full space-y-4 text-left my-auto">
      <div className="p-5 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
          Question Notionnelle
        </span>
        <p className="text-sm font-bold text-black pt-1 leading-snug">{item.front}</p>
      </div>

      <div className="space-y-2.5">
        {options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectOption(opt)}
            className="w-full p-4 rounded-2xl border-2 border-zinc-200/90 border-b-3 border-b-zinc-300 bg-white hover:border-[#4457f4]/60 hover:bg-zinc-50/60 active:border-b-2 active:translate-y-0.5 transition-all text-left text-xs sm:text-sm font-semibold text-zinc-900 cursor-pointer shadow-[0_3px_10px_rgba(0,0,0,0.04)] leading-relaxed flex items-start gap-3 select-none"
          >
            <span className="w-6 h-6 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center font-black text-[#4457f4] text-xs shrink-0 shadow-2xs">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="pt-0.5 font-medium">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
