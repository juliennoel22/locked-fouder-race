import { Flashcard } from "@/types/loreno";
import { ReviewQueueItem } from "./review-types";
import { ReviewInterleavingMode } from "@/lib/review-config";

interface QueueBuilderOptions {
  step: number;
  flashcards: Flashcard[];
  initialQuizQuestion?: string | null;
  initialQuizAnswer?: string | null;
  deckTitle: string;
  deckId?: string;
  mode?: ReviewInterleavingMode;
}

/**
 * Construit une micro-session panachée progressive modulable (Interleaving).
 * Découpe chronologique en 3 tiers :
 * - Tiers 1 (Début) : Étapes 1 & 2
 * - Tiers 2 (Cœur)  : Étape 3 & 4 (+ révision espacée des notions faibles)
 * - Tiers 3 (Fin)   : Étapes 5 & 6 (+ pièges d'examen)
 */
export function buildQueueForStep({
  step,
  flashcards,
  initialQuizQuestion,
  initialQuizAnswer,
  deckTitle,
  deckId,
  mode = "flash",
}: QueueBuilderOptions): ReviewQueueItem[] {
  const queue: ReviewQueueItem[] = [];
  const safeCards = Array.isArray(flashcards) && flashcards.length > 0 ? flashcards : [];
  const now = Date.now();

  const fallbackCard: Flashcard = {
    front: deckTitle,
    back: "Concept fondamental du cours à assimiler pour les examens.",
    distractors: ["Distracteur A", "Distracteur B", "Distracteur C"],
  };

  const total = Math.max(1, safeCards.length);
  const t1End = Math.max(1, Math.ceil(total / 3));
  const t2End = Math.max(t1End, Math.ceil((2 * total) / 3));

  const tier1Cards = safeCards.slice(0, t1End);
  const tier2Cards = safeCards.slice(t1End, t2End);
  const tier3Cards = safeCards.slice(t2End);

  const getFromTier = (tier: Flashcard[], idx: number): Flashcard => {
    if (tier.length > 0) return tier[idx % tier.length];
    return safeCards[idx % total] || fallbackCard;
  };

  // Lecture des cartes à renforcer depuis le localStorage (SRS)
  let retryCard: Flashcard | null = null;
  try {
    if (typeof window !== "undefined" && deckId) {
      const stored = localStorage.getItem(`loreno_weak_cards_${deckId}`);
      if (stored) {
        const weakList = JSON.parse(stored);
        if (Array.isArray(weakList) && weakList.length > 0) {
          const match = safeCards.find((c) => c.front === weakList[0]);
          if (match) retryCard = match;
        }
      }
    }
  } catch {}

  switch (step) {
    // 📖 ÉTAPE 1 : Amorçage & Notions Fondatrices (Tiers 1)
    case 1: {
      const c0 = getFromTier(tier1Cards, 0);
      const c1 = getFromTier(tier1Cards, 1);

      queue.push({ id: `concept-0-${now}`, type: "concept", front: c0.front, back: c0.back });
      queue.push({ id: `fc-0-${now}`, type: "flashcard", front: c0.front, back: c0.back, distractors: c0.distractors });
      if (mode !== "flash") {
        queue.push({ id: `fc-1-${now}`, type: "flashcard", front: c1.front, back: c1.back, distractors: c1.distractors });
      }
      queue.push({ id: `qz-0-${now}`, type: "quiz", front: c0.front, back: c0.back, distractors: c0.distractors });
      if (mode === "deep") {
        queue.push({ id: `qz-1-${now}`, type: "quiz", front: c1.front, back: c1.back, distractors: c1.distractors });
      }
      break;
    }

    // ✨ ÉTAPE 2 : Consolidation 3D (Tiers 1)
    case 2: {
      const c1 = getFromTier(tier1Cards, 1);
      const c2 = getFromTier(tier1Cards, 2);

      queue.push({ id: `fc-1-${now}`, type: "flashcard", front: c1.front, back: c1.back, distractors: c1.distractors });
      queue.push({ id: `qz-1-${now}`, type: "quiz", front: c1.front, back: c1.back, distractors: c1.distractors });
      queue.push({ id: `fc-2-${now}`, type: "flashcard", front: c2.front, back: c2.back, distractors: c2.distractors });
      if (mode !== "flash") {
        queue.push({ id: `qz-2-${now}`, type: "quiz", front: c2.front, back: c2.back, distractors: c2.distractors });
      }
      break;
    }

    // ❓ ÉTAPE 3 : Challenge Notions & Espacement SRS (Tiers 2 + Cartes à revoir)
    case 3: {
      const cMid = getFromTier(tier2Cards, 0);
      const cSpacing = retryCard || getFromTier(tier1Cards, 0);
      const cMid2 = getFromTier(tier2Cards, 1);

      queue.push({ id: `qz-mid-${now}`, type: "quiz", front: cMid.front, back: cMid.back, distractors: cMid.distractors });
      queue.push({
        id: `fc-spacing-${now}`,
        type: "flashcard",
        front: cSpacing.front,
        back: cSpacing.back,
        distractors: cSpacing.distractors,
        isRetry: Boolean(retryCard),
      });
      queue.push({ id: `qz-mid2-${now}`, type: "quiz", front: cMid2.front, back: cMid2.back, distractors: cMid2.distractors });
      if (mode !== "flash") {
        queue.push({ id: `ft-mid-${now}`, type: "free_text", front: cMid.front, back: cMid.back });
      }
      break;
    }

    // 🎁 ÉTAPE 4 : Coffre Trésor (Dopamine mi-parcours)
    case 4: {
      queue.push({
        id: `chest-${now}`,
        type: "chest",
        front: "Coffre Trésor Débloqué !",
        back: "Cap des 50% atteint. Tu as validé les mécanismes fondateurs du cours.",
      });
      break;
    }

    // 🔥 ÉTAPE 5 : Rappel Actif Exigeant (Tiers 3 : fin de cours)
    case 5: {
      const cEnd0 = getFromTier(tier3Cards, 0);
      const cEnd1 = getFromTier(tier3Cards, 1);

      queue.push({ id: `fc-end0-${now}`, type: "flashcard", front: cEnd0.front, back: cEnd0.back, distractors: cEnd0.distractors });
      queue.push({ id: `qz-end1-${now}`, type: "quiz", front: cEnd1.front, back: cEnd1.back, distractors: cEnd1.distractors });
      queue.push({ id: `ft-end0-${now}`, type: "free_text", front: cEnd0.front, back: cEnd0.back });
      if (mode !== "flash") {
        queue.push({ id: `ft-end1-${now}`, type: "free_text", front: cEnd1.front, back: cEnd1.back });
      }
      break;
    }

    // 🏆 ÉTAPE 6 : Épreuve Finale (Question Piège & Verdict)
    case 6:
    default: {
      const cEndLast = getFromTier(tier3Cards, tier3Cards.length - 1);
      const fallbackTrap = safeCards[0] || fallbackCard;
      const resolvedQuestion = initialQuizQuestion?.trim() || fallbackTrap.front;
      const resolvedAnswer = initialQuizAnswer?.trim() || fallbackTrap.back;

      queue.push({ id: `qz-fin-${now}`, type: "quiz", front: cEndLast.front, back: cEndLast.back, distractors: cEndLast.distractors });
      if (mode !== "flash") {
        queue.push({ id: `ft-fin-${now}`, type: "free_text", front: cEndLast.front, back: cEndLast.back });
      }
      queue.push({ id: `trap-${now}`, type: "exam_trap", front: resolvedQuestion, back: resolvedAnswer });
      break;
    }
  }

  return queue;
}
