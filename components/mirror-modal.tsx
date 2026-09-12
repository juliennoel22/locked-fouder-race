"use client";

import { X, ZoomIn, Eye } from "lucide-react";
import { Button } from "./ui/button";

interface MirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  deckTitle: string;
}

export function MirrorModal({
  isOpen,
  onClose,
  imageUrl,
  deckTitle,
}: MirrorModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[90dvh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/90">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-zinc-200 truncate max-w-[220px]">
              {deckTitle || "Note originale"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full w-8 h-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Image Container with Scroll/Zoom */}
        <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-zinc-950/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Note de cours originale"
            className="max-w-full max-h-full object-contain rounded-xl shadow-lg select-none"
          />
        </div>

        {/* Bottom hint in thumb zone */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/90 text-center">
          <Button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm"
          >
            Retourner aux flashcards
          </Button>
        </div>
      </div>
    </div>
  );
}
