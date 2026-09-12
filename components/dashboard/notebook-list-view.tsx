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
  const [filter, setFilter] = useState<string>("all");
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

      {/* Filtres horizontaux (Tous, Mes cours, Partagés, Téléchargés) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs font-medium">
        {[
          { id: "all", label: "Tous" },
          { id: "mine", label: "Mes carnets" },
          { id: "shared", label: "Partagés" },
          { id: "downloaded", label: "Téléchargés" },
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setFilter(pill.id)}
            className={`px-4 py-1.5 rounded-full transition shrink-0 ${
              filter === pill.id
                ? "bg-black text-white font-semibold"
                : "bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-200"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Liste des cartes de carnets (Style capture d'écran, 100% monochrome blanc/noir) */}
      <div className="space-y-2.5 pt-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-2xl space-y-2">
            <p>Aucun carnet ne correspond à ta recherche.</p>
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
