"use client";

import { useState } from "react";
import { ArrowLeft, FileText, Sparkles, HelpCircle, Lock, Layers, Send } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState<"flashcards" | "synthese" | "tuteur">("flashcards");
  const [tuteurInput, setTuteurInput] = useState("");
  const [tuteurMessages, setTuteurMessages] = useState<Array<{ sender: "ia" | "user"; text: string }>>([
    {
      sender: "ia",
      text: `Bonjour ! Je suis ton tuteur d'examen sur "${notebook.title}". Pose-moi une question sur tes notes ou demande-moi de tester tes connaissances.`,
    },
  ]);

  const scrollTo = (id: string, tab: "flashcards" | "synthese" | "tuteur") => {
    setActiveSection(tab);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
    <div className="w-full flex-1 flex flex-col select-none pb-24">
      {/* Header avec retour & PRO */}
      <header className="w-full pt-1 flex items-center justify-between h-12 border-b border-zinc-200 pb-2 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black transition p-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mes carnets</span>
        </button>

        <button
          onClick={onOpenPaywall}
          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black text-white hover:bg-zinc-800 transition"
        >
          PRO
        </button>
      </header>

      {/* Titre & Matière du Carnet */}
      <div className="space-y-1 mb-6 text-left">
        <div className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
          <span>{notebook.emoji}</span>
          <span className="truncate">{notebook.title}</span>
        </div>
        <p className="text-xs text-zinc-500">
          {notebook.subject} • {notebook.deck.flashcards.length} fiches de révision
        </p>
      </div>

      {/* SECTION 1 : FLASHCARDS (Tout sur une page) */}
      <section id="section-flashcards" className="w-full mb-10 scroll-mt-4">
        <FlashcardPlayer
          cards={notebook.deck.flashcards}
          deckTitle={notebook.deck.title}
          subject={notebook.deck.subject}
          imageUrl={notebook.imageUrl}
          initialQuizQuestion={notebook.deck.initial_quiz_question}
          summary={notebook.deck.summary}
          disablePaywall={true}
        />
      </section>

      {/* SÉPARATEUR */}
      <div className="w-full h-px bg-zinc-200 mb-8" />

      {/* SECTION 2 : SYNTHÈSE 80/20 (Tout sur une page) */}
      <section id="section-synthese" className="w-full space-y-4 text-left mb-10 scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-black flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            <span>Synthèse essentielle (Loi des 80/20)</span>
          </h2>
          <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            Lecture : 2 min
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
          <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
            {notebook.deck.summary || "Synthèse en cours de traitement pour ce cours."}
          </p>
        </div>
      </section>

      {/* SÉPARATEUR */}
      <div className="w-full h-px bg-zinc-200 mb-8" />

      {/* SECTION 3 : QUESTION D'EXAMEN & TUTEUR IA (Tout sur une page) */}
      <section id="section-tuteur" className="w-full space-y-4 text-left scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-black flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-500" />
            <span>Tuteur IA &amp; Examen Blanc</span>
          </h2>
          <span className="text-[10px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200 font-medium">
            Entraînement
          </span>
        </div>

        {/* Bloc Question type */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
          <p className="text-xs text-zinc-600">Question type identifiée pour tes partiels :</p>
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-900 italic font-medium">
            &laquo; {notebook.deck.initial_quiz_question || "Quels sont les points clés de ce cours ?"} &raquo;
          </div>
          <button
            onClick={onOpenPaywall}
            className="w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Débloquer le corrigé officiel et la grille (9,99 €)</span>
          </button>
        </div>

        {/* Chat interactif Tuteur */}
        <div className="space-y-3 pt-2">
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

        <form onSubmit={handleSendTuteur} className="pt-2 flex gap-2">
          <input
            type="text"
            value={tuteurInput}
            onChange={(e) => setTuteurInput(e.target.value)}
            placeholder="Pose une question à ton tuteur..."
            className="flex-1 h-12 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition"
          />
          <button
            type="submit"
            className="h-12 px-4 rounded-xl bg-black text-white font-semibold text-xs hover:bg-zinc-800 transition shrink-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* NAVBAR FIXE EN BAS DE PAGE (Thumb Zone, ultra simple, monochrome) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 max-w-md mx-auto">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={onBack}
            className="flex flex-col items-center justify-center w-16 h-full text-zinc-500 hover:text-black transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Carnets</span>
          </button>

          <button
            onClick={() => scrollTo("section-flashcards", "flashcards")}
            className={`flex flex-col items-center justify-center w-16 h-full transition ${
              activeSection === "flashcards" ? "text-black font-bold" : "text-zinc-500 hover:text-black"
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Fiches</span>
          </button>

          <button
            onClick={() => scrollTo("section-synthese", "synthese")}
            className={`flex flex-col items-center justify-center w-16 h-full transition ${
              activeSection === "synthese" ? "text-black font-bold" : "text-zinc-500 hover:text-black"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Synthèse</span>
          </button>

          <button
            onClick={() => scrollTo("section-tuteur", "tuteur")}
            className={`flex flex-col items-center justify-center w-16 h-full transition ${
              activeSection === "tuteur" ? "text-black font-bold" : "text-zinc-500 hover:text-black"
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Tuteur</span>
          </button>

          <button
            onClick={onOpenPaywall}
            className="flex flex-col items-center justify-center w-16 h-full text-zinc-500 hover:text-black transition"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">PRO</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
