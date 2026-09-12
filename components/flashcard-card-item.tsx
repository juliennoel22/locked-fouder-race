"use client";

import { RotateCw } from "lucide-react";
import { Flashcard } from "@/types/loreno";

interface FlashcardCardItemProps {
  card: Flashcard;
  subject?: string | null;
  isFlipped: boolean;
  onFlip: () => void;
  dragOffset: number;
  exitDirection: "left" | "right" | null;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function FlashcardCardItem({
  card,
  subject,
  isFlipped,
  onFlip,
  dragOffset,
  exitDirection,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: FlashcardCardItemProps) {
  let cardTransform = `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`;
  let cardOpacity = 1;
  let cardTransition = dragOffset === 0 ? "transform 0.25s ease-out, opacity 0.25s ease-out" : "none";

  if (exitDirection === "right") {
    cardTransform = "translateX(150%) rotate(25deg)";
    cardOpacity = 0;
    cardTransition = "transform 0.28s ease-in, opacity 0.25s ease-in";
  } else if (exitDirection === "left") {
    cardTransform = "translateX(-150%) rotate(-25deg)";
    cardOpacity = 0;
    cardTransition = "transform 0.28s ease-in, opacity 0.25s ease-in";
  }

  return (
    <div
      className="w-full h-[350px] sm:h-[390px] relative cursor-pointer select-none"
      style={{
        perspective: "1000px",
        transform: cardTransform,
        opacity: cardOpacity,
        transition: cardTransition,
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onFlip}
    >
      <div
        className="w-full h-full relative"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* RECTO : 100% BLANC, TEXTE NOIR */}
        <div
          className="absolute inset-0 w-full h-full p-6 bg-white border-2 border-zinc-200 rounded-3xl shadow-xl flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            zIndex: isFlipped ? 0 : 2,
          }}
        >
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="uppercase tracking-wider text-[11px] text-zinc-500 font-bold">
              {subject || "Notion clé"}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-[10px] font-bold">
              Question
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center text-center py-4 px-2">
            <h2 className="text-xl sm:text-2xl font-bold text-black leading-snug">
              {card.front}
            </h2>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium pt-2 border-t border-zinc-100">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Touche la carte pour voir la réponse</span>
          </div>
        </div>

        {/* VERSO : 100% BLANC, TEXTE NOIR */}
        <div
          className="absolute inset-0 w-full h-full p-6 bg-white border-2 border-zinc-300 rounded-3xl shadow-xl flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            zIndex: isFlipped ? 2 : 0,
          }}
        >
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="uppercase tracking-wider text-[11px] text-zinc-500 font-bold">
              Explication
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black text-white text-[10px] font-bold">
              Réponse
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center text-center py-4 px-2 overflow-y-auto">
            <p className="text-base sm:text-lg text-black font-semibold whitespace-pre-line leading-relaxed">
              {card.back}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium pt-2 border-t border-zinc-100">
            <span>Swipe à gauche ❌ ou à droite ✅</span>
          </div>
        </div>
      </div>
    </div>
  );
}
