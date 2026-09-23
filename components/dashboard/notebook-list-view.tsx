"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { Header } from "@/components/Header";
import { UserProfileModal } from "./user-profile-modal";
import { NotebookListItem } from "./notebook-list-item";

interface NotebookListViewProps {
  notebooks: NotebookItem[];
  onSelectNotebook: (nb: NotebookItem) => void;
  onOpenPaywall: () => void;
  onOpenReferral?: () => void;
  isPro?: boolean;
  userEmail?: string | null;
  onDeleteNotebook?: (id: string) => void;
  onActionClick?: (mode: "flashcards" | "quiz" | "tutor") => void;
  onOpenScanModal?: () => void;
}

export function NotebookListView({
  notebooks,
  onSelectNotebook,
  onOpenPaywall,
  onOpenReferral,
  isPro = false,
  userEmail,
  onDeleteNotebook,
  onOpenScanModal,
}: NotebookListViewProps) {
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Liste dynamique des matières pour les filtres
  const subjects = useMemo(() => {
    const set = new Set<string>();
    notebooks.forEach((nb) => {
      if (nb.subject?.trim()) set.add(nb.subject.trim());
    });
    return Array.from(set);
  }, [notebooks]);

  // Filtrage en temps réel
  const filteredNotebooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notebooks.filter((nb) => {
      const matchSubject =
        selectedSubject === "all" ||
        nb.subject?.toLowerCase() === selectedSubject.toLowerCase();
      const matchQuery =
        !q ||
        nb.title.toLowerCase().includes(q) ||
        (nb.subject && nb.subject.toLowerCase().includes(q));
      return matchSubject && matchQuery;
    });
  }, [notebooks, searchQuery, selectedSubject]);

  const handleScanAction = () => {
    if (onOpenScanModal) {
      onOpenScanModal();
    } else {
      router.push("/quiz");
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 select-none pb-28">
      {/* Header unifié avec Pastille PRO dorée, Affiliation & Profil */}
      <Header
        showProfile={true}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenPaywall={onOpenPaywall}
        onOpenReferral={onOpenReferral}
      />

      {/* Barre de Recherche en temps réel */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un cours ou une matière..."
          className="w-full h-11 pl-10 pr-9 rounded-xl border border-zinc-200 bg-zinc-50/70 focus:bg-white focus:border-black text-xs text-black placeholder:text-zinc-400 focus:outline-none transition shadow-2xs"
          style={{ fontSize: "16px" }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black p-1"
            aria-label="Effacer la recherche"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filtres par Matière (Pills horizontaux) */}
      {subjects.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedSubject("all")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              selectedSubject === "all"
                ? "bg-black text-white shadow-2xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Tous ({notebooks.length})
          </button>
          {subjects.map((subj) => {
            const count = notebooks.filter((n) => n.subject === subj).length;
            const isSelected = selectedSubject.toLowerCase() === subj.toLowerCase();
            return (
              <button
                key={subj}
                type="button"
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? "bg-black text-white shadow-2xs font-bold"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {subj} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* SECTION MES COURS */}
      <section className="space-y-2.5 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
            Mes cours ({filteredNotebooks.length})
          </span>
          {isPro && (
            <span className="text-[10px] font-bold text-[#4457f4] bg-[#4457f4]/10 border border-[#4457f4]/30 px-2 py-0.5 rounded-lg">
              ⭐ Illimité
            </span>
          )}
        </div>

        <div className="space-y-2.5 pb-20">
          {filteredNotebooks.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs border border-dashed border-zinc-300 rounded-2xl space-y-2 bg-zinc-50/50">
              <p className="font-semibold text-zinc-700">Aucun cours trouvé</p>
              <p className="text-[11px] text-zinc-400">
                {searchQuery
                  ? `Aucun cours ne correspond à "${searchQuery}".`
                  : "Scanne un nouveau cours pour commencer."}
              </p>
            </div>
          ) : (
            filteredNotebooks.map((nb) => (
              <NotebookListItem
                key={nb.id}
                notebook={nb}
                onSelect={(item) => onSelectNotebook(item)}
                onDelete={onDeleteNotebook}
              />
            ))
          )}
        </div>
      </section>

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userEmail={userEmail}
        isPro={isPro}
        notebooksCount={notebooks.length}
        onOpenPaywall={onOpenPaywall}
      />
    </div>
  );
}

