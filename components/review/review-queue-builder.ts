import { Flashcard } from "@/types/loreno";
import { ReviewQueueItem } from "./review-types";

interface QueueBuilderOptions {
  step: number;
  flashcards: Flashcard[];
  initialQuizQuestion?: string | null;
  initialQuizAnswer?: string | null;
  deckTitle: string;
}

/**
 * Construit une micro-session panachée progressive (Interleaving) de 60 à 90 secondes.
 * Chaque palier mixe plusieurs types d'interactions (lecture, flashcard 3D, QCM, saisie active)
 * pour casser le mode "pilote automatique" et doubler la rétention long terme.
 */
export function buildQueueForStep({
  step,
  flashcards,
  initialQuizQuestion,
  initialQuizAnswer,
  deckTitle,
}: QueueBuilderOptions): ReviewQueueItem[] {
  const queue: ReviewQueueItem[] = [];
  const safeCards = Array.isArray(flashcards) && flashcards.length > 0 ? flashcards : [];

  // Helper pour piocher une carte en toute sécurité avec rotation circulaire
  const getCard = (index: number): Flashcard => {
    if (safeCards.length === 0) {
      return {
        front: deckTitle,
        back: "Concept fondamental du cours à assimiler pour les examens.",
        distractors: ["Distracteur A", "Distracteur B", "Distracteur C"],
      };
    }
    return safeCards[index % safeCards.length];
  };

  const now = Date.now();

  switch (step) {
    // 📖 ÉTAPE 1 : Amorçage & Notions (1 Concept + 2 Flashcards + 1 QCM d'ancrage)
    case 1: {
      const c0 = getCard(0);
      const c1 = getCard(1);

      queue.push({
        id: `concept-0-${now}`,
        type: "concept",
        front: c0.front,
        back: c0.back,
      });
      queue.push({
        id: `fc-0-${now}`,
        type: "flashcard",
        front: c0.front,
        back: c0.back,
        distractors: c0.distractors,
      });
      queue.push({
        id: `fc-1-${now}`,
        type: "flashcard",
        front: c1.front,
        back: c1.back,
        distractors: c1.distractors,
      });
      queue.push({
        id: `qz-0-${now}`,
        type: "quiz",
        front: c0.front,
        back: c0.back,
        distractors: c0.distractors,
      });
      break;
    }

    // ✨ ÉTAPE 2 : Consolidation 3D (2 Flashcards + 2 QCMs de rapidité)
    case 2: {
      const c1 = getCard(1);
      const c2 = getCard(2);

      queue.push({
        id: `fc-1-${now}`,
        type: "flashcard",
        front: c1.front,
        back: c1.back,
        distractors: c1.distractors,
      });
      queue.push({
        id: `qz-1-${now}`,
        type: "quiz",
        front: c1.front,
        back: c1.back,
        distractors: c1.distractors,
      });
      queue.push({
        id: `fc-2-${now}`,
        type: "flashcard",
        front: c2.front,
        back: c2.back,
        distractors: c2.distractors,
      });
      queue.push({
        id: `qz-2-${now}`,
        type: "quiz",
        front: c2.front,
        back: c2.back,
        distractors: c2.distractors,
      });
      break;
    }

    // ❓ ÉTAPE 3 : Challenge Notions (2 QCMs + 1 Flashcard Spacing + 1er Rappel Libre)
    case 3: {
      const c0 = getCard(0);
      const c2 = getCard(2);
      const c3 = getCard(3);

      queue.push({
        id: `qz-2-${now}`,
        type: "quiz",
        front: c2.front,
        back: c2.back,
        distractors: c2.distractors,
      });
      queue.push({
        id: `fc-0-${now}`,
        type: "flashcard",
        front: c0.front,
        back: c0.back,
        distractors: c0.distractors,
      });
      queue.push({
        id: `qz-3-${now}`,
        type: "quiz",
        front: c3.front,
        back: c3.back,
        distractors: c3.distractors,
      });
      queue.push({
        id: `ft-1-${now}`,
        type: "free_text",
        front: c1OrFallback(c3, c0),
        back: c3.back,
      });
      break;
    }

    // 🎁 ÉTAPE 4 : Coffre Trésor (Dopamine & Checkpoint mi-parcours)
    case 4: {
      queue.push({
        id: `chest-${now}`,
        type: "chest",
        front: "Coffre Trésor Débloqué !",
        back: "Cap des 50% atteint. Tu as consolidé les bases du cours.",
      });
      break;
    }

    // 🔥 ÉTAPE 5 : Rappel Actif Exigeant (1 Flashcard + 1 QCM + 2 Saisies Libres)
    case 5: {
      const c0 = getCard(0);
      const c2 = getCard(2);
      const c3 = getCard(3);

      queue.push({
        id: `fc-3-${now}`,
        type: "flashcard",
        front: c3.front,
        back: c3.back,
        distractors: c3.distractors,
      });
      queue.push({
        id: `qz-0-${now}`,
        type: "quiz",
        front: c0.front,
        back: c0.back,
        distractors: c0.distractors,
      });
      queue.push({
        id: `ft-0-${now}`,
        type: "free_text",
        front: c0.front,
        back: c0.back,
      });
      queue.push({
        id: `ft-2-${now}`,
        type: "free_text",
        front: c2.front,
        back: c2.back,
      });
      break;
    }

    // 🏆 ÉTAPE 6 : Épreuve Finale (1 QCM + 1 Saisie Libre + Question Piège d'Examen)
    case 6:
    default: {
      const c1 = getCard(1);
      const c2 = getCard(2);
      const fallbackTrap = safeCards[0];
      const resolvedQuestion =
        initialQuizQuestion?.trim() ||
        fallbackTrap?.front ||
        `Question piège d'examen sur ${deckTitle}`;
      const resolvedAnswer =
        initialQuizAnswer?.trim() ||
        fallbackTrap?.back ||
        "Analyse les concepts clés de ta fiche pour justifier ta réponse d'examen.";

      queue.push({
        id: `qz-final-${now}`,
        type: "quiz",
        front: c1.front,
        back: c1.back,
        distractors: c1.distractors,
      });
      queue.push({
        id: `ft-final-${now}`,
        type: "free_text",
        front: c2.front,
        back: c2.back,
      });
      queue.push({
        id: `trap-${now}`,
        type: "exam_trap",
        front: resolvedQuestion,
        back: resolvedAnswer,
      });
      break;
    }
  }

  return queue;
}

function c1OrFallback(target: Flashcard, fallback: Flashcard): string {
  return target.front || fallback.front;
}
