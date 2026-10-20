"use client";

import { Play, Trash2 } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NotebookListItemProps {
  notebook: NotebookItem;
  onSelect: (nb: NotebookItem) => void;
  onDelete?: (id: string) => void;
}

export function NotebookListItem({ notebook, onSelect, onDelete }: NotebookListItemProps) {
  const progress = notebook.progress_percent || 0;

  return (
    <Card
      onClick={() => onSelect(notebook)}
      className="w-full p-4 hover:border-brand/40 transition-all duration-150 flex flex-col gap-3 active:scale-[0.985] cursor-pointer hover:shadow-md group select-none"
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 text-left truncate flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-muted to-muted/60 border border-border flex items-center justify-center text-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            {notebook.emoji}
          </div>
          <div className="truncate space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" size="sm">
                {notebook.subject || "Général"}
              </Badge>
              {notebook.isDemo && (
                <Badge variant="warning" size="sm">
                  Démo
                </Badge>
              )}
            </div>
            <h2 className="text-sm font-bold text-foreground tracking-tight truncate">
              {notebook.title}
            </h2>
            <p className="text-[11px] text-muted-foreground font-medium">
              {notebook.sourceCount} notions • {notebook.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {onDelete && !notebook.isDemo && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof window !== "undefined" && window.confirm(`Supprimer le cours "${notebook.title}" ?`)) {
                  onDelete(notebook.id);
                }
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Supprimer ce cours"
              aria-label="Supprimer ce cours"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="bg-[#4457f4] text-white hover:bg-[#3345de] gap-1.5 font-bold shadow-xs shadow-indigo-500/25 border-transparent px-3"
          >
            <Play className="w-3 h-3 fill-white text-white" />
            <span className="text-xs font-bold text-white">Réviser</span>
          </Button>
        </div>
      </div>

      {/* Barre de progression de maîtrise tactile */}
      <div className="w-full space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-[10px] font-medium px-0.5">
          <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">Maîtrise</span>
          <span className="font-mono font-bold text-foreground tabular-nums">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full bg-gradient-to-r from-brand to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
