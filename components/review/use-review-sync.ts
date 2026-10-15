import { useEffect, useRef, useCallback } from "react";

interface UseReviewSyncProps {
  deckId: string;
  currentStep: number;
}

export function useReviewSync({ deckId, currentStep }: UseReviewSyncProps) {
  const sessionLogsRef = useRef<
    Array<{ cardFront: string; rating: "again" | "good" | "hard"; stepNumber?: number }>
  >([]);

  // Hydratation cross-device des cartes faibles (FEAT-018)
  useEffect(() => {
    if (!deckId || deckId.startsWith("demo-")) return;
    try {
      if (typeof window !== "undefined" && !localStorage.getItem(`loreno_weak_cards_${deckId}`)) {
        fetch(`/api/review/log?deckId=${deckId}`)
          .then((r) => r.json())
          .then((res) => {
            if (res.success && Array.isArray(res.weakCards) && res.weakCards.length > 0) {
              localStorage.setItem(`loreno_weak_cards_${deckId}`, JSON.stringify(res.weakCards));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [deckId]);

  const logCardReview = useCallback(
    (cardFront: string, rating: "again" | "good" | "hard") => {
      sessionLogsRef.current.push({ cardFront, rating, stepNumber: currentStep });
    },
    [currentStep]
  );

  const recordWeakCard = useCallback(
    (cardFront: string) => {
      try {
        if (typeof window !== "undefined" && deckId) {
          const stored = localStorage.getItem(`loreno_weak_cards_${deckId}`);
          const list: string[] = stored ? JSON.parse(stored) : [];
          if (!list.includes(cardFront)) {
            list.push(cardFront);
            localStorage.setItem(`loreno_weak_cards_${deckId}`, JSON.stringify(list.slice(-5)));
          }
        }
      } catch {}
    },
    [deckId]
  );

  const saveProgressToDb = useCallback(
    async (percent: number) => {
      if (!deckId) return;
      const targetPercent = Math.max(0, Math.min(100, Math.round(percent)));
      try {
        if (typeof window !== "undefined") {
          const stored = Number(localStorage.getItem(`loreno_progress_${deckId}`) || 0);
          localStorage.setItem(`loreno_progress_${deckId}`, String(Math.max(stored, targetPercent)));
        }
      } catch {}

      if (deckId.startsWith("demo-")) return;
      try {
        await fetch("/api/decks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deckId, progress_percent: targetPercent }),
        });
        if (sessionLogsRef.current.length > 0) {
          fetch("/api/review/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deckId, logs: sessionLogsRef.current }),
          }).catch(() => {});
        }
      } catch (e) {
        console.error("Erreur sync session :", e);
      }
    },
    [deckId]
  );

  const resetSessionLogs = useCallback(() => {
    sessionLogsRef.current = [];
  }, []);

  return {
    logCardReview,
    recordWeakCard,
    saveProgressToDb,
    resetSessionLogs,
  };
}
