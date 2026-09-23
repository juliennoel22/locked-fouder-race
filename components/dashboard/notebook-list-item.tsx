"use client";

import { Play, Trash2 } from "lucide-react";
import { NotebookItem } from "@/types/loreno";

interface NotebookListItemProps {
  notebook: NotebookItem;
  onSelect: (nb: NotebookItem) => void;
  onDelete?: (id: string) => void;
}

export function NotebookListItem({ notebook, onSelect, onDelete }: NotebookListItemProps) {
  const progress = notebook.progress_percent || 0;

  return (
    <div
      onClick={() => onSelect(notebook)}
      className="w-full p-3.5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50/90 transition-all flex flex-col gap-2.5 active:scale-[0.99] cursor-pointer shadow-2xs hover:border-[#4457f4]/40 group"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-left truncate flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-lg shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            {notebook.emoji}
          </div>
          <div className="truncate space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                {notebook.subject || "Général"}
              </span>
              {notebook.isDemo && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800">
                  Démo
                </span>
              )}
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
              {notebook.title}
            </h2>
            <p className="text-[11px] text-zinc-500 font-medium">
              {notebook.sourceCount} notions • {notebook.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {onDelete && !notebook.isDemo && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof window !== "undefined" && window.confirm(`Supprimer le cours "${notebook.title}" ?`)) {
                  onDelete(notebook.id);
                }
              }}
              className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition cursor-pointer"
              title="Supprimer ce cours"
              aria-label="Supprimer ce cours"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="px-2.5 py-1.5 rounded-xl bg-black text-white group-hover:bg-[#4457f4] transition-colors flex items-center gap-1 text-xs font-bold shadow-xs">
            <Play className="w-3 h-3 fill-current" />
            <span>Réviser</span>
          </div>
        </div>
      </div>

      {/* Barre de progression de maîtrise */}
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium px-0.5">
          <span>Maîtrise</span>
          <span className="font-bold text-zinc-800">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60">
          <div
            className="h-full bg-gradient-to-r from-[#4457f4] to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
