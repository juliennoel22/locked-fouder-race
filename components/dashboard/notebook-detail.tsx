"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, CheckCircle2, Layers, Eye } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { FlashcardPlayer } from "@/components/flashcard-player";
import { NotebookQuizView } from "./notebook-quiz-view";
import { AiTutorModal } from "./ai-tutor-modal";
import { MirrorModal } from "@/components/mirror-modal";
import { OnboardingTourBubble } from "./onboarding-tour-bubble";
import { getTourStep, setTourStep } from "@/lib/onboarding-tour-state";

interface NotebookDetailProps {
  notebook: NotebookItem;
  onBack: () => void;
  onOpenPaywall: () => void;
  isPro?: boolean;
  initialMode?: "grid" | "flashcards" | "quiz";
  initialShowAiTutor?: boolean;
  allNotebooks?: NotebookItem[];
  onSelectNotebook?: (nb: NotebookItem) => void;
  onOpenScanModal?: () => void;
}

type NotebookMode = "grid" | "flashcards" | "quiz";

export function NotebookDetail({
  notebook,
  onBack,
  onOpenPaywall,
  isPro = false,
  initialMode = "grid",
  initialShowAiTutor = false,
}: NotebookDetailProps) {
  const [mode, setMode] = useState<NotebookMode>(initialMode);
  const [showAiTutor, setShowAiTutor] = useState<boolean>(initialShowAiTutor);
  const [showMirrorModal, setShowMirrorModal] = useState<boolean>(false);
  const [tourStep, setTourStepState] = useState(getTourStep());

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialShowAiTutor) {
      setShowAiTutor(true);
    }
  }, [initialShowAiTutor]);

  const handleValidateToDashboard = () => {
    setTourStep("import_new");
    setTourStepState("import_new");
    onBack();
  };

  return (
    <div className="w-full flex-1 flex flex-col select-none relative">
      {/* Header avec bouton retour contextuel & PRO */}
      <header className="w-full pt-1 flex items-center justify-between h-12 border-b border-zinc-200 pb-2 mb-3">
        <button
          onClick={() => {
            if (mode === "grid") onBack();
            else setMode("grid");
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition p-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{mode === "grid" ? "Mes cours" : "Retour au cours"}</span>
        </button>

        {isPro ? (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 border border-zinc-300 text-black flex items-center gap-1">
            <span>⭐</span> PREMIUM
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

      {/* VUE 1 : ARTICLE DU COURS DÉTAILLÉ AVEC MODES EN STICKY BOTTOM */}
      {mode === "grid" && (
        <div className="flex-1 flex flex-col justify-between text-left">
          {/* Contenu textuel structuré */}
          <div className="space-y-4 pb-6">
            {/* Bannière d'onboarding : Découverte du cours complet */}
            {tourStep === "inspect_course" && (
              <OnboardingTourBubble
                show={true}
                badgeText="Voici ton cours 📖"
                title="Détails du cours & Synthèse"
                description="Retrouve ici ta synthèse complète, tes notions clés et tes modes d'apprentissage."
                arrowDirection="none"
                actionLabel="Suivant →"
                onAction={handleValidateToDashboard}
                showDismiss={false}
              />
            )}

            {/* Titre principal & Badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-700">
                  {notebook.subject || "Général"}
                </span>
                <span className="text-xs text-zinc-400">
                  {notebook.deck.flashcards.length} notions clés
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black flex items-start gap-2">
                <span className="text-2xl shrink-0">{notebook.emoji}</span>
                <span>{notebook.title}</span>
              </h1>
            </div>

            {/* Bouton Proéminent : Consulter les cours originaux */}
            <button
              type="button"
              onClick={() => setShowMirrorModal(true)}
              className="w-full py-3 px-4 rounded-2xl bg-zinc-900 text-white hover:bg-black transition active:scale-[0.99] flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Consulter le cours original</div>
                  <div className="text-[10px] text-zinc-400">
                    {notebook.imageUrl ? "Photos & documents scannés" : "Voir tous mes documents"}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-zinc-300">Ouvrir →</span>
            </button>

            {/* Section : Synthèse rapide du cours */}
            {notebook.deck.summary && (
              <section className="space-y-1.5 pt-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Synthèse du cours
                </h2>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                  <p className="whitespace-pre-line">{notebook.deck.summary}</p>
                </div>
              </section>
            )}

            {/* Section : Notions clés en résumé rapide */}
            {notebook.deck.flashcards.length > 0 && (
              <section className="space-y-1.5 pt-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Notions essentielles ({notebook.deck.flashcards.length})
                </h2>
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <ul className="space-y-1.5 text-xs text-zinc-700 list-disc list-inside">
                    {notebook.deck.flashcards.slice(0, 6).map((card, idx) => (
                      <li key={idx} className="leading-snug">
                        <strong className="text-black font-semibold">{card.front}</strong> : {card.back}
                      </li>
                    ))}
                  </ul>
                  {notebook.deck.flashcards.length > 6 && (
                    <p className="text-[11px] text-zinc-400 pt-1">
                      + {notebook.deck.flashcards.length - 6} autres notions dans les flashcards
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* STICKY BOTTOM : MODES D'ENTRAÎNEMENT */}
          <div className="sticky bottom-0 -mx-4 -mb-4 p-4 bg-white/95 backdrop-blur-md border-t border-zinc-200 z-30 shadow-2xl space-y-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Lancer un entraînement
              </span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Flashcards */}
                <button
                  onClick={() => setMode("flashcards")}
                  className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition active:scale-[0.98] text-left flex items-center gap-3 shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-black shrink-0 shadow-2xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-bold text-black truncate">Flashcards</div>
                    <div className="text-[10px] text-zinc-500">{notebook.deck.flashcards.length} cartes</div>
                  </div>
                </button>

                {/* 2. Quiz examen */}
                <button
                  onClick={() => setMode("quiz")}
                  className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition active:scale-[0.98] text-left flex items-center gap-3 shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-black shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-bold text-black truncate">Quiz examen</div>
                    <div className="text-[10px] text-zinc-500">Test chrono</div>
                  </div>
                </button>
              </div>

              {/* 3. Assistant IA */}
              <button
                onClick={() => {
                  if (isPro) setShowAiTutor(true);
                  else onOpenPaywall();
                }}
                className="w-full p-3.5 rounded-2xl border border-black bg-black text-white hover:bg-zinc-800 transition active:scale-[0.98] text-left flex items-center justify-between shadow-xs group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-bold text-white truncate">Assistant IA</div>
                    <div className="text-[10px] text-zinc-400">{isPro ? "Tuteur 24/7" : "Débloquer"}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-white text-black font-bold text-[10px] shrink-0 ml-2">
                  {isPro ? "IA" : "PRO"}
                </span>
              </button>
            </div>
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
            onComplete={() => setMode("grid")}
            onValidateOnboarding={() => {
              setTourStep("click_course");
              onBack();
            }}
          />
        </div>
      )}

      {/* VUE 3 : MODE QUIZ QCM */}
      {mode === "quiz" && (
        <NotebookQuizView
          deck={notebook.deck}
          onOpenPaywall={onOpenPaywall}
          onGoToFlashcards={() => setMode("flashcards")}
          onValidateOnboarding={() => {
            setTourStep("click_course");
            onBack();
          }}
        />
      )}

      {/* Modal Tuteur IA */}
      <AiTutorModal
        isOpen={showAiTutor}
        onClose={() => setShowAiTutor(false)}
        notebook={notebook}
      />

      {/* Visionneuse des documents du cours original (Photos & PDF) avec import */}
      <MirrorModal
        isOpen={showMirrorModal}
        onClose={() => setShowMirrorModal(false)}
        currentNotebook={notebook}
        imageUrl={notebook.imageUrl}
        deckTitle={notebook.title}
      />
    </div>
  );
}

