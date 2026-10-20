"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  BookOpen, Layers, CheckCircle2, Gift, Flame,
  Trophy, Lock, Check, Star, Play, Award, Zap, ChevronRight
} from "lucide-react";
import { ReviewItemType } from "./review-types";
import { REVIEW_STEPS_CONFIG } from "@/lib/review-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface PathNode {
  id: string;
  type: ReviewItemType;
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
  onStartNextNode: (stepNumber?: number) => void;
  onUpdateProgress?: (newPercent: number) => void;
  onOpenCourseSheet?: () => void;
}

const STEP_ICONS: Record<number, React.ElementType> = { 1: BookOpen, 2: Layers, 3: CheckCircle2, 4: Gift, 5: Flame, 6: Trophy };
const DEFAULT_PATH_NODES: PathNode[] = REVIEW_STEPS_CONFIG.map((cfg) => ({
  id: cfg.id, type: cfg.type, title: cfg.title, subtitle: cfg.subtitle,
  icon: STEP_ICONS[cfg.stepNumber] || BookOpen, position: cfg.position, stepNumber: cfg.stepNumber,
}));

export function CoursePathMap({
  deckId,
  deckTitle,
  subject,
  progressPercent = 0,
  onSelectNode,
  onStartNextNode,
  onUpdateProgress,
  onOpenCourseSheet,
}: CoursePathMapProps) {
  const activeNodeRef = useRef<HTMLDivElement>(null);
  const nodes = DEFAULT_PATH_NODES;
  const [showDevMode, setShowDevMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("dev") === "true" || localStorage.getItem("loreno_dev_mode") === "true") {
        setShowDevMode(true);
      }
    }
  }, []);

  const effectiveProgress = useMemo(() => {
    let localVal = 0;
    try {
      if (typeof window !== "undefined" && deckId) {
        const stored = localStorage.getItem(`loreno_progress_${deckId}`);
        if (stored) localVal = Number(stored);
      }
    } catch {}
    return Math.max(progressPercent || 0, localVal);
  }, [progressPercent, deckId]);

  const completedCount = useMemo(() => {
    if (effectiveProgress >= 100) return nodes.length;
    if (effectiveProgress <= 0) return 0;
    return Math.max(1, Math.floor((effectiveProgress / 100) * nodes.length));
  }, [effectiveProgress, nodes.length]);

  const currentStepIndex = Math.min(completedCount, nodes.length - 1);

  useEffect(() => {
    if (activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const getPositionClass = (pos: "left" | "center" | "right") => {
    if (pos === "left") return "-translate-x-10 sm:-translate-x-12";
    if (pos === "right") return "translate-x-10 sm:translate-x-12";
    return "translate-x-0";
  };

  return (
    <div className="w-full flex flex-col items-center select-none pb-28 pt-2">
      {/* Barre d'outils Mode Test (Masquée par défaut sauf avec ?dev=true) */}
      {showDevMode && onUpdateProgress && (
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

      {/* En-tête Unité Coss UI Style (Interactive : Clic ouvre la fiche complète) */}
      <Card
        onClick={onOpenCourseSheet}
        className="w-full bg-neutral-900 border-neutral-800 text-white p-5 shadow-sm space-y-3 text-left mb-6 relative overflow-hidden transition active:scale-[0.99] cursor-pointer hover:border-neutral-700"
      >
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            size="sm"
            className="border-neutral-700 bg-neutral-800/80 text-neutral-300 font-bold uppercase tracking-wider text-[10px]"
          >
            UNITÉ 1 • {subject || "MAÎTRISE DU COURS"}
          </Badge>
          <Badge
            variant="warning"
            size="sm"
            className="gap-1 font-mono font-bold bg-amber-400/10 text-amber-300 border-amber-400/30"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{effectiveProgress}%</span>
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <h2 className="text-base sm:text-lg font-bold font-heading text-white leading-tight truncate">
              {deckTitle}
            </h2>
            <p className="text-xs text-neutral-400 font-medium">
              Parcours de révision séquentiel adaptatif
            </p>
          </div>
          {onOpenCourseSheet && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="gap-1 bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700 shrink-0 font-semibold"
            >
              <span>Lire la fiche</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Barre de progression globale */}
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/60">
          <div
            className="h-full bg-gradient-to-r from-brand to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, effectiveProgress)}%` }}
          />
        </div>
      </Card>

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
              ref={isCurrent ? activeNodeRef : undefined}
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
                    ? "bg-emerald-600 text-white shadow-[0_6px_16px_rgba(5,150,105,0.28)] border-4 border-white"
                    : isCurrent
                    ? "bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] ring-4 ring-emerald-400/40 ring-offset-2 animate-pulse border-4 border-white"
                    : isLocked && onUpdateProgress
                    ? "bg-amber-100 text-amber-700 border-4 border-amber-300 cursor-pointer shadow-sm hover:scale-105"
                    : "bg-zinc-200 text-zinc-400 border-4 border-zinc-300 cursor-not-allowed"
                }`}
              >
                {isDone ? <Check className="w-8 h-8 stroke-[3]" /> : isLocked && !onUpdateProgress ? <Lock className="w-6 h-6 text-zinc-400" /> : isLocked && onUpdateProgress ? <Zap className="w-6 h-6 text-amber-600 fill-amber-500" /> : <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />}
                {isDone && <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black border-2 border-white flex items-center justify-center text-[10px] font-black shadow-xs">✓</span>}
              </button>
              <div className="mt-1.5 text-center space-y-0.5">
                <div className={`text-xs font-bold leading-tight ${isDone ? "text-emerald-700 font-extrabold" : isCurrent ? "text-black font-extrabold" : "text-zinc-400"}`}>
                  {node.title}
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {node.subtitle}
                </p>

                {isDone && (
                  <div className="flex items-center justify-center gap-0.5 pt-0.5">
                    {[1, 2, 3].map((s) => (<Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton sticky de lancement du nœud courant */}
      <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] left-0 right-0 max-w-md mx-auto px-4 z-30 pointer-events-auto">
        <Button
          type="button"
          size="xl"
          onClick={() => onStartNextNode(currentStepIndex + 1)}
          className="w-full h-14 rounded-full font-black text-sm sm:text-base gap-2.5 shadow-[0_12px_32px_rgba(68,87,244,0.5)] bg-[#4457f4] border-t-2 border-white/35 border-b-4 border-b-[#26339f] text-white hover:bg-[#394ae0] active:border-b-0 active:translate-y-1 transition-all duration-100"
        >
          <Play className="w-4 h-4 fill-white text-white stroke-[3]" />
          <span>
            {progressPercent >= 100
              ? "Rejouer le parcours"
              : `Continuer l'Étape ${currentStepIndex + 1}`}
          </span>
        </Button>
      </div>
    </div>
  );
}
