"use client";

import { ShieldCheck } from "lucide-react";

interface AuthRetentionBannerProps {
  score: string | null;
}

export function AuthRetentionBanner({ score }: AuthRetentionBannerProps) {
  if (!score) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
      <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
        <ShieldCheck className="w-5 h-5 text-amber-500" />
      </div>
      <div>
        <p className="text-xs font-semibold text-amber-500">
          Score de rétention : {score}%
        </p>
        <p className="text-[11px] text-zinc-600">
          Connecte-toi pour sauvegarder ton score et retrouver tes fiches.
        </p>
      </div>
    </div>
  );
}
