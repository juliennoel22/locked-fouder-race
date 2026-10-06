"use client";

import { Eye, X } from "lucide-react";

interface MirrorHeaderProps {
  title: string;
  docCount: number;
  onClose: () => void;
}

export function MirrorHeader({ title, docCount, onClose }: MirrorHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 bg-zinc-50/90">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
          <Eye className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-black uppercase tracking-wider block">
              Cours original
            </span>
            {docCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-zinc-200 text-zinc-800 font-semibold">
                {docCount} page{docCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <span className="text-[11px] text-zinc-500 truncate max-w-[220px] block">
            {title}
          </span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition cursor-pointer"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
