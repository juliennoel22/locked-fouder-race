"use client";

import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { Check, X, Flame } from "lucide-react";
import { Flashcard } from "@/types/loreno";
import { MirrorModal } from "./mirror-modal";
import { PaywallModal } from "./paywall-modal";
import { FlashcardCompleteView } from "./flashcard-complete-view";
import { FlashcardCardItem } from "./flashcard-card-item";
import { OnboardingTourBubble } from "./dashboard/onboarding-tour-bubble";
import { isOnboardingCompleted, setTourStep } from "@/lib/onboarding-tour-state";

interface FlashcardPlayerProps {
  cards: Flashcard[];
  deckTitle: string;
  subject?: string | null;
  imageUrl?: string | null;
  initialQuizQuestion?: string | null;
  summary?: string | null;
  onReset?: () => void;
  onComplete?: () => void;
  onValidateOnboarding?: () => void;
  disablePaywall?: boolean;
}

export function FlashcardPlayer({
  cards,
  deckTitle,
  subject,
  imageUrl,
  onReset,
  onComplete,
  onValidateOnboarding,
  disablePaywall = false,
}: FlashcardPlayerProps) {
  const [activeCards, setActiveCards] = useState<Flashcard[]>(cards);
  const [failedCards, setFailedCards] = useState<Flashcard[]>([]);
  const [isRound2, setIsRound2] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [finalKnownCount, setFinalKnownCount] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTourBanner, setShowTourBanner] = useState(true);

  const [dragOffset, setDragOffset] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef<number | null>(null), touchStartY = useRef<number | null>(null), touchDeltaX = useRef(0), isDragging = useRef(false);
  const lastFlipTime = useRef(0);

  const triggerFlip = () => {
    const now = Date.now();
    if (now - lastFlipTime.current < 350) return;
    lastFlipTime.current = now;
    setIsFlipped((prev) => !prev);
  };

  useEffect(() => {
    setActiveCards(cards);
    setFailedCards([]);
    setIsRound2(false);
    setCurrentIndex(0);
    setKnownCount(0);
    setFinalKnownCount(null);
    setIsCompleted(false);
  }, [cards]);

  const currentCard = activeCards[currentIndex] || activeCards[0] || cards[0];
  const progressPercent = Math.round(((currentIndex + 1) / activeCards.length) * 100);
  const isTourActive = showTourBanner && !isOnboardingCompleted();

  const handleValidateOnboarding = () => {
    setTourStep("click_course");
    if (onValidateOnboarding) onValidateOnboarding();
    else if (onComplete) onComplete();
  };

  const advanceCard = (known: boolean) => {
    const newStreak = known ? streak + 1 : 0;
    setStreak(newStreak);
    const updatedKnownCount = known ? knownCount + 1 : knownCount;
    if (known) setKnownCount(updatedKnownCount);
    else setFailedCards((prev) => [...prev, currentCard]);

    if (known && newStreak >= 3) {
      try { confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } }); } catch {}
    }

    if (currentIndex + 1 < activeCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setDragOffset(0);
      setExitDirection(null);
      if (!disablePaywall && newStreak === 3) setTimeout(() => setShowPaywall(true), 500);
    } else {
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
    setTimeout(() => advanceCard(known), 260);
  };

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
      triggerFlip();
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

  const resetState = (cardsList: Flashcard[], round2: boolean) => {
    setActiveCards(cardsList);
    setFailedCards([]);
    setIsRound2(round2);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStreak(0);
    setKnownCount(0);
    setFinalKnownCount(null);
    setIsCompleted(false);
    setDragOffset(0);
    setExitDirection(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); handleNextCard(false); }
      else if (e.key === "ArrowRight") { e.preventDefault(); handleNextCard(true); }
      else if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); setIsFlipped((p) => !p); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isCompleted, exitDirection]);

  if (isCompleted) {
    const scoreToDisplay = finalKnownCount !== null ? finalKnownCount : knownCount;
    return (
      <FlashcardCompleteView
        knownCount={scoreToDisplay}
        totalCount={activeCards.length}
        failedCards={failedCards}
        onRetryFailed={() => resetState(failedCards, true)}
        onReset={() => { resetState(cards, false); onReset?.(); }}
        onComplete={onComplete}
        isRound2={isRound2}
        isTourActive={isTourActive}
        onValidateOnboarding={handleValidateOnboarding}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-none pb-6">
      {/* Étape 3 de l'Onboarding */}
      {isTourActive && (
        <div className="w-full">
          <OnboardingTourBubble
            show={true}
            onDismiss={() => setShowTourBanner(false)}
            stepNumber={3}
            totalSteps={3}
            title="Teste tes premières fiches"
            description="Touche la carte pour voir le verso, puis swipe à droite si tu la sais !"
            arrowDirection="down"
            showDismiss={false}
          />
        </div>
      )}

      {/* Header : Dynamic Fiery Streak & Index */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            streak >= 5 ? "bg-black text-amber-300 border border-amber-400/40 shadow-md animate-pulse" :
            streak >= 3 ? "bg-zinc-900 text-white shadow-xs" :
            streak >= 2 ? "bg-zinc-100 border border-zinc-300 text-zinc-900" :
            "bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium"
          }`}>
            <Flame className={`w-3.5 h-3.5 ${streak >= 2 ? "text-amber-400 fill-amber-400" : "text-zinc-400"}`} />
            <span>{streak >= 5 ? `⚡ x${streak} Maîtrise !` : streak >= 3 ? `🔥 x${streak} En feu !` : streak >= 2 ? `🔥 x${streak} Combo` : `Série : ${streak}`}</span>
          </div>
          {isRound2 && <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-[10px] font-bold">Round 2</span>}
        </div>
        <span className="text-xs text-zinc-400 font-mono">{currentIndex + 1} / {activeCards.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-5 border border-zinc-200">
        <div className="h-full bg-black transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Conteneur de carte 3D Blanche */}
      <FlashcardCardItem
        card={currentCard}
        subject={subject}
        isFlipped={isFlipped}
        onFlip={() => { if (!isDragging.current) setIsFlipped((prev) => !prev); }}
        dragOffset={dragOffset}
        exitDirection={exitDirection}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Boutons d'action dans la Thumb Zone */}
      <div className="w-full grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={(e) => { e.stopPropagation(); handleNextCard(false); }}
          disabled={Boolean(exitDirection)}
          className="h-13 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-xs"
        >
          <X className="w-4 h-4 text-zinc-700" />
          <span>À revoir (Swipe gauche)</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleNextCard(true); }}
          disabled={Boolean(exitDirection)}
          className="h-13 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Je sais (Swipe droite)</span>
        </button>
      </div>

      {/* Modales */}
      <MirrorModal isOpen={showMirror} onClose={() => setShowMirror(false)} imageUrl={imageUrl || null} deckTitle={deckTitle} />
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        retentionScore={Math.round(((finalKnownCount !== null ? finalKnownCount : knownCount) / Math.max(1, activeCards.length)) * 100)}
      />
    </div>
  );
}


