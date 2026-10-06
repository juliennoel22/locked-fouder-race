"use client";

import { Camera, Upload } from "lucide-react";

interface MirrorFooterProps {
  onTakePhoto: () => void;
  onUploadPdf: () => void;
  onClose: () => void;
}

export function MirrorFooter({
  onTakePhoto,
  onUploadPdf,
  onClose,
}: MirrorFooterProps) {
  return (
    <div className="p-3.5 border-t border-zinc-200 bg-white space-y-2">
      <div className="flex gap-2">
        <button
          onClick={onTakePhoto}
          className="flex-1 h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Ajouter une photo</span>
        </button>

        <button
          onClick={onUploadPdf}
          className="flex-1 h-12 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Ajouter un PDF</span>
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full h-9 rounded-xl text-zinc-500 hover:text-black font-medium text-xs transition cursor-pointer"
      >
        Fermer la visionneuse
      </button>
    </div>
  );
}
