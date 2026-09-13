"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Loader2 } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { formatDeckItem, RawDeckData } from "@/lib/format-deck";
import { NotebookListView } from "@/components/dashboard/notebook-list-view";
import { NotebookDetail } from "@/components/dashboard/notebook-detail";
import { FloatingScanBar } from "@/components/dashboard/floating-scan-bar";
import { PaywallModal } from "@/components/paywall-modal";
import { FeedbackModal } from "@/components/dashboard/feedback-modal";
import { ScanModal } from "@/components/dashboard/scan-modal";
import { useProStatus } from "@/lib/use-pro-status";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";

export default function DashboardPage() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<NotebookItem[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<NotebookItem | null>(null);
  const [selectedNotebookMode, setSelectedNotebookMode] = useState<"grid" | "flashcards" | "quiz">("grid");
  const [showAiTutorDirect, setShowAiTutorDirect] = useState<boolean>(false);
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [scanTargetMode, setScanTargetMode] = useState<"flashcards" | "quiz" | "tutor" | "grid">("grid");
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isPro, justUnlocked, dismissCelebration } = useProStatus();

  // Célébration confettis lors du déblocage post-paiement
  useEffect(() => {
    if (justUnlocked) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [justUnlocked]);

  // Toasts d'accueil connecté & fin d'onboarding
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isOnboard = urlParams.get("onboard") === "true" || urlParams.has("onboard");

      if (isOnboard) {
        showToast({
          title: "Bravo, votre espace est configuré ! 🎉",
          description: "Tes cours et tes outils de révision sont prêts.",
          type: "success",
        });
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      } else if (!sessionStorage.getItem("loreno_login_toast_shown")) {
        sessionStorage.setItem("loreno_login_toast_shown", "true");
        showToast({
          title: "Connecté avec succès 👋",
          description: "Bienvenue sur ton espace Loreno.",
          type: "success",
        });
      }
    }
  }, []);

  // Initialisation et chargement complet des cours depuis Supabase
  const initDashboard = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.replace("/auth/login?next=/dashboard");
        return;
      }

      const meta = userData.user.user_metadata || {};
      if (meta.onboarding_completed !== true && !isPro) {
        router.replace("/quiz");
        return;
      }

      if (userData.user.email) {
        setUserEmail(userData.user.email);
      }

      // 1. Récupération des cours réels en base de données
      const res = await fetch("/api/decks");
      const json = await res.json();
      let loadedNotebooks: NotebookItem[] = [];

      if (json.success && Array.isArray(json.decks)) {
        loadedNotebooks = json.decks.map((d: RawDeckData) => formatDeckItem(d));
      }

      // 2. Synchronisation automatique d'un scan d'onboarding résiduel dans Supabase
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem("loreno_scan_cache");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.scanData?.title) {
              const alreadyExists = loadedNotebooks.some(
                (n) => n.title.trim().toLowerCase() === parsed.scanData.title.trim().toLowerCase()
              );
              if (!alreadyExists && userData.user) {
                const { title, subject, summary, initial_quiz_question, flashcards } = parsed.scanData;
                const saveRes = await fetch("/api/decks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title, subject, summary, initial_quiz_question, image_url: parsed.imageUrl, flashcards }),
                });
                const saveJson = await saveRes.json();
                if (saveJson.success && saveJson.deck) {
                  const savedNb = formatDeckItem(saveJson.deck);
                  loadedNotebooks = [savedNb, ...loadedNotebooks];
                  sessionStorage.removeItem("loreno_scan_cache");
                  setSelectedNotebook(savedNb);
                }
              }
            }
          } catch (e) {
            console.error("Erreur sync cache scan:", e);
          }
        }
      }

      setNotebooks(loadedNotebooks);
    } catch (err) {
      console.error("Erreur chargement dashboard :", err);
    } finally {
      setLoading(false);
    }
  }, [isPro, router]);

  useEffect(() => {
    initDashboard();
  }, [initDashboard]);

  const handleAddNewNotebook = (
    newNb: NotebookItem,
    targetMode: "flashcards" | "quiz" | "tutor" | "grid" = "grid"
  ) => {
    setNotebooks((prev) => [newNb, ...prev]);
    setSelectedNotebook(newNb);
    setSelectedNotebookMode(targetMode === "flashcards" || targetMode === "quiz" ? targetMode : "grid");
    setShowAiTutorDirect(targetMode === "tutor");
  };

  const handleDeleteNotebook = async (id: string) => {
    try {
      await fetch(`/api/decks?id=${id}`, { method: "DELETE" });
      setNotebooks((prev) => prev.filter((n) => n.id !== id));
      if (selectedNotebook?.id === id) {
        setSelectedNotebook(null);
      }
    } catch (err) {
      console.error("Erreur suppression cours :", err);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black">
        {justUnlocked && (
          <div className="mb-3 p-3.5 rounded-2xl bg-black text-white flex items-center justify-between animate-in slide-in-from-top duration-300 shadow-md">
            <div className="text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <span>🎉</span> Pack Premium Activé à vie !
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                Tous tes accès illimités et le Tuteur IA sont débloqués.
              </p>
            </div>
            <button
              onClick={dismissCelebration}
              className="text-[11px] font-bold px-2.5 py-1 bg-white text-black rounded-lg hover:bg-zinc-200 transition shrink-0 ml-2 cursor-pointer"
            >
              C&apos;est parti
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            <p className="text-xs text-zinc-500 font-medium">Chargement de tes cours...</p>
          </div>
        ) : selectedNotebook ? (
          <NotebookDetail
            key={`${selectedNotebook.id}-${selectedNotebookMode}-${showAiTutorDirect}`}
            notebook={selectedNotebook}
            allNotebooks={notebooks}
            onSelectNotebook={(nb) => {
              setSelectedNotebook(nb);
              setSelectedNotebookMode("grid");
              setShowAiTutorDirect(false);
            }}
            onBack={() => {
              setSelectedNotebook(null);
              setSelectedNotebookMode("grid");
              setShowAiTutorDirect(false);
            }}
            onOpenPaywall={() => setShowPaywall(true)}
            onOpenScanModal={() => {
              setScanTargetMode("grid");
              setShowScanModal(true);
            }}
            isPro={isPro}
            initialMode={selectedNotebookMode}
            initialShowAiTutor={showAiTutorDirect}
          />
        ) : (
          <NotebookListView
            notebooks={notebooks}
            onSelectNotebook={(nb) => {
              setSelectedNotebook(nb);
              setSelectedNotebookMode("grid");
              setShowAiTutorDirect(false);
            }}
            onOpenPaywall={() => setShowPaywall(true)}
            isPro={isPro}
            userEmail={userEmail}
            onDeleteNotebook={handleDeleteNotebook}
            onActionClick={(mode) => {
              setScanTargetMode(mode);
              setShowScanModal(true);
            }}
            onOpenScanModal={() => {
              setScanTargetMode("grid");
              setShowScanModal(true);
            }}
          />
        )}

        {!selectedNotebook && !loading && (
          <FloatingScanBar
            onNewNotebook={(nb) => handleAddNewNotebook(nb, "grid")}
            isRateLimited={!isPro && notebooks.length >= 2}
            onRateLimit={() => setShowPaywall(true)}
            onOpenFeedback={() => setShowFeedbackModal(true)}
            onOpenScanModal={() => {
              setScanTargetMode("grid");
              setShowScanModal(true);
            }}
            isPro={isPro}
            notebooksCount={notebooks.length}
            onOpenPaywall={() => setShowPaywall(true)}
          />
        )}

        <ScanModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          onSuccess={(newDeck, targetMode) => handleAddNewNotebook(newDeck, targetMode)}
          isPro={isPro}
          existingNotebooksCount={notebooks.length}
          onOpenPaywall={() => setShowPaywall(true)}
          targetMode={scanTargetMode}
        />

        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
        <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
      </div>
    </main>
  );
}
