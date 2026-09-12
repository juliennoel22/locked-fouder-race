"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { compressCourseImage } from "@/lib/image-compression";
import { ScanApiResponse, ScanResult, NotebookItem } from "@/types/loreno";
import { DEFAULT_SCAN_RESULT } from "@/lib/quiz-data";
import { QuizScanStep, ScannedPhotoItem } from "@/components/quiz-scan-step";
import { QuizLoadingOverlay } from "@/components/quiz-loading-overlay";

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDeck: NotebookItem, targetMode?: "flashcards" | "quiz" | "tutor" | "grid") => void;
  isPro: boolean;
  existingNotebooksCount: number;
  onOpenPaywall: () => void;
  targetMode?: "flashcards" | "quiz" | "tutor" | "grid";
}

export function ScanModal({
  isOpen,
  onClose,
  onSuccess,
  isPro,
  existingNotebooksCount,
  onOpenPaywall,
  targetMode = "grid",
}: ScanModalProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<ScannedPhotoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
      setErrorMessage("Ajoute au moins une photo ou un document de ton cours.");
      return;
    }

    // Limite de 2 projets gratuits pour les non-pro
    if (!isPro && existingNotebooksCount >= 2) {
      onClose();
      onOpenPaywall();
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
          ? "Extraction IA des notions clés du document..."
          : selectedPhotos.length > 1
          ? `Analyse multimodale de tes ${selectedPhotos.length} pages...`
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
        body: JSON.stringify({ images: imagesPayload }),
      });

      const json: ScanApiResponse = await res.json();
      const finalScanResult: ScanResult = json.data || DEFAULT_SCAN_RESULT;

      setLoadingProgress(85);
      setLoadingMessage("Sauvegarde de ton cours...");

      const primaryImageUrl = compressedList[0]?.previewUrl || null;

      // Sauvegarde automatique dans la base Supabase
      const saveRes = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalScanResult.title,
          subject: finalScanResult.subject,
          summary: finalScanResult.summary,
          initial_quiz_question: finalScanResult.initial_quiz_question,
          image_url: primaryImageUrl,
          flashcards: finalScanResult.flashcards,
        }),
      });

      const saveJson = await saveRes.json();
      let createdNotebook: NotebookItem;

      if (saveJson.success && saveJson.deck) {
        const d = saveJson.deck;
        createdNotebook = {
          id: d.id,
          title: d.title,
          subject: d.subject || "Général",
          emoji: "📝",
          date: "Aujourd'hui",
          sourceCount: d.flashcards?.length || finalScanResult.flashcards.length,
          deck: finalScanResult,
          imageUrl: primaryImageUrl,
        };
      } else {
        createdNotebook = {
          id: `local-${Date.now()}`,
          title: finalScanResult.title,
          subject: finalScanResult.subject,
          emoji: "📝",
          date: "Aujourd'hui",
          sourceCount: finalScanResult.flashcards.length,
          deck: finalScanResult,
          imageUrl: primaryImageUrl,
        };
      }

      setLoadingProgress(100);
      setLoadingMessage("Terminé !");

      setTimeout(() => {
        setLoading(false);
        setSelectedPhotos([]);
        onSuccess(createdNotebook, targetMode);
        onClose();
      }, 300);
    } catch (err) {
      console.error("Erreur scan:", err);
      setErrorMessage("Une erreur est survenue lors de l'analyse du cours.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[92dvh] sm:h-auto sm:max-h-[85vh] bg-white border border-zinc-200 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modale */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                Scanne ton cours
              </h3>
              <p className="text-[11px] text-zinc-500">
                {targetMode === "flashcards"
                  ? "Créer des flashcards"
                  : targetMode === "quiz"
                  ? "Créer un quiz chrono"
                  : targetMode === "tutor"
                  ? "Activer l'assistant IA"
                  : "Nouveau cours de révision"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedPhotos([]);
              setErrorMessage(null);
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu Scan */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-center">
          {loading ? (
            <QuizLoadingOverlay message={loadingMessage} progress={loadingProgress} />
          ) : (
            <QuizScanStep
              photos={selectedPhotos}
              onAddPhotos={handleAddPhotos}
              onRemovePhoto={handleRemovePhoto}
              onConfirmAndScan={handleConfirmAndScan}
              errorMessage={errorMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
