"use client";

import { Camera, Plus, MessageSquare, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { NotebookItem } from "@/types/loreno";

interface FloatingScanBarProps {
  onNewNotebook?: (item: NotebookItem) => void;
  isRateLimited?: boolean;
  onRateLimit?: () => void;
  onOpenFeedback?: () => void;
  onOpenScanModal?: () => void;
  isPro?: boolean;
  notebooksCount?: number;
  onOpenPaywall?: () => void;
  hideQuotaCta?: boolean;
}

export function FloatingScanBar({
  isRateLimited = false,
  onRateLimit,
  onOpenFeedback,
  onOpenScanModal,
  isPro = false,
  notebooksCount = 0,
  onOpenPaywall,
  hideQuotaCta = false,
}: FloatingScanBarProps) {
  const router = useRouter();

  const handleScanClick = () => {
    if (isRateLimited) {
      if (onRateLimit) onRateLimit();
      return;
    }
    if (onOpenScanModal) {
      onOpenScanModal();
      return;
    }
    router.push("/dashboard/new");
  };

  return (
    <div className="fixed bottom-5 left-0 right-0 max-w-md mx-auto px-4 flex flex-col items-center z-30 pointer-events-auto">
      {/* Gros CTA Achat / Quota violet sans badge encombrant */}
      {!isPro && !hideQuotaCta && onOpenPaywall && (
        <div
          onClick={onOpenPaywall}
          className="w-full mb-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#4457f4] via-violet-600 to-indigo-700 border border-violet-400/40 text-white flex items-center justify-between shadow-2xl hover:brightness-105 transition-all cursor-pointer active:scale-[0.99] select-none"
        >
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
            <div className="truncate text-left">
              <div className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                {notebooksCount >= 2
                  ? "Débloque tes cours"
                  : notebooksCount === 1
                  ? "1/2 cours gratuit utilisé"
                  : "2 cours gratuits offerts"}
              </div>
              <div className="text-[11px] text-violet-100/90 truncate mt-0.5 font-medium">
                {notebooksCount >= 2
                  ? "Accès illimité à vie à 9,99€"
                  : "Passe en illimité à vie pour 9,99€"}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-violet-950 bg-white hover:bg-violet-50 px-3.5 py-2 rounded-xl shrink-0 ml-2 shadow-md transition">
            {notebooksCount >= 2 ? "Débloquer →" : "Passer en Pro →"}
          </span>
        </div>
      )}

      {/* Barre d'action Caméra, Nouveau cours & Feedback */}
      <div className="w-full flex items-center justify-center gap-2.5">
        <button
          onClick={handleScanClick}
          className="w-12 h-12 rounded-full bg-white border border-zinc-200 text-black flex items-center justify-center shadow-xl active:scale-95 hover:bg-zinc-100 transition shrink-0 cursor-pointer"
          aria-label="Prendre une photo"
        >
          <Camera className="w-5 h-5 text-black" />
        </button>

        <button
          onClick={handleScanClick}
          className="flex-1 h-12 px-5 rounded-full bg-black border border-black text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 hover:bg-zinc-800 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau cours</span>
        </button>

        {onOpenFeedback && (
          <button
            onClick={onOpenFeedback}
            className="relative w-12 h-12 rounded-full bg-white border border-zinc-200 text-black flex items-center justify-center shadow-xl active:scale-95 hover:bg-zinc-100 transition shrink-0 cursor-pointer"
            aria-label="Donner son avis"
            title="Donner son avis sur Loreno"
          >
            <MessageSquare className="w-5 h-5 text-black" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4457f4] opacity-40"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#4457f4] text-white text-[9px] font-bold items-center justify-center border-2 border-white">
                1
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
