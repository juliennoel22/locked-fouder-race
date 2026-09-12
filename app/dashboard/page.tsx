"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { NotebookItem } from "@/types/loreno";
import { NotebookListView } from "@/components/dashboard/notebook-list-view";
import { NotebookDetail } from "@/components/dashboard/notebook-detail";
import { FloatingScanBar } from "@/components/dashboard/floating-scan-bar";
import { PaywallModal } from "@/components/paywall-modal";
import { useProStatus } from "@/lib/use-pro-status";

export default function DashboardPage() {
  const [notebooks, setNotebooks] = useState<NotebookItem[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<NotebookItem | null>(null);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
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

  // Charger le cours scanné depuis sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("loreno_scan_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.scanData && parsed.scanData.title) {
            const newNotebook: NotebookItem = {
              id: "scanned-" + Date.now(),
              title: parsed.scanData.title,
              subject: parsed.scanData.subject || "Cours scanné",
              emoji: "📝",
              date: "À l'instant",
              sourceCount: parsed.scanData.flashcards?.length || 5,
              deck: parsed.scanData,
              imageUrl: parsed.imageUrl,
            };

            setNotebooks((prev) => [newNotebook, ...prev.filter((n) => n.title !== newNotebook.title)]);
            setSelectedNotebook(newNotebook);
          }
        } catch (e) {
          console.error("Erreur lecture cache scan:", e);
        }
      }
    }
  }, []);

  const handleAddNewNotebook = (newNb: NotebookItem) => {
    setNotebooks((prev) => [newNb, ...prev]);
    setSelectedNotebook(newNb);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black selection:bg-black selection:text-white">
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

        {selectedNotebook ? (
          <NotebookDetail
            notebook={selectedNotebook}
            onBack={() => setSelectedNotebook(null)}
            onOpenPaywall={() => setShowPaywall(true)}
            isPro={isPro}
          />
        ) : (
          <NotebookListView
            notebooks={notebooks}
            onSelectNotebook={(nb) => setSelectedNotebook(nb)}
            onOpenPaywall={() => setShowPaywall(true)}
            isPro={isPro}
          />
        )}

        {/* Barre flottante Caméra & Nouveau Carnet dans la Thumb Zone */}
        {!selectedNotebook && (
          <FloatingScanBar
            onNewNotebook={handleAddNewNotebook}
            isRateLimited={!isPro && notebooks.length >= 2}
            onRateLimit={() => setShowPaywall(true)}
          />
        )}

        {/* Modal Paywall Stripe */}
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
        />
      </div>
    </main>
  );
}
