"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { compressCourseImage } from "@/lib/image-compression";
import { ScanApiResponse, ScanResult, NotebookItem } from "@/types/loreno";
import { DEFAULT_SCAN_RESULT } from "@/lib/quiz-data";
import { QuizScanStep, ScannedPhotoItem } from "@/components/quiz-scan-step";
import { QuizLoadingOverlay } from "@/components/quiz-loading-overlay";
import { PaywallModal } from "@/components/paywall-modal";
import { createClient } from "@/lib/supabase/client";
import { useProStatus } from "@/lib/use-pro-status";

export default function NewNotebookPage() {
  const router = useRouter();
  const { isPro } = useProStatus();

  const [selectedPhotos, setSelectedPhotos] = useState<ScannedPhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [existingNotebooksCount, setExistingNotebooksCount] = useState(0);

  // Vérifier la limite de 2 projets gratuits via la base de données
  useEffect(() => {
    async function checkCount() {
      try {
        const res = await fetch("/api/decks");
        const json = await res.json();
        if (json.success && Array.isArray(json.decks)) {
          setExistingNotebooksCount(json.decks.length);
        }
      } catch (err) {
        console.error("Erreur récupération count decks :", err);
      }
    }
    checkCount();
  }, []);

  const handleAddPhotos = (newFiles: File[]) => {
    setErrorMessage(null);
    const newItems: ScannedPhotoItem[] = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSelectedPhotos((prev) => [...prev, ...newItems]);
  };

  const handleRemovePhoto = (id: string) => {
    setSelectedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConfirmAndScan = async () => {
    if (selectedPhotos.length === 0) {
      setErrorMessage("Ajoute au moins une photo de ton cours.");
      return;
    }

    // Blocage si la limite de 2 projets est atteinte (comptes gratuits uniquement)
    if (!isPro && existingNotebooksCount >= 2) {
      setShowPaywall(true);
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    setLoadingProgress(20);
    const hasPdf = selectedPhotos.some(
      (p) =>
        p.file.type === "application/pdf" ||
        p.file.name.toLowerCase().endsWith(".pdf")
    );

    setLoadingMessage(
      hasPdf
        ? "Préparation et analyse de tes documents..."
        : selectedPhotos.length > 1
        ? `Compression de tes ${selectedPhotos.length} pages...`
        : "Compression de ta page de cours..."
    );

    try {
      const compressedList = await Promise.all(
        selectedPhotos.map((p) => compressCourseImage(p.file, 1600, 0.8))
      );

      setLoadingProgress(50);
      setLoadingMessage(
        hasPdf
          ? "Extraction IA des concepts clés du document..."
          : selectedPhotos.length > 1
          ? `Analyse multimodale de tes ${selectedPhotos.length} pages combinées...`
          : "Analyse multimodale de ton cours..."
      );

      const imagesPayload = compressedList.map((c) => ({
        base64: c.base64,
        mimeType: c.mimeType || (c.isPdf ? "application/pdf" : "image/jpeg"),
        imageUrl: c.previewUrl,
      }));

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imagesPayload,
        }),
      });

      const json: ScanApiResponse = await res.json();
      const finalScanResult: ScanResult = json.data || DEFAULT_SCAN_RESULT;

      setLoadingProgress(100);
      setLoadingMessage("Génération terminée !");

      const primaryImageUrl = compressedList[0]?.previewUrl;

      // Enregistrer dans le cache pour affichage instantané sur le dashboard
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "loreno_scan_cache",
          JSON.stringify({
            scanData: finalScanResult,
            imageUrl: primaryImageUrl,
            pageCount: selectedPhotos.length,
          })
        );
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 400);
    } catch (err) {
      console.error("Erreur scan:", err);
      setErrorMessage("Une erreur est survenue lors de l'analyse du cours.");
      setLoading(false);
    }
  };

  if (loading) {
    return <QuizLoadingOverlay message={loadingMessage} progress={loadingProgress} />;
  }

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black">
        {/* Header */}
        <header className="w-full pt-1 flex items-center justify-between h-12 border-b border-zinc-200 pb-2 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black transition p-1 -ml-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Annuler</span>
          </Link>

          <span className="text-xs font-bold text-black uppercase tracking-wider">
            Nouveau cours
          </span>

          {isPro ? (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 border border-zinc-300 text-black flex items-center gap-1">
              <span>⭐</span> PREMIUM
            </span>
          ) : (
            <button
              onClick={() => setShowPaywall(true)}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black text-white hover:bg-zinc-800 transition"
            >
              PRO
            </button>
          )}
        </header>

        {/* Corps principal : Sélection multi-photos & Confirmation */}
        <div className="flex-1 flex flex-col justify-center py-4">
          <QuizScanStep
            photos={selectedPhotos}
            onAddPhotos={handleAddPhotos}
            onRemovePhoto={handleRemovePhoto}
            onConfirmAndScan={handleConfirmAndScan}
            errorMessage={errorMessage}
          />
        </div>

        {/* Footer */}
        <div className="py-2 text-center text-[11px] text-zinc-400">
          Loreno • Multi-pages IA
        </div>

        {/* Modal Paywall si limite de 2 projets atteinte */}
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
        />
      </div>
    </main>
  );
}
