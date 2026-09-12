"use client";

import { Camera, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { NotebookItem } from "@/types/loreno";

interface FloatingScanBarProps {
  onNewNotebook?: (item: NotebookItem) => void;
  isRateLimited?: boolean;
  onRateLimit?: () => void;
}

export function FloatingScanBar({
  isRateLimited = false,
  onRateLimit,
}: FloatingScanBarProps) {
  const router = useRouter();

  const handleScanClick = () => {
    if (isRateLimited) {
      if (onRateLimit) onRateLimit();
      return;
    }
    router.push("/dashboard/new");
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 flex items-center justify-center gap-2.5 z-40 pointer-events-auto">
      <button
        onClick={handleScanClick}
        className="w-12 h-12 rounded-full bg-white border border-zinc-200 text-black flex items-center justify-center shadow-xl active:scale-95 hover:bg-zinc-100 transition"
        aria-label="Prendre une photo"
      >
        <Camera className="w-5 h-5 text-black" />
      </button>

      <button
        onClick={handleScanClick}
        className="h-12 px-5 rounded-full bg-black border border-black text-white font-semibold text-xs flex items-center gap-2 shadow-xl active:scale-95 hover:bg-zinc-800 transition"
      >
        <Plus className="w-4 h-4" />
        <span>Nouveau carnet</span>
      </button>
    </div>
  );
}
