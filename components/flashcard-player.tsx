"use client";

import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import {
  RotateCw,
  Check,
  X,
  Eye,
  Flame,
  Download,
  Sparkles,
  Share2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Flashcard } from "@/types/loreno";
import { MirrorModal } from "./mirror-modal";
import { PaywallModal } from "./paywall-modal";

interface FlashcardPlayerProps {
  cards: Flashcard[];
  deckTitle: string;
  subject?: string | null;
  imageUrl?: string | null;
  onReset?: () => void;
}

export function FlashcardPlayer({
  cards,
  deckTitle,
  subject,
  imageUrl,
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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#f97316", "#10b981"],
      });
    } catch (e) {
      // Ignorer si non supporté
    }
  };

  const handleNextCard = (known: boolean) => {
    setIsFlipped(false);
    setDragOffset(0);

    const newStreak = known ? streak + 1 : 0;
    setStreak(newStreak);
    if (known) setKnownCount((prev) => prev + 1);

    // Déclenchement Dopamine & Confetti
    if (known && newStreak >= 3) {
      triggerConfetti();
    }

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      // Déclencheur paywall au 3ème swipe consécutif
      if (newStreak === 3) {
        setTimeout(() => setShowPaywall(true), 600);
      }
    } else {
      // Fin du premier set de cartes -> Dopamine max + Paywall bloquant
      triggerConfetti();
      setTimeout(() => setShowPaywall(true), 700);
    }
  };

  // Touch handlers pour le swipe mobile
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
    if (Math.abs(touchDeltaX.current) > 80) {
      if (touchDeltaX.current > 0) {
        handleNextCard(true); // Swipe Droite = Je sais
      } else {
        handleNextCard(false); // Swipe Gauche = À revoir
      }
    } else {
      setDragOffset(0);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handleExport = () => {
    const tsv = cards.map((c) => `${c.front}\t${c.back}`).join("\n");
    navigator.clipboard.writeText(tsv);
    alert("Deck copié au format Anki / Quizlet (collable directement) !");
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Header bar: Streak & Mirror trigger */}
      <div className="w-full flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>Streak {streak}</span>
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {imageUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMirror(true)}
              className="h-8 text-xs gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
            >
              <Eye className="w-3.5 h-3.5" />
              Note originale
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            title="Exporter vers Anki"
            className="h-8 w-8 text-zinc-400 hover:text-white"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Interactive 3D Card with Touch Swipe */}
      <div
        className="w-full h-[380px] sm:h-[420px] relative cursor-pointer perspective-1000"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
          transition: dragOffset === 0 ? "transform 0.25s ease-out" : "none",
        }}
      >
        <div
          className={`w-full h-full duration-500 preserve-3d transition-transform ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Card Front (Recto) */}
          <div className="absolute inset-0 backface-hidden flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
              <span className="uppercase tracking-wider">{subject || "Concept Clé"}</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Recto</span>
            </div>

            <div className="flex-1 flex items-center justify-center text-center py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {currentCard.front}
              </h2>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400/80 font-medium">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Touche pour retourner</span>
            </div>
          </div>

          {/* Card Back (Verso) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
              <span className="uppercase tracking-wider text-amber-400">Réponse &amp; Explication</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Verso</span>
            </div>

            <div className="flex-1 flex items-center justify-center text-center py-4 overflow-y-auto">
              <p className="text-base sm:text-lg text-zinc-100 font-medium whitespace-pre-line leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            <div className="text-center text-xs text-zinc-500">
              Glisse à gauche (À revoir) ou à droite (Je sais)
            </div>
          </div>
        </div>
      </div>

      {/* Actions in Thumb Zone (Bottom) */}
      <div className="w-full grid grid-cols-2 gap-3 mt-6">
        <Button
          onClick={() => handleNextCard(false)}
          className="h-14 rounded-2xl bg-zinc-900 hover:bg-rose-950/40 border border-rose-900/40 text-rose-400 font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
          À revoir
        </Button>

        <Button
          onClick={() => handleNextCard(true)}
          className="h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          Je sais
        </Button>
      </div>

      {/* Mirror Drawer & Paywall Modal */}
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
