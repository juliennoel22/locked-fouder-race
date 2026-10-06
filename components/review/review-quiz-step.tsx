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
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-brand">
          Question Notionnelle
        </span>
        <p className="text-sm font-bold text-black">{item.front}</p>
      </div>

      <div className="space-y-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectOption(opt)}
            className="w-full p-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-brand hover:bg-zinc-50 active:scale-[0.98] transition-all text-left text-xs font-semibold text-zinc-800 cursor-pointer shadow-2xs leading-relaxed"
          >
            <span className="font-extrabold text-brand mr-2">
              {String.fromCharCode(65 + idx)}.
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
