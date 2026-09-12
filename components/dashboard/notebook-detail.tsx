"use client";

import { useState } from "react";
import { ArrowLeft, FileText, Sparkles, CheckCircle2, Lock, Layers } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { FlashcardPlayer } from "@/components/flashcard-player";
import { NotebookSummaryView } from "./notebook-summary-view";
import { NotebookQuizView } from "./notebook-quiz-view";

import { AiTutorModal } from "./ai-tutor-modal";

interface NotebookDetailProps {
  notebook: NotebookItem;
  onBack: () => void;
  onOpenPaywall: () => void;
  isPro?: boolean;
}

type NotebookMode = "grid" | "flashcards" | "fiche" | "quiz";

export function NotebookDetail({
  notebook,
  onBack,
  onOpenPaywall,
  isPro = false,
}: NotebookDetailProps) {
  const [mode, setMode] = useState<NotebookMode>("grid");
  const [showAiTutor, setShowAiTutor] = useState<boolean>(false);

  return (
    <div className="w-full flex-1 flex flex-col select-none pb-20">
      {/* Header avec bouton retour contextuel & PRO */}
      <header className="w-full pt-1 flex items-center justify-between h-12 border-b border-zinc-200 pb-2 mb-4">
        <button
          onClick={() => {
            if (mode === "grid") onBack();
            else setMode("grid");
          }}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition p-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{mode === "grid" ? "Mes carnets" : "Menu du carnet"}</span>
        </button>

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
      </header>

      {/* Titre & Matière du Carnet */}
      <div className="space-y-1 mb-5 text-left">
        <div className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
          <span>{notebook.emoji}</span>
          <span className="truncate">{notebook.title}</span>
        </div>
        <p className="text-xs text-zinc-500">
          {notebook.subject} • {notebook.deck.flashcards.length} fiches
        </p>
      </div>

      {/* VUE 1 : GRILLE 2x2 (Menu principal du carnet) */}
      {mode === "grid" && (
        <div className="flex-1 flex flex-col justify-center space-y-4 my-auto py-2">
          <div className="grid grid-cols-2 gap-3.5">
            {/* TUILLE 1 : FLASHCARDS */}
            <button
              onClick={() => setMode("flashcards")}
              className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition active:scale-[0.98] text-left flex flex-col justify-between h-36 sm:h-40 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-black">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-black">Flashcards</h3>
                <p className="text-[11px] text-zinc-500">
                  {notebook.deck.flashcards.length} cartes • Swipe 3D
                </p>
              </div>
            </button>

            {/* TUILLE 2 : FICHE DE RÉVISION */}
            <button
              onClick={() => setMode("fiche")}
              className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition active:scale-[0.98] text-left flex flex-col justify-between h-36 sm:h-40 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-black">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-black">Fiche révision</h3>
                <p className="text-[11px] text-zinc-500">
                  Synthèse essentielle du cours
                </p>
              </div>
            </button>

            {/* TUILLE 3 : QUIZ */}
            <button
              onClick={() => setMode("quiz")}
              className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition active:scale-[0.98] text-left flex flex-col justify-between h-36 sm:h-40 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-black">Quiz examen</h3>
                <p className="text-[11px] text-zinc-500">
                  Questions pièges &amp; score
                </p>
              </div>
            </button>

            {/* TUILLE 4 : ASSISTANT IA */}
            <button
              onClick={() => {
                if (isPro) setShowAiTutor(true);
                else onOpenPaywall();
              }}
              className="p-4 rounded-2xl border border-black bg-black text-white hover:bg-zinc-800 transition active:scale-[0.98] text-left flex flex-col justify-between h-36 sm:h-40 group shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                {isPro ? (
                  <span className="px-2 py-0.5 rounded-full bg-white text-black font-bold text-[10px] flex items-center gap-1">
                    ACTIF
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-white text-black font-bold text-[10px] flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    PRO
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">Assistant IA</h3>
                <p className="text-[11px] text-zinc-400">
                  {isPro ? "Tuteur d'examen 24/7" : "Débloquer le tuteur 24/7"}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* VUE 2 : MODE FLASHCARDS */}
      {mode === "flashcards" && (
        <div className="w-full">
          <FlashcardPlayer
            cards={notebook.deck.flashcards}
            deckTitle={notebook.deck.title}
            subject={notebook.deck.subject}
            imageUrl={notebook.imageUrl}
            initialQuizQuestion={notebook.deck.initial_quiz_question}
            summary={notebook.deck.summary}
            disablePaywall={true}
          />
        </div>
      )}

      {/* VUE 3 : MODE FICHE DE RÉVISION */}
      {mode === "fiche" && (
        <NotebookSummaryView
          title={notebook.deck.title}
          subject={notebook.deck.subject}
          summary={notebook.deck.summary}
          onTestFlashcards={() => setMode("flashcards")}
        />
      )}

      {/* VUE 4 : MODE QUIZ QCM */}
      {mode === "quiz" && (
        <NotebookQuizView
          deck={notebook.deck}
          onOpenPaywall={onOpenPaywall}
          onGoToFlashcards={() => setMode("flashcards")}
        />
      )}

      {/* NAVBAR FIXE EN BAS DE PAGE */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 max-w-md mx-auto">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={() => {
              if (mode === "grid") onBack();
              else setMode("grid");
            }}
            className="flex flex-col items-center justify-center w-16 h-full text-zinc-500 hover:text-black transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">
              {mode === "grid" ? "Carnets" : "Menu"}
            </span>
          </button>

          <button
            onClick={() => setMode("flashcards")}
            className={`flex flex-col items-center justify-center w-16 h-full transition ${
              mode === "flashcards" ? "text-black font-bold" : "text-zinc-500 hover:text-black"
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Fiches</span>
          </button>

          <button
            onClick={() => setMode("fiche")}
            className={`flex flex-col items-center justify-center w-16 h-full transition ${
              mode === "fiche" ? "text-black font-bold" : "text-zinc-500 hover:text-black"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Synthèse</span>
          </button>

          <button
            onClick={() => setMode("quiz")}
            className={`flex flex-col items-center justify-center w-16 h-full transition ${
              mode === "quiz" ? "text-black font-bold" : "text-zinc-500 hover:text-black"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Quiz</span>
          </button>

          <button
            onClick={() => {
              if (isPro) setShowAiTutor(true);
              else onOpenPaywall();
            }}
            className="flex flex-col items-center justify-center w-16 h-full text-zinc-500 hover:text-black transition"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">{isPro ? "Tuteur" : "PRO"}</span>
          </button>
        </div>
      </nav>

      {/* Modal Tuteur IA pour les membres ayant le Pack Fondateur */}
      <AiTutorModal
        isOpen={showAiTutor}
        onClose={() => setShowAiTutor(false)}
        notebook={notebook}
      />
    </div>
  );
}
