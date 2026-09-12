"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { MessageSquare, Loader2 } from "lucide-react";
import { NotebookItem, ScanResult } from "@/types/loreno";
import { NotebookListView } from "@/components/dashboard/notebook-list-view";
import { NotebookDetail } from "@/components/dashboard/notebook-detail";
import { FloatingScanBar } from "@/components/dashboard/floating-scan-bar";
import { PaywallModal } from "@/components/paywall-modal";
import { FeedbackModal } from "@/components/dashboard/feedback-modal";
import { useProStatus } from "@/lib/use-pro-status";
import { createClient } from "@/lib/supabase/client";

interface RawDeckData {
  id: string;
  title: string;
  subject?: string | null;
  summary?: string | null;
  initial_quiz_question?: string | null;
  image_url?: string | null;
  created_at?: string;
  flashcards?: Array<{ front: string; back: string; order_index?: number }>;
}

function formatDeckItem(deck: RawDeckData): NotebookItem {
  const sortedCards = (deck.flashcards || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const scanData: ScanResult = {
    title: deck.title,
    subject: deck.subject || "Général",
    summary: deck.summary || "",
    initial_quiz_question: deck.initial_quiz_question || "",
    flashcards: sortedCards.map((f) => ({ front: f.front, back: f.back })),
  };
  const createdDate = deck.created_at
    ? new Date(deck.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    : "Récemment";

  return {
    id: deck.id,
    title: deck.title,
    subject: deck.subject || "Général",
    emoji: "📝",
    date: createdDate,
    sourceCount: sortedCards.length || 5,
    deck: scanData,
    imageUrl: deck.image_url,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<NotebookItem[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<NotebookItem | null>(null);
  const [selectedNotebookMode, setSelectedNotebookMode] = useState<"grid" | "flashcards" | "quiz">("grid");
  const [showAiTutorDirect, setShowAiTutorDirect] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isPro, justUnlocked, dismissCelebration } = useProStatus();

  // Célébration confettis lors du déblocage post-paiement
  useEffect(() => {
    if (justUnlocked) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [justUnlocked]);

  // Nettoyer automatiquement les hash résiduels dans l'URL
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("error")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Initialisation et chargement complet des carnets depuis Supabase
  const initDashboard = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        setUserEmail(userData.user.email);
      }

      // 1. Récupération des carnets réels en base de données
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
            if (parsed.scanData && parsed.scanData.title) {
              const alreadyExists = loadedNotebooks.some(
                (n) => n.title.trim().toLowerCase() === parsed.scanData.title.trim().toLowerCase()
              );

              if (!alreadyExists && userData?.user) {
                const saveRes = await fetch("/api/decks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: parsed.scanData.title,
                    subject: parsed.scanData.subject,
                    summary: parsed.scanData.summary,
                    initial_quiz_question: parsed.scanData.initial_quiz_question,
                    image_url: parsed.imageUrl,
                    flashcards: parsed.scanData.flashcards,
                  }),
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
  }, []);

  useEffect(() => {
    initDashboard();
  }, [initDashboard]);

  const handleAddNewNotebook = (newNb: NotebookItem) => {
    setNotebooks((prev) => [newNb, ...prev]);
    setSelectedNotebook(newNb);
    setSelectedNotebookMode("grid");
    setShowAiTutorDirect(false);
    initDashboard();
  };

  const handleDeleteNotebook = async (id: string) => {
    try {
      await fetch(`/api/decks?id=${id}`, { method: "DELETE" });
      setNotebooks((prev) => prev.filter((n) => n.id !== id));
      if (selectedNotebook?.id === id) {
        setSelectedNotebook(null);
      }
    } catch (err) {
      console.error("Erreur suppression carnet :", err);
    }
  };

  const handleActionClick = (mode: "flashcards" | "quiz" | "tutor") => {
    if (notebooks.length === 0) {
      router.push("/dashboard/new");
      return;
    }

    const targetNb = notebooks[0];
    setSelectedNotebook(targetNb);

    if (mode === "tutor") {
      setSelectedNotebookMode("grid");
      setShowAiTutorDirect(true);
    } else {
      setSelectedNotebookMode(mode);
      setShowAiTutorDirect(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black">
        {/* Bannière de célébration Pack Fondateur activé */}
        {justUnlocked && (
          <div className="mb-3 p-3.5 rounded-2xl bg-black text-white flex items-center justify-between animate-in slide-in-from-top duration-300 shadow-md">
            <div className="text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <span>🎉</span> Pack Fondateur Activé à vie !
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                Tous tes accès illimités et le Tuteur IA sont débloqués.
              </p>
            </div>
            <button
              onClick={dismissCelebration}
              className="text-[11px] font-bold px-2.5 py-1 bg-white text-black rounded-lg hover:bg-zinc-200 transition shrink-0 ml-2"
            >
              C&apos;est parti
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            <p className="text-xs text-zinc-500 font-medium">Chargement de tes carnets...</p>
          </div>
        ) : selectedNotebook ? (
          <NotebookDetail
            notebook={selectedNotebook}
            onBack={() => {
              setSelectedNotebook(null);
              setSelectedNotebookMode("grid");
              setShowAiTutorDirect(false);
            }}
            onOpenPaywall={() => setShowPaywall(true)}
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
            onActionClick={handleActionClick}
          />
        )}

        {/* Barre flottante Caméra, Nouveau Carnet & Avis dans la Thumb Zone */}
        {!selectedNotebook && !loading && (
          <FloatingScanBar
            onNewNotebook={handleAddNewNotebook}
            isRateLimited={!isPro && notebooks.length >= 2}
            onRateLimit={() => setShowPaywall(true)}
            onOpenFeedback={() => setShowFeedbackModal(true)}
          />
        )}

        {/* Modal Paywall Stripe */}
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
        />

        {/* Modal Popup des Avis & Retours Étudiants */}
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      </div>
    </main>
  );
}
