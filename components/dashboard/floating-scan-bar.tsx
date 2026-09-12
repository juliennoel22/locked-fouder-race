"use client";

import { Camera, Plus, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { NotebookItem } from "@/types/loreno";

interface FloatingScanBarProps {
  onNewNotebook?: (item: NotebookItem) => void;
  isRateLimited?: boolean;
  onRateLimit?: () => void;
  onOpenFeedback?: () => void;
  onOpenScanModal?: () => void;
}

export function FloatingScanBar({
  isRateLimited = false,
  onRateLimit,
  onOpenFeedback,
  onOpenScanModal,
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
    <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 flex items-center justify-center gap-2.5 z-40 pointer-events-auto">
      {/* Bouton Caméra */}
      <button
        onClick={handleScanClick}
        className="w-12 h-12 rounded-full bg-white border border-zinc-200 text-black flex items-center justify-center shadow-xl active:scale-95 hover:bg-zinc-100 transition shrink-0"
        aria-label="Prendre une photo"
      >
        <Camera className="w-5 h-5 text-black" />
      </button>

      {/* Bouton Nouveau cours */}
      <button
        onClick={handleScanClick}
        className="flex-1 h-12 px-5 rounded-full bg-black border border-black text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 hover:bg-zinc-800 transition"
      >
        <Plus className="w-4 h-4" />
        <span>Nouveau cours</span>
      </button>

      {/* Petit bouton d'avis avec pastille de notification */}
      {onOpenFeedback && (
        <button
          onClick={onOpenFeedback}
          className="relative w-12 h-12 rounded-full bg-white border border-zinc-200 text-black flex items-center justify-center shadow-xl active:scale-95 hover:bg-zinc-100 transition shrink-0"
          aria-label="Donner son avis"
          title="Donner son avis sur Loreno"
        >
          <MessageSquare className="w-5 h-5 text-black" />
          {/* Badge de notification avec micro-animation */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-30"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-black text-white text-[9px] font-bold items-center justify-center border-2 border-white">
              1
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
