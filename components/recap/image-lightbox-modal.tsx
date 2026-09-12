"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string | null;
  alt: string;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  src,
  alt,
}: ImageLightboxModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition active:scale-95 border border-zinc-700 shadow-lg"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[88vh] w-full flex flex-col items-center select-none"
      >
        <div className="relative w-full h-[75vh] flex items-center justify-center">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain rounded-xl"
            unoptimized
          />
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 font-medium text-center mt-3 bg-zinc-900/80 px-4 py-1.5 rounded-full border border-zinc-800">
          {alt}
        </p>
      </div>
    </div>
  );
}
