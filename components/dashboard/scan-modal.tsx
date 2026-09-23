"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { compressCourseImage } from "@/lib/image-compression";
import { ScanApiResponse, ScanResult, NotebookItem } from "@/types/loreno";
import { DEFAULT_SCAN_RESULT } from "@/lib/quiz-data";
import { QuizScanStep, ScannedPhotoItem } from "@/components/quiz-scan-step";
import { QuizLoadingOverlay } from "@/components/quiz-loading-overlay";
import { OnboardingTourBubble } from "./onboarding-tour-bubble";
import { isOnboardingCompleted, setTourStep } from "@/lib/onboarding-tour-state";

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
  const [cardCount, setCardCount] = useState<number>(8);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTourBanner, setShowTourBanner] = useState<boolean>(true);
  const isSubmittingRef = useRef<boolean>(false);

  if (!isOpen) return null;

  const isTourActive = showTourBanner && !isOnboardingCompleted();

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

    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;

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
        body: JSON.stringify({ images: imagesPayload, cardCount }),
      });

      const json: ScanApiResponse = await res.json();
      const finalScanResult: ScanResult = json.data || DEFAULT_SCAN_RESULT;

      setLoadingProgress(90);
      setLoadingMessage("Fiche de cours prête !");

      const primaryImageUrl = compressedList[0]?.previewUrl || null;
      const savedDeckId = json.deckId;

      let createdNotebook: NotebookItem;

      if (savedDeckId) {
        createdNotebook = {
          id: savedDeckId,
          title: finalScanResult.title,
          subject: finalScanResult.subject || "Général",
          emoji: "📝",
          date: "Aujourd'hui",
          sourceCount: 0,
          deck: finalScanResult,
          imageUrl: primaryImageUrl,
        };
      } else {
        // Fallback si non connecté ou non sauvegardé
        const saveRes = await fetch("/api/decks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: finalScanResult.title,
            subject: finalScanResult.subject,
            summary: finalScanResult.summary,
            detailed_content: finalScanResult.detailed_content,
            image_url: primaryImageUrl,
            flashcards: [],
          }),
        });

        const saveJson = await saveRes.json();
        const deckId = saveJson?.deck?.id || `local-${Date.now()}`;

        createdNotebook = {
          id: deckId,
          title: finalScanResult.title,
          subject: finalScanResult.subject || "Général",
          emoji: "📝",
          date: "Aujourd'hui",
          sourceCount: 0,
          deck: finalScanResult,
          imageUrl: primaryImageUrl,
        };
      }

      setLoadingProgress(100);
      setLoadingMessage("Terminé !");

      setTimeout(() => {
        if (!isOnboardingCompleted()) {
          setTourStep("test_training");
        }
        setLoading(false);
        isSubmittingRef.current = false;
        setSelectedPhotos([]);
        onSuccess(createdNotebook, targetMode);
        onClose();
      }, 300);
    } catch (err) {
      console.error("Erreur scan:", err);
      setErrorMessage("Une erreur est survenue lors de l'analyse du cours.");
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex ${loading ? "items-center p-4" : "items-end sm:items-center p-0 sm:p-4"} justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200`}>
      <div className={`relative w-full max-w-md ${loading ? "h-auto max-h-[85vh] rounded-3xl" : "h-[92dvh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl"} bg-white border border-zinc-200 flex flex-col shadow-2xl overflow-hidden transition-all duration-300`}>
        {/* Header Modale */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2">
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
          {!loading && (
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
          )}
        </div>

        {/* Contenu Scan */}
        <div className={`flex-1 overflow-y-auto ${loading ? "p-3 sm:p-4" : "p-4"} flex flex-col justify-start space-y-3`}>
          {/* Étape 2 de l'Onboarding */}
          {isTourActive && !loading && (
            <OnboardingTourBubble
              show={true}
              onDismiss={() => setShowTourBanner(false)}
              stepNumber={2}
              totalSteps={3}
              title="Prends ton cours en photo"
              description="Ajoute une photo de tes notes ou un PDF pour que l'IA génère tes fiches de révision."
              arrowDirection="down"
            />
          )}

          {loading ? (
            <div className="w-full flex items-center justify-center py-2">
              <QuizLoadingOverlay message={loadingMessage} progress={loadingProgress} />
            </div>
          ) : (
            <QuizScanStep
              photos={selectedPhotos}
              onAddPhotos={handleAddPhotos}
              onRemovePhoto={handleRemovePhoto}
              onConfirmAndScan={handleConfirmAndScan}
              errorMessage={errorMessage}
              cardCount={cardCount}
              onCardCountChange={setCardCount}
              targetMode={targetMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
