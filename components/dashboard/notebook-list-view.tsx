"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Play, Sparkles, Trash2, Layers, FileText, CheckCircle2, Plus } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { UserProfileModal } from "./user-profile-modal";

interface NotebookListViewProps {
  notebooks: NotebookItem[];
  onSelectNotebook: (nb: NotebookItem) => void;
  onOpenPaywall: () => void;
  isPro?: boolean;
  userEmail?: string | null;
  onDeleteNotebook?: (id: string) => void;
  onActionClick?: (mode: "flashcards" | "fiche" | "quiz" | "tutor") => void;
}

export function NotebookListView({
  notebooks,
  onSelectNotebook,
  onOpenPaywall,
  isPro = false,
  userEmail,
  onDeleteNotebook,
  onActionClick,
}: NotebookListViewProps) {
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 select-none pb-28">
      {/* Header avec logo loreno.app horizontal */}
      <header className="w-full pt-1 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="loreno.app"
            width={124}
            height={30}
            className="h-6 sm:h-7 w-auto object-contain"
            priority
          />
        </div>

        <div className="flex items-center gap-2.5">
          {isPro ? (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 border border-zinc-300 text-black flex items-center gap-1">
              <span>⭐</span> FONDATEUR
            </span>
          ) : (
            <button
              onClick={onOpenPaywall}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black text-white hover:bg-zinc-800 transition"
            >
              PRO
            </button>
          )}

          <button
            onClick={() => setShowProfileModal(true)}
            className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center text-zinc-600 hover:text-black transition"
            aria-label="Profil"
            title="Mon profil et compte"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bandeau d'état compact : Quota & Accès Fondateur */}
      {!isPro ? (
        <div
          onClick={onOpenPaywall}
          className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-900 text-white hover:bg-black transition flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-xs"
        >
          <div className="flex items-center gap-2 text-xs truncate">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
            <span className="font-medium text-zinc-200 truncate">
              {notebooks.length >= 2 ? (
                <>Limite 2/2 atteinte • <strong className="text-white font-semibold">Accès illimité (9,99€)</strong></>
              ) : (
                <>{notebooks.length}/2 cours gratuits • <strong className="text-white font-semibold">Pack Fondateur à vie</strong></>
              )}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-white bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-xl shrink-0 ml-2">
            Débloquer →
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
          <span className="text-zinc-600 font-medium">
            Mes cours : <strong className="text-black font-bold">{notebooks.length}</strong> (Accès illimité)
          </span>
          <span className="text-[10px] font-bold text-black bg-zinc-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
            ⭐ Membre Fondateur
          </span>
        </div>
      )}

      {/* SECTION : CRÉER & RÉVISER (Grille 2x2 épurée) */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Créer &amp; Réviser
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* TUILE 1 : FLASHCARDS */}
          <button
            onClick={() => onActionClick?.("flashcards")}
            className="p-3 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition active:scale-[0.98] text-left flex items-center gap-2.5 shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-black shrink-0 shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-black truncate">Flashcards</span>
          </button>

          {/* TUILE 2 : FICHE RÉVISION */}
          <button
            onClick={() => onActionClick?.("fiche")}
            className="p-3 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition active:scale-[0.98] text-left flex items-center gap-2.5 shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-black shrink-0 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-black truncate">Fiche révision</span>
          </button>

          {/* TUILE 3 : QUIZ EXAMEN */}
          <button
            onClick={() => onActionClick?.("quiz")}
            className="p-3 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition active:scale-[0.98] text-left flex items-center gap-2.5 shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-black shrink-0 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-black truncate">Quiz examen</span>
          </button>

          {/* TUILE 4 : ASSISTANT IA */}
          <button
            onClick={() => {
              if (isPro) onActionClick?.("tutor");
              else onOpenPaywall();
            }}
            className="p-3 rounded-2xl border border-black bg-black text-white hover:bg-zinc-800 transition active:scale-[0.98] text-left flex items-center justify-between shadow-xs group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold text-white truncate">Assistant IA</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-md bg-white text-black font-bold text-[9px] shrink-0 ml-1">
              {isPro ? "IA" : "PRO"}
            </span>
          </button>
        </div>
      </div>

      {/* SECTION : MES COURS SCANNÉS */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Mes cours ({notebooks.length})
          </span>
        </div>

        <div className="space-y-2.5">
          {notebooks.length === 0 ? (
            <div
              onClick={() => router.push("/dashboard/new")}
              className="p-8 text-center text-zinc-500 text-xs border border-dashed border-zinc-300 rounded-2xl space-y-2 bg-zinc-50/70 hover:bg-zinc-100/80 hover:border-zinc-400 transition cursor-pointer active:scale-[0.99] group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-black mx-auto group-hover:scale-110 transition shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <p className="font-semibold text-black text-sm">Aucun carnet pour le moment</p>
              <p className="text-zinc-500 max-w-xs mx-auto">
                Appuie ici pour scanner ton premier cours ou importer un document.
              </p>
            </div>
          ) : (
            notebooks.map((nb) => (
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

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {onDeleteNotebook && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof window !== "undefined" && window.confirm(`Supprimer le carnet "${nb.title}" ?`)) {
                          onDeleteNotebook(nb.id);
                        }
                      }}
                      className="w-8 h-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 transition"
                      title="Supprimer ce carnet"
                      aria-label="Supprimer ce carnet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:text-black">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Profil & Déconnexion */}
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
