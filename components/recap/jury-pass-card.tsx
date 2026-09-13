"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Sparkles, ArrowRight, Check, Copy, Zap, Camera, Bot } from "lucide-react";

export function JuryPassCard() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleActivateAndLaunch = () => {
    try {
      localStorage.setItem("loreno_pro", "true");
      localStorage.setItem("loreno_jury_mode", "true");
      document.cookie = "loreno_pro=true; path=/; max-age=31536000; SameSite=Lax";
    } catch (e) {
      console.error(e);
    }
    router.push("/dashboard?jury=true");
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText("https://www.loreno.app/dashboard?jury=true");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white border border-zinc-200 p-4 sm:p-5 shadow-sm space-y-3.5">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center shadow-xs shrink-0 mt-0.5">
            <Crown className="w-4 h-4 text-black fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-black">Accès Jury FounderRace</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Pack Fondateur Offert (9,99 €)
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">
              Testez l&apos;application à 100% sans carte bancaire ni restriction.
            </p>
          </div>
        </div>
      </div>

      {/* 3 piliers débloqués pour le jury */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
        <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
            <Camera className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-[11px] font-medium text-zinc-700">Scans illimités (Vision AI)</span>
        </div>

        <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
            <Zap className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-[11px] font-medium text-zinc-700">Quiz d&apos;examen & Note /20</span>
        </div>

        <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
            <Bot className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-[11px] font-medium text-zinc-700">Tuteur IA d&apos;Examen</span>
        </div>
      </div>

      {/* Bouton d'action principal */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleActivateAndLaunch}
          className="w-full py-3.5 px-4 rounded-xl bg-black text-white font-bold text-xs sm:text-sm hover:bg-zinc-800 active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Activer le Pass Jury & Tester Loreno</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Lien de secours copiable */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5 px-1">
          <span className="truncate">Lien direct : <code className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-zinc-800 border border-zinc-200">loreno.app/dashboard?jury=true</code></span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-zinc-700 hover:text-black font-semibold shrink-0 ml-2 cursor-pointer transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Lien copié !" : "Copier"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
