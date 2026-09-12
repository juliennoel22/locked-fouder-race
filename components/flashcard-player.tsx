"use client";

import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { Check, X, Eye, Flame } from "lucide-react";
import { Flashcard } from "@/types/loreno";
import { MirrorModal } from "./mirror-modal";
import { PaywallModal } from "./paywall-modal";
import { FlashcardCompleteView } from "./flashcard-complete-view";
import { FlashcardCardItem } from "./flashcard-card-item";

interface FlashcardPlayerProps {
  cards: Flashcard[];
  deckTitle: string;
  subject?: string | null;
  imageUrl?: string | null;
  initialQuizQuestion?: string | null;
  summary?: string | null;
  onReset?: () => void;
  onComplete?: () => void;
  disablePaywall?: boolean;
}

export function FlashcardPlayer({
  cards,
  deckTitle,
  subject,
  imageUrl,
  initialQuizQuestion,
  onReset,
  onComplete,
  disablePaywall = false,
}: FlashcardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [finalKnownCount, setFinalKnownCount] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Swipe animation states
  const [dragOffset, setDragOffset] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const currentCard = cards[currentIndex] || cards[0];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  const advanceCard = (known: boolean) => {
    const newStreak = known ? streak + 1 : 0;
    setStreak(newStreak);
    const updatedKnownCount = known ? knownCount + 1 : knownCount;
    if (known) setKnownCount(updatedKnownCount);

    if (known && newStreak >= 3) {
      try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); } catch {}
    }

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setDragOffset(0);
      setExitDirection(null);
      if (!disablePaywall && newStreak === 3) {
        setTimeout(() => setShowPaywall(true), 500);
      }
    } else {
      // Fin de la série : score final garanti exact
      setFinalKnownCount(updatedKnownCount);
      setIsCompleted(true);
      setDragOffset(0);
      setExitDirection(null);
      try { confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } }); } catch {}
    }
  };

  const handleNextCard = (known: boolean) => {
    if (exitDirection) return;
    setExitDirection(known ? "right" : "left");
    setTimeout(() => advanceCard(known), 280);
  };

  // Support des touches clavier sur ordinateur (Flèche gauche / droite / Espace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleNextCard(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextCard(true);
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isCompleted, exitDirection]);

  // Tactile Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (exitDirection) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || exitDirection) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - (touchStartY.current || 0);

    if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) isDragging.current = true;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      touchDeltaX.current = diffX;
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (exitDirection) return;
    if (!isDragging.current || Math.abs(touchDeltaX.current) < 15) {
      setIsFlipped((prev) => !prev);
    } else if (Math.abs(touchDeltaX.current) > 75) {
      handleNextCard(touchDeltaX.current > 0);
    } else {
      setDragOffset(0);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
    isDragging.current = false;
  };

  const handleResetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStreak(0);
    setKnownCount(0);
    setFinalKnownCount(null);
    setIsCompleted(false);
    setDragOffset(0);
    setExitDirection(null);
    if (onReset) onReset();
  };

  if (isCompleted) {
    const scoreToDisplay = finalKnownCount !== null ? finalKnownCount : knownCount;
    return (
      <FlashcardCompleteView
        knownCount={scoreToDisplay}
        totalCount={cards.length}
        onReset={handleResetSession}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-none pb-6">
      {/* Header : Streak & Index */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-zinc-600" />
            <span>Série : {streak}</span>
          </div>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-5 border border-zinc-200">
        <div
          className="h-full bg-black transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Conteneur de carte 3D Blanche */}
      <FlashcardCardItem
        card={currentCard}
        subject={subject}
        isFlipped={isFlipped}
        onFlip={() => {
          if (!isDragging.current) setIsFlipped((prev) => !prev);
        }}
        dragOffset={dragOffset}
        exitDirection={exitDirection}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Boutons d'action dans la Thumb Zone */}
      <div className="w-full grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextCard(false);
          }}
          disabled={Boolean(exitDirection)}
          className="h-13 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-xs"
        >
          <X className="w-4 h-4 text-zinc-700" />
          <span>À revoir (Swipe gauche)</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextCard(true);
          }}
          disabled={Boolean(exitDirection)}
          className="h-13 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Je sais (Swipe droite)</span>
        </button>
      </div>

      {/* Modales */}
      <MirrorModal
        isOpen={showMirror}
        onClose={() => setShowMirror(false)}
        imageUrl={imageUrl || null}
        deckTitle={deckTitle}
      />
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        retentionScore={Math.round(
          ((finalKnownCount !== null ? finalKnownCount : knownCount) /
            Math.max(1, cards.length)) *
            100
        )}
      />
    </div>
  );
}
