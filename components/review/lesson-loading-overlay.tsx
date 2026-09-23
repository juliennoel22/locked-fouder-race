"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface LessonLoadingOverlayProps {
  deckTitle: string;
  isReady?: boolean;
  onComplete: () => void;
}

const LESSON_STEPS = [
  { id: 1, text: "Lecture approfondie de ta fiche de cours", sub: "Analyse sémantique des concepts & définitions" },
  { id: 2, text: "Extraction des notions prioritaires", sub: "Identification des concepts clés d'examen" },
  { id: 3, text: "Génération des questions & distracteurs subtils", sub: "Calibration des pièges d'évaluation réalistes" },
  { id: 4, text: "Réglage de la difficulté adaptative", sub: "Personnalisation du parcours de mémorisation" },
  { id: 5, text: "Finalisation de ton entraînement", sub: "Tout est prêt ! Prépare-toi à swiper" },
];

export function LessonLoadingOverlay({ deckTitle, isReady = true, onComplete }: LessonLoadingOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < LESSON_STEPS.length - 1) {
          const next = prev + 1;
          setProgressPercent(Math.round(((next + 1) / LESSON_STEPS.length) * 92));
          return next;
        }
        return prev;
      });
    }, 700);

    return () => clearInterval(timer);
  }, []);

  // Une fois à l'étape finale et les données prêtes, finaliser la transition
  useEffect(() => {
    if (currentStepIndex >= LESSON_STEPS.length - 1 && isReady) {
      setProgressPercent(100);
      const exitTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(exitTimer);
    }
  }, [currentStepIndex, isReady, onComplete]);

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-sm mx-auto space-y-6 text-center">
        {/* Titre & Sujet */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-bold tracking-tight">
            <span>Préparation de ton entraînement</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black">
            Création de ta session...
          </h2>
          <p className="text-xs text-zinc-500 font-medium truncate px-4">
            {deckTitle}
          </p>
        </div>

        {/* Barre de progression fluide */}
        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
          <div
            className="bg-black h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Orbe Central Minimaliste */}
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="relative w-14 h-14 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center shadow-xs">
            <Loader2 className="w-7 h-7 text-black animate-spin" />
          </div>
        </div>

        {/* Checklist Duolingo / Brilliant Style */}
        <div className="space-y-3 text-left bg-zinc-50/80 border border-zinc-200 p-4 sm:p-5 rounded-3xl shadow-2xs">
          {LESSON_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex || (idx === currentStepIndex && isReady && currentStepIndex === LESSON_STEPS.length - 1);
            const isCurrent = idx === currentStepIndex && !isDone;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 transition-all duration-300 ${
                  isDone
                    ? "text-black opacity-100"
                    : isCurrent
                    ? "text-black opacity-100 font-semibold"
                    : "text-zinc-400 opacity-40"
                }`}
              >
                {/* Indicateur de statut */}
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-300" />
                  )}
                </div>

                {/* Libellé de l'étape */}
                <div className="space-y-0.5">
                  <p className="text-xs font-bold leading-tight">
                    {step.text}
                  </p>
                  {isCurrent && (
                    <p className="text-[10px] text-zinc-500 font-normal animate-pulse">
                      {step.sub}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-zinc-400 font-medium">
          Génération intelligente optimisée pour ta mémoire à long terme
        </p>
      </div>
    </main>
  );
}
