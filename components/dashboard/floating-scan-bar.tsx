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
  isReferralTrial?: boolean;
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
  isReferralTrial = false,
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
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] left-0 right-0 max-w-md mx-auto px-4 flex flex-col items-center z-30 pointer-events-auto">
      {/* Banner 3 Jours Pro Parrainage avec option d'achat */}
      {isReferralTrial && onOpenPaywall && (
        <div
          onClick={onOpenPaywall}
          className="w-full mb-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 border border-indigo-500/40 text-white flex items-center justify-between shadow-2xl hover:brightness-105 transition-all cursor-pointer active:scale-[0.99] select-none"
        >
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            </div>
            <div className="truncate text-left">
              <div className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                🎁 3 jours Pro offerts actifs !
              </div>
              <div className="text-[11px] text-indigo-200 truncate mt-0.5 font-medium">
                Accès illimité • Loreno Pro 9,99 €/mois
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-xl shrink-0 ml-2 shadow-md transition">
            Loreno Pro →
          </span>
        </div>
      )}

      {/* Gros CTA Achat / Quota violet sans badge encombrant pour compte gratuit */}
      {!isPro && !isReferralTrial && !hideQuotaCta && onOpenPaywall && (
        <div
          onClick={onOpenPaywall}
          className="w-full mb-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-brand via-brand-hover to-indigo-700 border border-brand/40 text-white flex items-center justify-between shadow-2xl hover:brightness-105 transition-all cursor-pointer active:scale-[0.99] select-none"
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
                  ? "Accès illimité avec Loreno Pro (9,99€/mois)"
                  : "Passe en illimité avec Loreno Pro (9,99€/mois)"}
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
          className="w-13 h-13 rounded-full bg-white border border-zinc-200 border-b-3 border-b-zinc-300 text-black flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.1)] active:border-b active:translate-y-0.5 hover:bg-zinc-50 transition-all duration-100 shrink-0 cursor-pointer select-none"
          aria-label="Prendre une photo"
        >
          <Camera className="w-5 h-5 text-black stroke-[2.2]" />
        </button>

        <button
          onClick={handleScanClick}
          className="flex-1 h-14 px-5 rounded-full bg-neutral-900 border-t-2 border-white/30 border-b-4 border-b-black text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)] active:border-b-0 active:translate-y-1 hover:bg-neutral-800 transition-all duration-100 cursor-pointer select-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="tracking-wide">Nouveau cours</span>
        </button>

        {onOpenFeedback && (
          <button
            onClick={onOpenFeedback}
            className="relative w-13 h-13 rounded-full bg-white border border-zinc-200 border-b-3 border-b-zinc-300 text-black flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.1)] active:border-b active:translate-y-0.5 hover:bg-zinc-50 transition-all duration-100 shrink-0 cursor-pointer select-none"
            aria-label="Donner son avis"
            title="Donner son avis sur Loreno"
          >
            <MessageSquare className="w-5 h-5 text-black stroke-[2.2]" />
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
