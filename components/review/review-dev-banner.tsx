"use client";

import { Zap } from "lucide-react";
import { ReviewInterleavingMode } from "@/lib/review-config";

interface ReviewDevBannerProps {
  currentStep: number;
  mode: ReviewInterleavingMode;
  onModeChange: (newMode: ReviewInterleavingMode) => void;
  onNextItem: () => void;
  onValidateStep: () => void;
}

export function ReviewDevBanner({
  currentStep,
  mode,
  onModeChange,
  onNextItem,
  onValidateStep,
}: ReviewDevBannerProps) {
  return (
    <div className="w-full mb-2 p-1.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold text-amber-900 shadow-2xs">
      <div className="flex items-center gap-1.5 font-black">
        <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
        <span>DEV (Étape {currentStep}/6)</span>
        <div className="flex items-center bg-amber-200/60 rounded-md p-0.5 text-[9px]">
          {(["flash", "balanced", "deep"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={`px-1.5 py-0.5 rounded transition ${
                mode === m
                  ? "bg-amber-600 text-white font-black"
                  : "text-amber-800 hover:text-amber-950 font-medium"
              }`}
            >
              {m === "flash" ? "⚡ Flash" : m === "balanced" ? "⚖️ Bal." : "🧠 Deep"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onNextItem}
          className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] cursor-pointer shadow-xs active:scale-95 transition"
        >
          ⚡ Item
        </button>
        <button
          type="button"
          onClick={onValidateStep}
          className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs active:scale-95 transition"
        >
          🔓 Valider
        </button>
      </div>
    </div>
  );
}
