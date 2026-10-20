"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfileModal } from "./user-profile-modal";
import { NotebookListItem } from "./notebook-list-item";

interface NotebookListViewProps {
  notebooks: NotebookItem[];
  onSelectNotebook: (nb: NotebookItem) => void;
  onOpenPaywall: () => void;
  onOpenReferral?: () => void;
  isPro?: boolean;
  isReferralTrial?: boolean;
  proUntil?: string | null;
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
  isReferralTrial = false,
  proUntil,
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
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un cours ou une matière..."
          className="pl-9 pr-9 bg-card shadow-2xs"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Effacer la recherche"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Filtres par Matière (Pills horizontaux avec padding pour éviter tout découpage d'ombre) */}
      {subjects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto px-1 py-1.5 -mx-1 scrollbar-none text-xs">
          <Button
            type="button"
            size="sm"
            variant={selectedSubject === "all" ? "default" : "outline"}
            onClick={() => setSelectedSubject("all")}
            className="rounded-full px-4 font-bold shrink-0 shadow-xs"
          >
            Tous ({notebooks.length})
          </Button>
          {subjects.map((subj) => {
            const count = notebooks.filter((n) => n.subject === subj).length;
            const isSelected = selectedSubject.toLowerCase() === subj.toLowerCase();
            return (
              <Button
                key={subj}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => setSelectedSubject(subj)}
                className="rounded-full px-4 font-medium shrink-0 shadow-xs"
              >
                {subj} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* SECTION MES COURS */}
      <section className="space-y-2.5 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
            Mes cours ({filteredNotebooks.length})
          </span>
          {isPro && (
            <Badge variant="default" size="sm" className="bg-brand text-white border-transparent">
              ⭐ Illimité
            </Badge>
          )}
        </div>

        <div className="space-y-2.5 pb-20">
          {filteredNotebooks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-2xl space-y-3 bg-card/50 flex flex-col items-center justify-center">
              <div>
                <p className="font-semibold text-foreground">Aucun cours trouvé</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {searchQuery
                    ? `Aucun cours ne correspond à "${searchQuery}".`
                    : "Scanne un nouveau cours pour commencer."}
                </p>
              </div>
              {!searchQuery && (
                <Button
                  type="button"
                  onClick={handleScanAction}
                  size="default"
                  className="gap-1.5 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Scanner mon premier cours</span>
                </Button>
              )}
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
        isReferralTrial={isReferralTrial}
        proUntil={proUntil}
        notebooksCount={notebooks.length}
        onOpenPaywall={onOpenPaywall}
      />
    </div>
  );
}

