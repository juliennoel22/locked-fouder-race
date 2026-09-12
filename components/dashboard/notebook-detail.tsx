"use client";

import { useState } from "react";
import { ArrowLeft, FileText, Sparkles, HelpCircle, Lock, BookOpen } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { FlashcardPlayer } from "@/components/flashcard-player";

interface NotebookDetailProps {
  notebook: NotebookItem;
  onBack: () => void;
  onOpenPaywall: () => void;
}

export function NotebookDetail({
  notebook,
  onBack,
  onOpenPaywall,
}: NotebookDetailProps) {
  const [activeTab, setActiveTab] = useState<"flashcards" | "synthese" | "tuteur" | "examen">("flashcards");
  const [tuteurInput, setTuteurInput] = useState("");
  const [tuteurMessages, setTuteurMessages] = useState<Array<{ sender: "ia" | "user"; text: string }>>([
    {
      sender: "ia",
      text: `Bonjour ! Je suis ton tuteur d'examen sur "${notebook.title}". Pose-moi une question sur tes notes ou demande-moi de tester tes connaissances.`,
    },
  ]);

  const handleSendTuteur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tuteurInput.trim()) return;

    const userQuestion = tuteurInput;
    setTuteurInput("");
    setTuteurMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);

    setTimeout(() => {
      onOpenPaywall();
    }, 600);
  };

  return (
    <div className="w-full flex-1 flex flex-col select-none">
      {/* Header avec retour */}
      <header className="w-full pt-1 flex items-center justify-between h-12 border-b border-zinc-200 pb-2 mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black transition p-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mes carnets</span>
        </button>

        <button
          onClick={onOpenPaywall}
          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black text-white hover:bg-zinc-800 transition"
        >
          PRO
        </button>
      </header>

      {/* Titre & Matière du Carnet */}
      <div className="space-y-1 mb-4 text-left">
        <div className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
          <span>{notebook.emoji}</span>
          <span className="truncate">{notebook.title}</span>
        </div>
        <p className="text-xs text-zinc-500">
          {notebook.subject} • {notebook.deck.flashcards.length} fiches
        </p>
      </div>

      {/* Barre de sélection des différentes options du Notebook */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-zinc-200 mb-5 text-xs font-medium">
        <button
          onClick={() => setActiveTab("flashcards")}
          className={`px-3.5 py-1.5 rounded-full transition shrink-0 ${
            activeTab === "flashcards"
              ? "bg-black text-white font-semibold"
              : "bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-200"
          }`}
        >
          Flashcards ({notebook.deck.flashcards.length})
        </button>

        <button
          onClick={() => setActiveTab("synthese")}
          className={`px-3.5 py-1.5 rounded-full transition shrink-0 ${
            activeTab === "synthese"
              ? "bg-black text-white font-semibold"
              : "bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-200"
          }`}
        >
          Synthèse 80/20
        </button>

        <button
          onClick={() => setActiveTab("tuteur")}
          className={`px-3.5 py-1.5 rounded-full transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "tuteur"
              ? "bg-black text-white font-semibold"
              : "bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-200"
          }`}
        >
          <span>Tuteur IA</span>
        </button>

        <button
          onClick={() => setActiveTab("examen")}
          className={`px-3.5 py-1.5 rounded-full transition shrink-0 flex items-center gap-1.5 ${
            activeTab === "examen"
              ? "bg-black text-white font-semibold"
              : "bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-200"
          }`}
        >
          <span>Examen Blanc</span>
        </button>
      </div>

      {/* OPTION 1 : FLASHCARDS (disponible immédiatement) */}
      {activeTab === "flashcards" && (
        <div className="w-full">
          <FlashcardPlayer
            cards={notebook.deck.flashcards}
            deckTitle={notebook.deck.title}
            subject={notebook.deck.subject}
            imageUrl={notebook.imageUrl}
            initialQuizQuestion={notebook.deck.initial_quiz_question}
            summary={notebook.deck.summary}
          />
        </div>
      )}

      {/* OPTION 2 : SYNTHÈSE 80/20 */}
      {activeTab === "synthese" && (
        <div className="w-full space-y-4 text-left">
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500" />
                <span>Synthèse essentielle (Loi des 80/20)</span>
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">Lecture : 2 min</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
              {notebook.deck.summary || "Aucun résumé disponible pour ce carnet."}
            </p>
          </div>

          <button
            onClick={() => setActiveTab("flashcards")}
            className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            <span>Tester ma rétention avec les flashcards</span>
          </button>
        </div>
      )}

      {/* OPTION 3 : TUTEUR IA D'EXAMEN */}
      {activeTab === "tuteur" && (
        <div className="w-full flex-1 flex flex-col justify-between space-y-4 text-left">
          <div className="space-y-3">
            {tuteurMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === "ia"
                    ? "bg-zinc-100 border border-zinc-200 text-zinc-800 self-start"
                    : "bg-black text-white font-medium ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendTuteur} className="pt-4 flex gap-2">
            <input
              type="text"
              value={tuteurInput}
              onChange={(e) => setTuteurInput(e.target.value)}
              placeholder="Pose une question sur ton cours..."
              className="flex-1 h-12 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition"
            />
            <button
              type="submit"
              className="h-12 px-5 rounded-xl bg-black text-white font-semibold text-xs hover:bg-zinc-800 transition shrink-0"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}

      {/* OPTION 4 : EXAMEN BLANC */}
      {activeTab === "examen" && (
        <div className="w-full space-y-4 text-left">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black">Diagnostic d&apos;examen</span>
              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-200 px-2 py-0.5 rounded-full border border-zinc-300">
                Partiel
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Question type identifiée par l&apos;IA pour ce cours :
            </p>
            <div className="p-3.5 rounded-xl bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-900 italic">
              &laquo; {notebook.deck.initial_quiz_question || "Quels sont les points clés de ce cours ?"} &raquo;
            </div>
            <button
              onClick={onOpenPaywall}
              className="w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Voir le corrigé officiel et la grille de notation (9,99 €)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
