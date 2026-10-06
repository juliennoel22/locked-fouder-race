"use client";

import { Zap, Loader2, CheckCircle2 } from "lucide-react";

interface MirrorBannerProps {
  isAnalyzing: boolean;
  onConfirmAndAnalyze: () => void;
}

export function MirrorBanner({
  isAnalyzing,
  onConfirmAndAnalyze,
}: MirrorBannerProps) {
  return (
    <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
        <span>Nouveau document ajouté ! Valider l&apos;analyse IA ?</span>
      </div>
      <button
        onClick={onConfirmAndAnalyze}
        disabled={isAnalyzing}
        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Analyse...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Valider IA</span>
          </>
        )}
      </button>
    </div>
  );
}
