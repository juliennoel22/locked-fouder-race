"use client";

import { useState } from "react";
import { Search, User, Play, X, Sparkles } from "lucide-react";
import { NotebookItem } from "@/types/loreno";

interface NotebookListViewProps {
  notebooks: NotebookItem[];
  onSelectNotebook: (nb: NotebookItem) => void;
  onOpenPaywall: () => void;
}

export function NotebookListView({
  notebooks,
  onSelectNotebook,
  onOpenPaywall,
}: NotebookListViewProps) {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filtered = notebooks.filter((nb) => {
    const matchesSearch =
      nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nb.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 select-none pb-28">
      {/* Header Gemini Notebook / Loreno */}
      <header className="w-full pt-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black">Loreno Carnet</h1>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-zinc-500 hover:text-black transition"
            aria-label="Rechercher"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenPaywall}
            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black text-white hover:bg-zinc-800 transition"
          >
            PRO
          </button>

          <button
            onClick={onOpenPaywall}
            className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center text-zinc-600 hover:text-black transition"
            aria-label="Profil"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Barre de recherche escamotable */}
      {searchOpen && (
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un cours ou une matière..."
            autoFocus
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 pr-9 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-zinc-400 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Bouton d'accès au Pack Fondateur (Accessible dans la liste de nos notebooks) */}
      <div
        onClick={onOpenPaywall}
        className="w-full p-4 rounded-2xl border border-zinc-200 bg-black text-white hover:bg-zinc-800 transition flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-sm"
      >
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-200">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Pack Fondateur • 9,99 € à vie</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Débloque tous tes cours illimités & le Mode Examen
          </p>
        </div>
        <button
          type="button"
          className="px-3.5 py-1.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-zinc-100 transition shrink-0 ml-3"
        >
          Débloquer
        </button>
      </div>

      {/* Liste des cartes de carnets (Style capture d'écran, 100% monochrome blanc/noir) */}
      <div className="space-y-2.5 pt-1">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-xs border border-dashed border-zinc-200 rounded-2xl space-y-2 bg-zinc-50/50">
            <p className="font-semibold text-black text-sm">Aucun carnet pour le moment</p>
            <p className="text-zinc-500 max-w-xs mx-auto">
              Prends en photo un cours avec le bouton ci-dessous pour créer ton premier carnet de fiches.
            </p>
          </div>
        ) : (
          filtered.map((nb) => (
            <div
              key={nb.id}
              onClick={() => onSelectNotebook(nb)}
              className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition flex items-center justify-between active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 text-left truncate">
                <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-lg shrink-0">
                  {nb.emoji}
                </div>

                <div className="truncate space-y-0.5">
                  <h2 className="text-sm font-semibold text-black truncate max-w-[200px] sm:max-w-[240px]">
                    {nb.title}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {nb.sourceCount} fiches • {nb.date}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:text-black shrink-0 ml-2">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
