"use client";

import { useEffect, useState } from "react";
import { NotebookItem } from "@/types/loreno";
import { INITIAL_NOTEBOOKS } from "@/lib/initial-notebooks";
import { NotebookListView } from "@/components/dashboard/notebook-list-view";
import { NotebookDetail } from "@/components/dashboard/notebook-detail";
import { FloatingScanBar } from "@/components/dashboard/floating-scan-bar";
import { PaywallModal } from "@/components/paywall-modal";

export default function DashboardPage() {
  const [notebooks, setNotebooks] = useState<NotebookItem[]>(INITIAL_NOTEBOOKS);
  const [selectedNotebook, setSelectedNotebook] = useState<NotebookItem | null>(null);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

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
        {selectedNotebook ? (
          <NotebookDetail
            notebook={selectedNotebook}
            onBack={() => setSelectedNotebook(null)}
            onOpenPaywall={() => setShowPaywall(true)}
          />
        ) : (
          <NotebookListView
            notebooks={notebooks}
            onSelectNotebook={(nb) => setSelectedNotebook(nb)}
            onOpenPaywall={() => setShowPaywall(true)}
          />
        )}

        {/* Barre flottante Caméra & Nouveau Carnet dans la Thumb Zone */}
        {!selectedNotebook && (
          <FloatingScanBar onNewNotebook={handleAddNewNotebook} />
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
