"use client";

import { Play, Trash2 } from "lucide-react";
import { NotebookItem } from "@/types/loreno";

interface NotebookListItemProps {
  notebook: NotebookItem;
  onSelect: (nb: NotebookItem) => void;
  onDelete?: (id: string) => void;
}

export function NotebookListItem({ notebook, onSelect, onDelete }: NotebookListItemProps) {
  return (
    <div
      onClick={() => onSelect(notebook)}
      className="w-full p-3.5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50/90 transition-all flex items-center justify-between active:scale-[0.99] cursor-pointer shadow-2xs hover:border-zinc-300"
    >
      <div className="flex items-center gap-3.5 text-left truncate">
        <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-lg shrink-0 shadow-2xs">
          {notebook.emoji}
        </div>
        <div className="truncate space-y-0.5">
          <h2 className="text-xs sm:text-sm font-bold text-zinc-900 truncate max-w-[190px] sm:max-w-[240px]">
            {notebook.title}
          </h2>
          <p className="text-[11px] text-zinc-500 font-medium">
            {notebook.sourceCount} fiches • {notebook.date}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {onDelete && (
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
        <div className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 hover:text-black">
          <Play className="w-3 h-3 fill-current" />
        </div>
      </div>
    </div>
  );
}
