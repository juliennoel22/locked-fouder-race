"use client";

import { useState, useRef, ChangeEvent } from "react";
import { ArrowLeft, Camera, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { compressCourseImage } from "@/lib/image-compression";
import { FlashcardPlayer } from "@/components/flashcard-player";
import { ScanApiResponse, ScanResult } from "@/types/loreno";
import { createClient } from "@/lib/supabase/client";

export function QuizFunnel() {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6; // Welcome, Level, Goal, Name, Pain, Upload

  // Quiz State
  const [level, setLevel] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [painPoint, setPainPoint] = useState<string>("");

  // Scan & Processing State
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  // Auto-advance helper with small delay for touch feedback
  const selectOptionAndAdvance = (setter: (val: string) => void, value: string) => {
    setter(value);
    setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 150);
  };

  // Upload & Scan handler
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setLoading(true);
    setLoadingProgress(15);
    setLoadingMessage("Compression de ta note...");

    try {
      // 1. Compression Client (Canvas HTML5)
      const compressed = await compressCourseImage(file, 1600, 0.8);
      setLoadingProgress(35);
      setLoadingMessage("Lecture de l'écriture manuscrite...");

      // 2. Upload Storage (Optionnel)
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
        // Fallback silencieux si non configuré
      }

      setScannedImageUrl(uploadedPublicUrl);
      setLoadingProgress(60);
      setLoadingMessage(`Détection des questions pièges pour ${userName || "ton partiel"}...`);

      // 3. Appel API Gemini
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
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Erreur lors de l'analyse");
      }

      setLoadingProgress(100);
      setLoadingMessage("Génération des flashcards terminée !");
      setTimeout(() => {
        setScanData(json.data!);
        setLoading(false);
      }, 400);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  };

  // Si le scan est terminé, on affiche directement le player
  if (scanData) {
    return (
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-black text-white">
        <FlashcardPlayer
          cards={scanData.flashcards}
          deckTitle={scanData.title}
          subject={scanData.subject}
          imageUrl={scannedImageUrl}
          onReset={() => {
            setScanData(null);
            setStep(1);
          }}
        />
      </div>
    );
  }

  // Écran de Chargement / Traitement (Astra AI style)
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-center items-center p-6 bg-black text-white text-center">
        <div className="w-full space-y-6">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-white" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{loadingMessage}</h2>
            <p className="text-xs text-zinc-400">Patiente 2 à 3 secondes...</p>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-white h-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-xs font-mono text-zinc-500">{loadingProgress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-black text-white selection:bg-white selection:text-black">
      {/* Top Header : Back Button & Progress Bar */}
      <div className="w-full pt-2">
        <div className="flex items-center justify-between h-8 mb-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-zinc-400 hover:text-white transition"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-5" />
          )}
          <span className="text-xs font-mono text-zinc-500">
            {step} / {totalSteps}
          </span>
        </div>

        {/* Fine Progress Bar */}
        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="bg-white h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Content Area */}
      <div className="flex-1 flex flex-col justify-center py-6">
        {/* STEP 1 : WELCOME */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center mx-auto text-xl">
              ⚡
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Révise 2x plus vite avec ton tuteur IA
              </h1>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                Prends en photo n&apos;importe quel cours. Obtiens tes fiches mémo interactives et ton entraînement d&apos;examen en 3 secondes.
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full h-14 bg-white text-black font-semibold rounded-xl active:scale-[0.98] transition mt-8"
            >
              Commencer
            </button>
          </div>
        )}

        {/* STEP 2 : NIVEAU D'ÉTUDES (Auto-advance) */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">Quel est ton niveau d&apos;études ?</h2>
            <div className="space-y-2.5 pt-2">
              {[
                { id: "college", label: "Collège" },
                { id: "lycee", label: "Lycée (Seconde, Première, Terminale)" },
                { id: "universite", label: "Université / Fac / BUT / BTS" },
                { id: "prepa", label: "Prépa / Grandes Écoles" },
                { id: "autre", label: "Autre formation" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectOptionAndAdvance(setLevel, opt.id)}
                  className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] ${
                    level === opt.id
                      ? "border-white bg-zinc-900 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 : OBJECTIF / URGENCE (Auto-advance) */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">Quel est ton objectif principal ?</h2>
            <div className="space-y-2.5 pt-2">
              {[
                { id: "urgent", label: "🧨 J'ai un examen / partiel imminent (urgence)" },
                { id: "grades", label: "📈 Augmenter mes notes sans y passer mes nuits" },
                { id: "retention", label: "🧠 Retenir mes cours sans tout oublier" },
                { id: "procrastination", label: "⏱️ Vaincre la flemme et la procrastination" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectOptionAndAdvance(setGoal, opt.id)}
                  className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] ${
                    goal === opt.id
                      ? "border-white bg-zinc-900 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 : PRÉNOM */}
        {step === 4 && (
          <div className="space-y-5 text-center">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Comment tu t&apos;appelles ?</h2>
              <p className="text-xs text-zinc-400">Pour adapter tes questions d&apos;entraînement.</p>
            </div>
            <input
              type="text"
              autoFocus
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ton prénom"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-base text-white text-center focus:outline-none focus:border-white transition"
              onKeyDown={(e) => {
                if (e.key === "Enter" && userName.trim()) handleNext();
              }}
            />
            <button
              disabled={!userName.trim()}
              onClick={handleNext}
              className="w-full h-12 bg-white text-black font-semibold rounded-xl disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition"
            >
              Continuer
            </button>
          </div>
        )}

        {/* STEP 5 : PAIN POINTS (Auto-advance) */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-bold">
                {userName ? `${userName}, quel` : "Quel"} est ton plus gros blocage ?
              </h2>
              <p className="text-xs text-zinc-400">Ce qui te fait perdre le plus de points.</p>
            </div>
            <div className="space-y-2.5 pt-2">
              {[
                { id: "messy", label: "📝 Mes notes sont bordéliques ou illisibles" },
                { id: "too_much", label: "🥱 Flemme de relire 50 pages de polycopié" },
                { id: "exam_traps", label: "❓ Je ne sais jamais quelles questions vont tomber" },
                { id: "focus", label: "📱 Je perds ma concentration au bout de 10 min" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectOptionAndAdvance(setPainPoint, opt.id)}
                  className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] ${
                    painPoint === opt.id
                      ? "border-white bg-zinc-900 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6 : UPLOAD CAMERA PHOTO */}
        {step === 6 && (
          <div className="space-y-6 text-center">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">
                {userName ? `${userName}, prends` : "Prends"} en photo ton cours
              </h2>
              <p className="text-xs text-zinc-400">
                Notes manuscrites, schéma, polycopié ou tableau d&apos;amphi.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Big Black & White Photo Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-zinc-800 hover:border-zinc-600 active:bg-zinc-900/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Prendre une photo / Importer</p>
                <p className="text-[11px] text-zinc-500">JPG, PNG ou capture d&apos;écran</p>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 border border-red-900/50 bg-red-950/20 p-3 rounded-xl">
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Minimalist */}
      <div className="py-2 text-center text-[11px] text-zinc-600">
        Loreno ⚡ • Quiz Funnel Mobile
      </div>
    </div>
  );
}
