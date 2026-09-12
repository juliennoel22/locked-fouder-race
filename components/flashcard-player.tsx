"use client";

import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { RotateCw, Check, X, Eye, Flame } from "lucide-react";
import { Button } from "./ui/button";
import { Flashcard } from "@/types/loreno";
import { MirrorModal } from "./mirror-modal";
import { PaywallModal } from "./paywall-modal";
import { ExamTrapBox } from "./exam-trap-box";

interface FlashcardPlayerProps {
  cards: Flashcard[];
  deckTitle: string;
  subject?: string | null;
  imageUrl?: string | null;
  initialQuizQuestion?: string | null;
  summary?: string | null;
  onReset?: () => void;
}

export function FlashcardPlayer({
  cards,
  deckTitle,
  subject,
  imageUrl,
  initialQuizQuestion,
  summary,
  onReset,
}: FlashcardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [showMirror, setShowMirror] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Swipe gesture touch tracking
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const [dragOffset, setDragOffset] = useState(0);

  const currentCard = cards[currentIndex] || cards[0];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignorer si non supporté
    }
  };

  const handleNextCard = (known: boolean) => {
    setIsFlipped(false);
    setDragOffset(0);

    const newStreak = known ? streak + 1 : 0;
    setStreak(newStreak);
    if (known) setKnownCount((prev) => prev + 1);

    if (known && newStreak >= 3) {
      triggerConfetti();
    }

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      if (newStreak === 3) {
        setTimeout(() => setShowPaywall(true), 600);
      }
    } else {
      triggerConfetti();
      setTimeout(() => setShowPaywall(true), 700);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    touchDeltaX.current = diff;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 70) {
      if (touchDeltaX.current > 0) {
        handleNextCard(true);
      } else {
        handleNextCard(false);
      }
    } else {
      setDragOffset(0);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div className="w-full flex flex-col items-center select-none pb-6">
      {/* Header bar: Streak & Note originale */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-zinc-600" />
            <span>Série : {streak}</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {imageUrl && (
          <button
            onClick={() => setShowMirror(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-200 bg-zinc-100 text-xs text-zinc-700 hover:text-black transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Note originale</span>
          </button>
        )}
      </div>

      {/* Progress Bar (exactement comme le quiz) */}
      <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden mb-5 border border-zinc-200">
        <div
          className="h-full bg-black transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Interactive 3D Card */}
      <div
        className="w-full h-[340px] sm:h-[380px] relative cursor-pointer perspective-1000"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.04}deg)`,
          transition: dragOffset === 0 ? "transform 0.2s ease-out" : "none",
        }}
      >
        <div
          className={`w-full h-full duration-500 preserve-3d transition-transform ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Card Front (Recto) */}
          <div className="absolute inset-0 backface-hidden flex flex-col justify-between p-6 bg-white border border-zinc-200 rounded-2xl shadow-md">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
              <span className="uppercase tracking-wider text-[10px] text-zinc-500">{subject || "Notion"}</span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px]">Question</span>
            </div>

            <div className="flex-1 flex items-center justify-center text-center py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-black leading-snug">
                {currentCard.front}
              </h2>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Touche pour retourner la carte</span>
            </div>
          </div>

          {/* Card Back (Verso) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-6 bg-zinc-50 border border-zinc-300 rounded-2xl shadow-md">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
              <span className="uppercase tracking-wider text-[10px] text-zinc-700">Explication</span>
              <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 text-[10px]">Réponse</span>
            </div>

            <div className="flex-1 flex items-center justify-center text-center py-4 overflow-y-auto">
              <p className="text-base sm:text-lg text-black font-medium whitespace-pre-line leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            <div className="text-center text-xs text-zinc-500">
              Glisse à gauche (À revoir) ou à droite (Je sais)
            </div>
          </div>
        </div>
      </div>

      {/* Actions in Thumb Zone */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={() => handleNextCard(false)}
          className="h-12 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <X className="w-4 h-4" />
          <span>À revoir</span>
        </button>

        <button
          onClick={() => handleNextCard(true)}
          className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Je sais</span>
        </button>
      </div>

      {/* Section Question Piège d'Examen */}
      <ExamTrapBox
        initialQuestion={initialQuizQuestion}
        subject={subject}
        deckTitle={deckTitle}
        onUnlock={() => setShowPaywall(true)}
      />

      {/* Mirror Modal & Paywall */}
      <MirrorModal
        isOpen={showMirror}
        onClose={() => setShowMirror(false)}
        imageUrl={imageUrl || null}
        deckTitle={deckTitle}
      />

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        retentionScore={Math.min(95, Math.max(75, knownCount * 20))}
      />
    </div>
  );
}

