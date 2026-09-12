"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { compressCourseImage } from "@/lib/image-compression";
import { ScanApiResponse, ScanResult } from "@/types/loreno";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SCAN_RESULT } from "@/lib/quiz-data";
import { QuizLoadingOverlay } from "@/components/quiz-loading-overlay";
import { QuizScanStep } from "@/components/quiz-scan-step";
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

  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setLoading(true);
    setLoadingProgress(15);
    setLoadingMessage("Compression de ta note...");

    try {
      const compressed = await compressCourseImage(file, 1600, 0.8);
      setLoadingProgress(35);
      setLoadingMessage("Lecture de l'écriture manuscrite...");

      let uploadedPublicUrl = compressed.previewUrl;
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id || "guest";
        const fileName = `${userId}/${Date.now()}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("course-scans")
          .upload(fileName, compressed.file, { contentType: "image/jpeg", upsert: true });

        if (!uploadError && uploadData) {
          const { data: pUrl } = supabase.storage.from("course-scans").getPublicUrl(uploadData.path);
          uploadedPublicUrl = pUrl.publicUrl;
        }
      } catch {
        // Fallback silencieux
      }

      setLoadingProgress(60);
      setLoadingMessage(`Détection des questions pièges pour ${userName || "ton cours"}...`);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: compressed.base64,
          mimeType: "image/jpeg",
          imageUrl: uploadedPublicUrl,
        }),
      });

      const json: ScanApiResponse = await res.json();
      const finalScanResult: ScanResult = json.data || DEFAULT_SCAN_RESULT;

      setLoadingProgress(100);
      setLoadingMessage("Génération terminée !");

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "loreno_scan_cache",
          JSON.stringify({
            scanData: finalScanResult,
            imageUrl: uploadedPublicUrl,
            userName,
            level,
            goal,
          })
        );
      }

      setTimeout(() => {
        setScanData(finalScanResult);
        setScannedImageUrl(uploadedPublicUrl);
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
            <div className="flex items-center justify-between h-8 mb-3">
              <button
                onClick={() => setScanData(null)}
                className="p-2 -ml-2 text-zinc-400 hover:text-black transition"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
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
        {/* Top Header : Back Button & Progress Bar */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between h-8 mb-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-zinc-400 hover:text-black transition"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
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
              fileInputRef={fileInputRef}
              onFileSelect={handleFileSelect}
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
