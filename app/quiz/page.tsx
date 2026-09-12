"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { compressCourseImage } from "@/lib/image-compression";
import { ScanApiResponse, ScanResult } from "@/types/loreno";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SCAN_RESULT } from "@/lib/quiz-data";
import { QuizLoadingOverlay } from "@/components/quiz-loading-overlay";
import { QuizScanStep, ScannedPhotoItem } from "@/components/quiz-scan-step";
import { FlashcardPlayer } from "@/components/flashcard-player";
import { QuizStepsForm } from "@/components/quiz-steps-form";

export default function QuizPage() {
  const router = useRouter();

  // 1: Level, 2: Goal, 3: Name, 4: Pain, 5: Upload
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  const [level, setLevel] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [painPoint, setPainPoint] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedPhotos, setSelectedPhotos] = useState<ScannedPhotoItem[]>([]);
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(null);

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      router.push("/");
    }
  };

  const selectOptionAndAdvance = (setter: (val: string) => void, value: string) => {
    setter(value);
    setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 150);
  };

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
      setErrorMessage("Veuillez ajouter au moins une photo de votre cours.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    setLoadingProgress(15);
    setLoadingMessage(
      selectedPhotos.length > 1
        ? `Compression optimisée de tes ${selectedPhotos.length} pages...`
        : "Compression de ta note de cours..."
    );

    try {
      const compressedList = await Promise.all(
        selectedPhotos.map((p) => compressCourseImage(p.file, 1600, 0.8))
      );

      setLoadingProgress(45);
      setLoadingMessage(
        selectedPhotos.length > 1
          ? `Analyse multimodale de tes ${selectedPhotos.length} pages combinées...`
          : "Analyse multimodale de ton cours..."
      );

      const imagesPayload = compressedList.map((c) => ({
        base64: c.base64,
        mimeType: "image/jpeg",
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

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "loreno_scan_cache",
          JSON.stringify({
            scanData: finalScanResult,
            imageUrl: primaryImageUrl,
            pageCount: selectedPhotos.length,
            userName,
            level,
            goal,
          })
        );
      }

      setTimeout(() => {
        setScanData(finalScanResult);
        setScannedImageUrl(primaryImageUrl);
        setLoading(false);
      }, 400);
    } catch (err) {
      console.error("Erreur scan:", err);
      const fallback = DEFAULT_SCAN_RESULT;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "loreno_scan_cache",
          JSON.stringify({
            scanData: fallback,
            userName,
            level,
            goal,
          })
        );
      }
      setScanData(fallback);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Écran de Chargement / Traitement (Astra AI style original)
  if (loading) {
    return <QuizLoadingOverlay message={loadingMessage} progress={loadingProgress} />;
  }

  // Écran du Test Flashcards (dès la fin du scan, pas de paywall, swipe complet avant /auth)
  if (scanData) {
    return (
      <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
        <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black">
          <div className="w-full pt-2 mb-2">
            <div className="flex items-center justify-between h-9 mb-3">
              <button
                onClick={() => setScanData(null)}
                className="p-2 -ml-2 text-zinc-400 hover:text-black transition"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Image
                src="/logo.png"
                alt="loreno.app"
                width={130}
                height={32}
                className="h-7 sm:h-8 w-auto object-contain"
                priority
              />
              <span className="text-xs font-mono text-zinc-400">
                Test en direct
              </span>
            </div>
          </div>

          <FlashcardPlayer
            cards={scanData.flashcards}
            deckTitle={scanData.title}
            subject={scanData.subject}
            imageUrl={scannedImageUrl}
            initialQuizQuestion={scanData.initial_quiz_question}
            summary={scanData.summary}
            disablePaywall={true}
            onComplete={() => {
              router.push("/auth");
            }}
          />

          <div className="py-2 text-center text-[11px] text-zinc-400">
            Loreno
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black selection:bg-black selection:text-white">
        {/* Top Header : Back Button, Logo & Progress Bar */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between h-9 mb-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-zinc-400 hover:text-black transition"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Image
              src="/logo.png"
              alt="loreno.app"
              width={130}
              height={32}
              className="h-7 sm:h-8 w-auto object-contain"
              priority
            />
            <span className="text-xs font-mono text-zinc-400">
              {step + 1} / 6
            </span>
          </div>

          <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden border border-zinc-200">
            <div
              className="bg-black h-full transition-all duration-300"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content Area */}
        {step <= 4 ? (
          <QuizStepsForm
            step={step}
            level={level}
            setLevel={setLevel}
            goal={goal}
            setGoal={setGoal}
            userName={userName}
            setUserName={setUserName}
            painPoint={painPoint}
            setPainPoint={setPainPoint}
            selectOptionAndAdvance={selectOptionAndAdvance}
            onAdvanceToStep4={() => setStep(4)}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-center py-6">
            <QuizScanStep
              photos={selectedPhotos}
              onAddPhotos={handleAddPhotos}
              onRemovePhoto={handleRemovePhoto}
              onConfirmAndScan={handleConfirmAndScan}
              onSkip={() => {
                const sample = DEFAULT_SCAN_RESULT;
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(
                    "loreno_scan_cache",
                    JSON.stringify({
                      scanData: sample,
                      userName,
                      level,
                      goal,
                    })
                  );
                }
                setScanData(sample);
              }}
              errorMessage={errorMessage}
            />
          </div>
        )}

        {/* Footer Minimalist */}
        <div className="py-2 text-center text-[11px] text-zinc-400">
          Loreno
        </div>
      </div>
    </main>
  );
}
