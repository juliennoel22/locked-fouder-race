"use client";

import { useMemo } from "react";
import {
  BookOpen,
  Layers,
  CheckCircle2,
  Gift,
  Mic,
  Trophy,
  Lock,
  Check,
  Star,
  Play,
  Award,
  Zap,
} from "lucide-react";

export interface PathNode {
  id: string;
  type: "concepts" | "flashcards" | "quiz" | "chest" | "recall" | "exam_trap";
  title: string;
  subtitle: string;
  icon: React.ElementType;
  position: "left" | "center" | "right";
  stepNumber: number;
}

interface CoursePathMapProps {
  deckId?: string;
  deckTitle: string;
  subject?: string | null;
  progressPercent: number;
  onSelectNode: (node: PathNode) => void;
  onStartNextNode: () => void;
  onUpdateProgress?: (newPercent: number) => void;
}

export function CoursePathMap({
  deckId,
  deckTitle,
  subject,
  progressPercent = 0,
  onSelectNode,
  onStartNextNode,
  onUpdateProgress,
}: CoursePathMapProps) {
  // Définition statique des 6 étapes du parcours Duolingo en zigzag
  const nodes: PathNode[] = useMemo(
    () => [
      {
        id: "step-1",
        type: "concepts",
        title: "Concepts Clés",
        subtitle: "Synthèse & Définitions",
        icon: BookOpen,
        position: "left",
        stepNumber: 1,
      },
      {
        id: "step-2",
        type: "flashcards",
        title: "Mémorisation 3D",
        subtitle: "Flashcards Set 1",
        icon: Layers,
        position: "right",
        stepNumber: 2,
      },
      {
        id: "step-3",
        type: "quiz",
        title: "Test de Notions",
        subtitle: "Quiz Adaptatif",
        icon: CheckCircle2,
        position: "center",
        stepNumber: 3,
      },
      {
        id: "step-4",
        type: "chest",
        title: "Coffre Trésor",
        subtitle: "Bonus Rétention",
        icon: Gift,
        position: "left",
        stepNumber: 4,
      },
      {
        id: "step-5",
        type: "recall",
        title: "Rappel Avancé",
        subtitle: "Flashcards Avancées",
        icon: Mic,
        position: "right",
        stepNumber: 5,
      },
      {
        id: "step-6",
        type: "exam_trap",
        title: "Épreuve Finale",
        subtitle: "Question Piège Examen",
        icon: Trophy,
        position: "center",
        stepNumber: 6,
      },
    ],
    []
  );

  // Hydratation réactive spécifique à CE DECK UNIQUE
  const effectiveProgress = useMemo(() => {
    let localVal = 0;
    try {
      if (typeof window !== "undefined" && deckId) {
        const stored = localStorage.getItem(`loreno_progress_${deckId}`);
        if (stored) {
          localVal = Number(stored);
        }
      }
    } catch {}
    return Math.max(progressPercent || 0, localVal);
  }, [progressPercent, deckId]);

  // Calcul du nombre de nœuds complétés (1 à 6)
  const completedCount = useMemo(() => {
    if (effectiveProgress >= 100) return nodes.length;
    if (effectiveProgress <= 0) return 0;
    return Math.max(1, Math.floor((effectiveProgress / 100) * nodes.length));
  }, [effectiveProgress, nodes.length]);

  const currentStepIndex = Math.min(completedCount, nodes.length - 1);

  const getPositionClass = (pos: "left" | "center" | "right") => {
    if (pos === "left") return "-translate-x-10 sm:-translate-x-12";
    if (pos === "right") return "translate-x-10 sm:translate-x-12";
    return "translate-x-0";
  };

  return (
    <div className="w-full flex flex-col items-center select-none pb-28 pt-2">
      {/* Barre d'outils Mode Test Rapidité */}
      {onUpdateProgress && (
        <div className="w-full mb-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900 shadow-2xs">
          <span className="flex items-center gap-1.5 font-black text-[11px]">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>MODE TEST DEV :</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onUpdateProgress(Math.min(100, Math.round(((completedCount + 1) / nodes.length) * 100)))}
              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] cursor-pointer shadow-xs active:scale-95 transition"
            >
              +1 Étape
            </button>
            <button
              type="button"
              onClick={() => onUpdateProgress(100)}
              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] cursor-pointer shadow-xs active:scale-95 transition"
            >
              🔓 100%
            </button>
            <button
              type="button"
              onClick={() => onUpdateProgress(0)}
              className="px-2.5 py-1 rounded-xl bg-zinc-700 hover:bg-zinc-800 text-white font-extrabold text-[11px] cursor-pointer shadow-xs active:scale-95 transition"
            >
              🔄 Reset 0%
            </button>
          </div>
        </div>
      )}

      {/* En-tête Unité Duolingo Style (Bannière Verte Énergique) */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white p-4 sm:p-5 shadow-lg border border-emerald-400/40 space-y-2 text-left mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full text-white">
            UNITÉ 1 • {subject || "MAÎTRISE DU COURS"}
          </span>
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-black text-amber-300">
            <Award className="w-3.5 h-3.5" />
            <span>{effectiveProgress}%</span>
          </div>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-black text-white leading-tight">
            {deckTitle}
          </h2>
          <p className="text-xs text-emerald-100 font-medium mt-0.5">
            Parcours de révision séquentiel adaptatif
          </p>
        </div>

        {/* Barre de progression globale */}
        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden border border-white/20 pt-0.5">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, effectiveProgress)}%` }}
          />
        </div>
      </div>

      {/* CHEMIN VISUEL EN ZIGZAG (DUOLINGO MAP) */}
      <div className="relative w-full flex flex-col items-center space-y-7 py-2">
        {/* Ligne SVG d'arrière-plan reliant les nœuds */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none stroke-emerald-300/60"
          style={{ strokeWidth: 4, strokeDasharray: "8 8" }}
        >
          <path
            d="M 160 30 Q 80 80 160 130 T 240 230 T 160 330 T 80 430 T 160 520"
            fill="none"
          />
        </svg>

        {nodes.map((node, index) => {
          const isDone = index < completedCount;
          const isCurrent = index === currentStepIndex && progressPercent < 100;
          const isLocked = index > completedCount && progressPercent < 100;
          const isClickable = !isLocked || Boolean(onUpdateProgress);
          const IconComponent = node.icon;

          return (
            <div
              key={node.id}
              className={`relative flex flex-col items-center transition-all duration-300 ${getPositionClass(
                node.position
              )}`}
            >
              {/* Mascotte / Bulle d'indication sur le nœud courant */}
              {isCurrent && (
                <div className="absolute -top-10 z-20 animate-bounce flex flex-col items-center">
                  <div className="px-3 py-1 rounded-xl bg-black text-white text-[10px] font-black shadow-md flex items-center gap-1 border border-zinc-700 whitespace-nowrap">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>C&apos;est parti !</span>
                  </div>
                  <div className="w-2 h-2 bg-black rotate-45 -mt-1" />
                </div>
              )}

              {/* Nœud circulaire Duolingo */}
              <button
                type="button"
                onClick={() => {
                  if (isClickable) onSelectNode(node);
                }}
                disabled={!isClickable}
                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer ${
                  isDone
                    ? "bg-gradient-to-tr from-emerald-500 to-green-400 text-white shadow-lg border-4 border-white shadow-emerald-500/30"
                    : isCurrent
                    ? "bg-gradient-to-tr from-emerald-500 via-green-500 to-emerald-400 text-white shadow-xl ring-4 ring-emerald-300 ring-offset-2 animate-pulse border-4 border-white"
                    : isLocked && onUpdateProgress
                    ? "bg-amber-100 text-amber-700 border-4 border-amber-300 cursor-pointer shadow-sm hover:scale-105"
                    : "bg-zinc-200 text-zinc-400 border-4 border-zinc-300 cursor-not-allowed"
                }`}
              >
                {isDone ? (
                  <Check className="w-8 h-8 stroke-[3]" />
                ) : isLocked && !onUpdateProgress ? (
                  <Lock className="w-6 h-6 text-zinc-400" />
                ) : isLocked && onUpdateProgress ? (
                  <Zap className="w-6 h-6 text-amber-600 fill-amber-500" />
                ) : (
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
                )}

                {/* Badge numéro ou statut */}
                {isDone && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black border-2 border-white flex items-center justify-center text-[10px] font-black shadow-xs">
                    ✓
                  </span>
                )}
              </button>

              {/* Titre & Étoiles de sous-nœud */}
              <div className="mt-1.5 text-center space-y-0.5">
                <div
                  className={`text-xs font-bold leading-tight ${
                    isDone
                      ? "text-emerald-700 font-extrabold"
                      : isCurrent
                      ? "text-black font-extrabold"
                      : "text-zinc-400"
                  }`}
                >
                  {node.title}
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {node.subtitle}
                </p>

                {/* 3 Étoiles sous le nœud si validé */}
                {isDone && (
                  <div className="flex items-center justify-center gap-0.5 pt-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton sticky de lancement du nœud courant */}
      <div className="fixed bottom-5 left-0 right-0 max-w-md mx-auto px-4 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={onStartNextNode}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-xl border border-emerald-400/40 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white text-white" />
          <span>
            {progressPercent >= 100
              ? "Rejouer le parcours"
              : `Continuer l'Étape ${currentStepIndex + 1}`}
          </span>
        </button>
      </div>
    </div>
  );
}
