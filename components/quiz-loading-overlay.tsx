"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface QuizLoadingOverlayProps {
  message?: string;
  progress?: number;
  fullScreen?: boolean;
}

const DOPAMINE_STEPS = [
  { min: 0, max: 28, text: "Lecture haute précision de tes notes...", sub: "Analyse visuelle et déchiffrage" },
  { min: 28, max: 58, text: "Extraction des notions clés d'examen...", sub: "Sélection des concepts essentiels" },
  { min: 58, max: 82, text: "Génération de tes fiches de révision...", sub: "Création des cartes mémoires 3D" },
  { min: 82, max: 98, text: "Création de ton quiz prédictif...", sub: "Calcul des questions et pièges" },
  { min: 98, max: 100, text: "Finalisation de ton cours...", sub: "Tout est prêt pour réviser !" },
];

export function QuizLoadingOverlay({
  message,
  progress: externalProgress,
  fullScreen = false,
}: QuizLoadingOverlayProps) {
  const [internalProgress, setInternalProgress] = useState(15);

  useEffect(() => {
    if (externalProgress === 100) {
      setInternalProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 94) return prev;
        const increment = prev < 50 ? 4 : prev < 75 ? 2.5 : 1;
        return Math.min(94, Math.round((prev + increment) * 10) / 10);
      });
    }, 140);

    return () => clearInterval(interval);
  }, [externalProgress]);

  const currentPercent = externalProgress === 100 ? 100 : Math.max(internalProgress, externalProgress || 0);
  const activeStep = DOPAMINE_STEPS.find(
    (s) => currentPercent >= s.min && (currentPercent < s.max || (s.max === 100 && currentPercent >= 98))
  ) || DOPAMINE_STEPS[0];

  const displayTitle = message && externalProgress === 100 ? message : activeStep.text;

  return (
    <div
      className={`w-full flex flex-col justify-center items-center text-center select-none ${
        fullScreen
          ? "min-h-[100dvh] max-w-md mx-auto p-6 bg-white text-black"
          : "py-6 sm:py-8 px-4 my-auto space-y-4"
      }`}
    >
      <div className="w-full max-w-xs space-y-3.5">
        <div className="relative w-10 h-10 mx-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
        </div>

        <div className="space-y-1 min-h-[50px] flex flex-col justify-center">
          <h2 className="text-sm sm:text-base font-bold text-black leading-snug transition-all duration-200">
            {displayTitle}
          </h2>
          <p className="text-[11px] text-zinc-500 transition-all duration-200">
            {activeStep.sub}
          </p>
        </div>

        {/* Barre de progression fluide */}
        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
          <div
            className="bg-black h-full transition-all duration-200 ease-out"
            style={{ width: `${Math.round(currentPercent)}%` }}
          />
        </div>

        <p className="text-[11px] font-mono text-zinc-400 font-medium">
          {Math.round(currentPercent)}%
        </p>
      </div>
    </div>
  );
}


