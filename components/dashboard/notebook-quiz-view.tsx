"use client";

import { useState, useMemo } from "react";
import { Check, X, RotateCcw, ArrowRight, Layers, Sparkles, Trophy, AlertTriangle, Zap } from "lucide-react";
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
  onGoToFlashcards,
}: NotebookQuizViewProps) {
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
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);
    if (optIdx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      try { confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } }); } catch {}
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } }); } catch {}
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  // Écran de fin du QCM avec Note Prédictive sur 20
  if (isFinished) {
    const note20 = Math.round((score / Math.max(1, questions.length)) * 20);
    const getExamMention = () => {
      if (note20 >= 16) {
        return {
          badge: `${note20}/20 : Mention Très Bien 🏆`,
          title: "Excellente maîtrise d'examen !",
          desc: "Tu maîtrises les notions clés pour cartonner le jour des partiels.",
          badgeStyle: "bg-emerald-50 text-emerald-900 border-emerald-200",
          icon: Trophy,
        };
      }
      if (note20 >= 10) {
        return {
          badge: `${note20}/20 : Admis — Révise les points clés ⚡`,
          title: "Moyenne validée !",
          desc: "Bonne base acquise. Revois les quelques questions ratées pour viser la mention.",
          badgeStyle: "bg-amber-50 text-amber-900 border-amber-200",
          icon: Zap,
        };
      }
      return {
        badge: `${note20}/20 : Rattrapage — Tuteur IA conseillé 🚨`,
        title: "Notions à consolider d'urgence",
        desc: "Révise les flashcards et pose tes questions au Tuteur IA pour sécuriser l'examen.",
        badgeStyle: "bg-red-50 text-red-900 border-red-200",
        icon: AlertTriangle,
      };
    };

    const mention = getExamMention();
    const MentionIcon = mention.icon;

    return (
      <div className="w-full py-6 flex flex-col items-center text-center space-y-5 select-none animate-in fade-in duration-300">
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${mention.badgeStyle}`}>
          <MentionIcon className="w-3.5 h-3.5 shrink-0" />
          <span>{mention.badge}</span>
        </div>

        <div className="space-y-1">
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-black">
            {note20}<span className="text-2xl font-bold text-zinc-400">/20</span>
          </div>
          <h2 className="text-lg font-bold text-black">{mention.title}</h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {score} sur {questions.length} questions réussies ({Math.round((score / questions.length) * 100)}%). {mention.desc}
          </p>
        </div>

        <div className="w-full space-y-2.5 pt-2">
          <button
            onClick={onGoToFlashcards}
            className="w-full h-13 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm py-3.5"
          >
            <Layers className="w-4 h-4" />
            <span>Réviser avec les Flashcards</span>
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
        <span className="text-xs font-bold text-black uppercase tracking-wider">
          QCM d&apos;examen
        </span>
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

      {/* Les 4 Choix QCM avec feedback visuel instantané */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const isSelected = selectedOption === optIdx;
          const isCorrect = optIdx === currentQ.correctIndex;
          const hasAnswered = selectedOption !== null;

          let btnStyle = "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50";

          if (hasAnswered) {
            if (isCorrect) {
              btnStyle = "border-emerald-600 bg-emerald-600 text-white font-semibold shadow-xs";
            } else if (isSelected) {
              btnStyle = "border-red-300 bg-red-50 text-red-900 line-through";
            } else {
              btnStyle = "border-zinc-200 bg-zinc-50 text-zinc-400 opacity-50";
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
                      ? "bg-white text-emerald-700"
                      : hasAnswered && isSelected
                      ? "bg-red-200 text-red-800"
                      : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                  }`}
                >
                  {letter}
                </span>
                <span className="text-xs sm:text-sm leading-snug">{opt}</span>
              </div>

              {hasAnswered && isCorrect && <Check className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />}
              {hasAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-red-600 shrink-0 stroke-[2.5]" />}
            </button>
          );
        })}
      </div>

      {/* Micro-Explication instantanée & Bouton Suivant */}
      {selectedOption !== null && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              selectedOption === currentQ.correctIndex
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-amber-50 border-amber-200 text-amber-950"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              {selectedOption === currentQ.correctIndex ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900">✓ Exact ! Point clé retenu :</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-900">💡 Pourquoi ? Le principe clé :</span>
                </>
              )}
            </div>
            <p className="leading-relaxed opacity-90 pl-5">{currentQ.explanation}</p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full h-13 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm py-3.5"
          >
            <span>
              {currentIndex + 1 < questions.length ? "Question suivante" : "Voir ma note d'examen"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
