"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { compressCourseImage } from "@/lib/image-compression";
import { ScanApiResponse, ScanResult } from "@/types/loreno";
import { createClient } from "@/lib/supabase/client";
import {
  LEVEL_OPTIONS,
  GOAL_OPTIONS,
  PAIN_OPTIONS,
  DEFAULT_SCAN_RESULT,
} from "@/lib/quiz-data";
import { QuizLoadingOverlay } from "@/components/quiz-loading-overlay";
import { QuizScanStep } from "@/components/quiz-scan-step";

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
        router.push("/auth");
      }, 350);
    } catch (err) {
      console.error("Erreur scan:", err);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "loreno_scan_cache",
          JSON.stringify({
            userName,
            level,
            goal,
          })
        );
      }
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  };

  // Écran de Chargement / Traitement (Astra AI style original)
  if (loading) {
    return <QuizLoadingOverlay message={loadingMessage} progress={loadingProgress} />;
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
        <div className="flex-1 flex flex-col justify-center py-6">
          {/* STEP 1: Niveau */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center text-black">Quel est ton niveau d&apos;études ?</h2>
              <div className="space-y-2.5 pt-2">
                {LEVEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => selectOptionAndAdvance(setLevel, opt.id)}
                    className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] ${
                      level === opt.id
                        ? "border-black bg-black text-white font-semibold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Objectif */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center text-black">Quel est ton objectif principal ?</h2>
              <div className="space-y-2.5 pt-2">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => selectOptionAndAdvance(setGoal, opt.id)}
                    className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] ${
                      goal === opt.id
                        ? "border-black bg-black text-white font-semibold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Prénom */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-black">Comment tu t&apos;appelles ?</h2>
                <p className="text-xs text-zinc-500">Pour personnaliser ton apprentissage</p>
              </div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ton prénom"
                autoFocus
                className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-center text-lg font-medium text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
              />
              <button
                disabled={!userName.trim()}
                onClick={() => setStep(4)}
                className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl active:scale-[0.98] transition mt-6 disabled:opacity-30"
              >
                Continuer
              </button>
            </div>
          )}

          {/* STEP 4: Blocage */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center text-black">Ce qui te ralentit le plus ?</h2>
              <div className="space-y-2.5 pt-2">
                {PAIN_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => selectOptionAndAdvance(setPainPoint, opt.id)}
                    className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] ${
                      painPoint === opt.id
                        ? "border-black bg-black text-white font-semibold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Scan Photo */}
          {step === 5 && (
            <QuizScanStep
              fileInputRef={fileInputRef}
              onFileSelect={handleFileSelect}
              errorMessage={errorMessage}
            />
          )}
        </div>

        {/* Footer Minimalist */}
        <div className="py-2 text-center text-[11px] text-zinc-400">
          Loreno
        </div>
      </div>
    </main>
  );
}
