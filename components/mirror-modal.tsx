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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[85dvh] flex flex-col bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-semibold text-black truncate max-w-[220px]">
              {deckTitle || "Note originale"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-black transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image / PDF Document Container */}
        <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-zinc-100">
          {imageUrl.startsWith("data:application/pdf") ||
          imageUrl.toLowerCase().includes(".pdf") ? (
            <iframe
              src={imageUrl}
              title="Document PDF original"
              className="w-full h-full rounded-xl border-0 shadow-md bg-white"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt="Note de cours originale"
              className="max-w-full max-h-full object-contain rounded-xl shadow-md select-none"
            />
          )}
        </div>

        {/* Bottom hint in thumb zone */}
        <div className="p-4 border-t border-zinc-200 bg-white text-center">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs transition"
          >
            Retourner aux flashcards
          </button>
        </div>
      </div>
    </div>
  );
}
