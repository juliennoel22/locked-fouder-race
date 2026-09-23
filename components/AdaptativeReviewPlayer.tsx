"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, X, RotateCw, HelpCircle } from "lucide-react";
import { Flashcard } from "@/types/loreno";
import { ReviewErrorModal } from "./review/review-error-modal";
import { ReviewCompletedModal } from "./review/review-completed-modal";

export type ReviewItemType = "flashcard" | "quiz" | "exam_trap";

export interface ReviewQueueItem {
  id: string;
  type: ReviewItemType;
  front: string;
  back: string;
  distractors?: string[];
  isRetry?: boolean;
}

interface AdaptativeReviewPlayerProps {
  deckId: string;
  deckTitle: string;
  subject?: string | null;
  flashcards: Flashcard[];
  initialQuizQuestion?: string | null;
  onFinish?: () => void;
}

export function AdaptativeReviewPlayer({
  deckId,
  deckTitle,
  subject,
  flashcards,
  initialQuizQuestion,
}: AdaptativeReviewPlayerProps) {
  // Construction initiale de la file d'apprentissage séquentielle
  const buildInitialQueue = useCallback((): ReviewQueueItem[] => {
    const queue: ReviewQueueItem[] = [];

    // 1. Étape 1 : Flashcards de découverte / réactivation
    flashcards.forEach((card, idx) => {
      queue.push({
        id: `fc-${idx}-${Date.now()}`,
        type: "flashcard",
        front: card.front,
        back: card.back,
        distractors: card.distractors,
      });
    });

    // 2. Étape 2 : Quiz notionnel adaptatif
    flashcards.forEach((card, idx) => {
      queue.push({
        id: `qz-${idx}-${Date.now()}`,
        type: "quiz",
        front: card.front,
        back: card.back,
        distractors: card.distractors,
      });
    });

    // 3. Étape 3 : Question piège d'examen si disponible
    if (initialQuizQuestion?.trim()) {
      queue.push({
        id: `trap-${Date.now()}`,
        type: "exam_trap",
        front: initialQuizQuestion,
        back: flashcards[0]?.back || "Vérifie les concepts clés du cours.",
      });
    }

    return queue;
  }, [flashcards, initialQuizQuestion]);

  const [queue, setQueue] = useState<ReviewQueueItem[]>(() => buildInitialQueue());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // État de la modal d'erreur Option A
  const [errorModalData, setErrorModalData] = useState<{
    isOpen: boolean;
    question: string;
    correctAnswer: string;
  }>({ isOpen: false, question: "", correctAnswer: "" });

  const currentItem = queue[currentIndex];
  const totalItemsCount = queue.length;
  const progressPercent = totalItemsCount > 0
    ? Math.min(100, Math.round((currentIndex / totalItemsCount) * 100))
    : 0;

  // Distracteurs pertinents pour le quiz notionnel
  const currentOptions = useMemo(() => {
    if (!currentItem || currentItem.type === "flashcard") return [];

    const correct = currentItem.back;

    // Si des distracteurs pertinents et crédibles ont été générés par l'IA
    if (Array.isArray(currentItem.distractors) && currentItem.distractors.length >= 2) {
      const selectedDistractors = currentItem.distractors.slice(0, 3);
      return [correct, ...selectedDistractors].sort(() => Math.random() - 0.5);
    }

    // Sinon, extraction parmi les réponses des cartes du même cours
    const others = flashcards
      .filter((f) => f.back !== correct)
      .map((f) => f.back);

    const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    return [correct, ...shuffledOthers].sort(() => Math.random() - 0.5);
  }, [currentItem, flashcards]);

  // Sauvegarde de la progression en BDD Supabase
  const saveProgressToDb = useCallback(async (percent: number) => {
    if (!deckId || deckId.startsWith("demo-")) return;
    try {
      await fetch("/api/decks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deckId, progress_percent: percent }),
      });
    } catch (e) {
      console.error("Erreur sauvegarde progress_percent :", e);
    }
  }, [deckId]);

  const handleNextItem = () => {
    setIsFlipped(false);
    if (currentIndex + 1 >= queue.length) {
      setIsCompleted(true);
      saveProgressToDb(100);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Traitement d'une réponse incorrecte (Option A)
  const handleMistake = (item: ReviewQueueItem) => {
    setErrorCount((prev) => prev + 1);
    setErrorModalData({
      isOpen: true,
      question: item.front,
      correctAnswer: item.back,
    });

    // Option A : Ré-injection obligatoire en fin de parcours
    setQueue((prev) => [
      ...prev,
      {
        ...item,
        id: `${item.id}-retry-${Date.now()}`,
        isRetry: true,
      },
    ]);
  };

  const handleQuizAnswer = (selected: string) => {
    if (!currentItem) return;
    if (selected === currentItem.back) {
      handleNextItem();
    } else {
      handleMistake(currentItem);
    }
  };

  const handleRestart = () => {
    setQueue(buildInitialQueue());
    setCurrentIndex(0);
    setErrorCount(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <ReviewCompletedModal
        deckId={deckId}
        deckTitle={deckTitle}
        progressPercent={100}
        totalCards={flashcards.length}
        errorCount={errorCount}
        onRestart={handleRestart}
      />
    );
  }

  if (!currentItem) return null;

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-2 select-none">
      {/* Barre de Progression Duolingo */}
      <div className="w-full space-y-1.5 pb-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
          <span className="flex items-center gap-1 text-[#4457f4]">
            {currentItem.type === "flashcard"
              ? "Étape 1 • Mémorisation Flashcards"
              : currentItem.type === "quiz"
              ? "Étape 2 • Quiz Adaptatif"
              : "Étape 3 • Question Piège Examen"}
          </span>
          <span>{currentIndex + 1} / {queue.length}</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
          <div
            className="h-full bg-gradient-to-r from-[#4457f4] to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* ZONE DU JEU SELON LE TYPE */}
      <div className="flex-1 flex flex-col justify-center py-4">
        {/* CAS 1 : FLASHCARD FLIP AVEC ROTATION 3D RECTO/VERSO (TEXTE NON INVERSÉ) */}
        {currentItem.type === "flashcard" && (
          <div className="relative w-full min-h-[260px] [perspective:1000px] select-none cursor-pointer">
            <div
              onClick={() => setIsFlipped((prev) => !prev)}
              className={`relative w-full h-full min-h-[260px] rounded-3xl border-2 transition-transform duration-500 [transform-style:preserve-3d] ${
                isFlipped ? "[transform:rotateY(180deg)] border-[#4457f4]" : "border-zinc-200 hover:border-[#4457f4]/40"
              }`}
            >
              {/* FACE RECTO (QUESTION / CONCEPT) */}
              <div className="absolute inset-0 w-full h-full p-6 bg-white rounded-3xl flex flex-col justify-between [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                    Notion / Question
                  </span>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1 group-hover:text-[#4457f4] transition">
                    <RotateCw className="w-3.5 h-3.5" />
                    Tap pour retourner
                  </span>
                </div>

                <div className="py-4">
                  <p className="text-base sm:text-lg font-bold text-black leading-snug whitespace-pre-line">
                    {currentItem.front}
                  </p>
                </div>

                <div className="text-[10px] text-zinc-400">
                  {subject || deckTitle}
                </div>
              </div>

              {/* FACE VERSO (RÉPONSE / DÉFINITION - NON MIRROIR) */}
              <div className="absolute inset-0 w-full h-full p-6 bg-white rounded-3xl flex flex-col justify-between [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Réponse / Explication
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Verso
                  </span>
                </div>

                <div className="py-4">
                  <p className="text-base sm:text-lg font-extrabold text-black leading-snug whitespace-pre-line">
                    {currentItem.back}
                  </p>
                </div>

                <div className="text-[10px] text-emerald-600 font-bold">
                  Connaissais-tu cette réponse ?
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAS 2 : QUIZ NOTIONNEL */}
        {currentItem.type === "quiz" && (
          <div className="w-full space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-[#4457f4]">
                Question Notionnelle
              </span>
              <p className="text-sm font-bold text-black">{currentItem.front}</p>
            </div>

            <div className="space-y-2">
              {currentOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuizAnswer(opt)}
                  className="w-full p-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-[#4457f4] hover:bg-zinc-50 active:scale-[0.98] transition-all text-left text-xs font-semibold text-zinc-800 cursor-pointer shadow-2xs leading-relaxed"
                >
                  <span className="font-extrabold text-[#4457f4] mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CAS 3 : QUESTION PIÈGE D'EXAMEN */}
        {currentItem.type === "exam_trap" && (
          <div className="w-full p-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/60 to-white shadow-md space-y-4 text-left">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-black">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>DÉFI FINAL : QUESTION PIÈGE D&apos;EXAMEN</span>
            </div>

            <p className="text-sm font-extrabold text-black leading-snug">
              {currentItem.front}
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-100/50 border border-amber-200 text-xs text-amber-950 leading-relaxed">
              <strong className="block mb-1 text-black font-bold">Réponse d&apos;examen attendue :</strong>
              <p className="whitespace-pre-line">{currentItem.back}</p>
            </div>

            <button
              type="button"
              onClick={handleNextItem}
              className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm cursor-pointer"
            >
              <span>Valider le défi d&apos;examen</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ACTIONS THUMB ZONE POUR FLASHCARDS (À revoir vs Je sais) */}
      {currentItem.type === "flashcard" && (
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => handleMistake(currentItem)}
            className="flex-1 h-13 rounded-2xl border-2 border-red-200 bg-white hover:bg-red-50 text-red-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>À revoir</span>
          </button>

          <button
            type="button"
            onClick={handleNextItem}
            className="flex-1 h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-md cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Je sais</span>
          </button>
        </div>
      )}

      {/* Pop-up Pédagogique Option A */}
      <ReviewErrorModal
        isOpen={errorModalData.isOpen}
        question={errorModalData.question}
        correctAnswer={errorModalData.correctAnswer}
        onDismiss={() => {
          setErrorModalData((prev) => ({ ...prev, isOpen: false }));
          handleNextItem();
        }}
      />
    </div>
  );
}
