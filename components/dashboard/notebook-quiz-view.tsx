"use client";

import { useState, useMemo } from "react";
import { Check, X, RotateCcw, ArrowRight, Layers, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { ScanResult } from "@/types/loreno";

interface NotebookQuizViewProps {
  deck: ScanResult;
  onOpenPaywall: () => void;
  onGoToFlashcards: () => void;
}

interface McqQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function NotebookQuizView({
  deck,
  onOpenPaywall,
  onGoToFlashcards,
}: NotebookQuizViewProps) {
  // Générer les questions QCM à partir des fiches du deck
  const questions: McqQuestion[] = useMemo(() => {
    const cards = deck.flashcards || [];
    if (cards.length === 0) {
      return [
        {
          id: 0,
          question: deck.initial_quiz_question || "Quel est le point central de ce cours ?",
          options: [
            deck.summary || "Les mécanismes fondamentaux décrits dans le cours",
            "Une simple chronologie d'événements secondaires",
            "Une exception qui ne s'applique plus aujourd'hui",
            "Aucune des réponses précédentes",
          ],
          correctIndex: 0,
          explanation: deck.summary || "C'est la synthèse essentielle de ton cours.",
        },
      ];
    }

    return cards.map((card, idx) => {
      const otherCards = cards.filter((_, i) => i !== idx);
      const distractors = [
        otherCards[0]?.back || "Un mécanisme d'application directe",
        otherCards[1]?.back || "Une règle dérogatoire sans portée générale",
        otherCards[2]?.back || "Une théorie rejetée par la jurisprudence",
      ];

      // Mélanger la bonne réponse et les distracteurs de manière déterministe
      const rawOptions = [card.back, ...distractors.slice(0, 3)];
      const shift = idx % rawOptions.length;
      const options = [...rawOptions.slice(shift), ...rawOptions.slice(0, shift)];
      const correctIndex = options.indexOf(card.back);

      return {
        id: idx,
        question: card.front,
        options,
        correctIndex,
        explanation: card.back,
      };
    });
  }, [deck]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (optIdx: number) => {
    if (selectedOption !== null) return; // Déjà répondu

    setSelectedOption(optIdx);
    const isCorrect = optIdx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      } catch {
        // Ignorer
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      } catch {
        // Ignorer
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  // Écran de fin du QCM
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="w-full py-6 flex flex-col items-center text-center space-y-6 select-none animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-3xl shadow-sm">
          🏆
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-black">QCM terminé !</h2>
          <p className="text-sm text-zinc-600">
            Ton score :{" "}
            <strong className="text-black text-base font-bold">
              {score} / {questions.length}
            </strong>{" "}
            ({percentage}%)
          </p>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {percentage >= 80
              ? "Excellente maîtrise ! Tu es prêt pour les questions d'examen."
              : "Quelques notions méritent d'être consolidées avec les flashcards."}
          </p>
        </div>

        <div className="w-full space-y-2.5 pt-2">
          <button
            onClick={onGoToFlashcards}
            className="w-full h-13 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm py-3.5"
          >
            <Layers className="w-4 h-4" />
            <span>Réviser les cartes du carnet</span>
          </button>

          <button
            onClick={handleRestart}
            className="w-full h-12 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-medium text-xs flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recommencer le QCM</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 text-left select-none animate-in fade-in duration-200">
      {/* Header bar QCM */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-black uppercase tracking-wider">
            QCM d&apos;examen
          </span>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Barre de progression fine */}
      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden border border-zinc-200">
        <div
          className="bg-black h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Intitulé de la question */}
      <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Question
        </span>
        <h3 className="text-base font-bold text-black leading-snug">
          {currentQ.question}
        </h3>
      </div>

      {/* Les 4 Choix QCM */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
          const isSelected = selectedOption === optIdx;
          const isCorrect = optIdx === currentQ.correctIndex;
          const hasAnswered = selectedOption !== null;

          let btnStyle = "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50";

          if (hasAnswered) {
            if (isCorrect) {
              btnStyle = "border-black bg-black text-white font-semibold shadow-xs";
            } else if (isSelected) {
              btnStyle = "border-zinc-400 bg-zinc-200 text-zinc-900 line-through";
            } else {
              btnStyle = "border-zinc-200 bg-zinc-50 text-zinc-400 opacity-60";
            }
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelectOption(optIdx)}
              className={`w-full p-4 rounded-xl border text-left transition flex items-center justify-between gap-3 active:scale-[0.99] ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    hasAnswered && isCorrect
                      ? "bg-white text-black"
                      : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                  }`}
                >
                  {letter}
                </span>
                <span className="text-xs sm:text-sm leading-snug">{opt}</span>
              </div>

              {hasAnswered && isCorrect && <Check className="w-4 h-4 text-white shrink-0" />}
              {hasAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-zinc-600 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explication & Bouton Suivant si déjà répondu */}
      {selectedOption !== null && (
        <div className="space-y-3 pt-2 animate-in fade-in">
          <div className="p-3.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-800 space-y-1">
            <span className="font-bold text-black">
              {selectedOption === currentQ.correctIndex ? "✓ Exact !" : "Explication :"}
            </span>
            <p className="leading-relaxed">{currentQ.explanation}</p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full h-13 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm py-3.5"
          >
            <span>
              {currentIndex + 1 < questions.length ? "Question suivante" : "Voir mon score"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
