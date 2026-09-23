"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Camera, Upload, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { compressCourseImage } from "@/lib/image-compression";
import { FlashcardPlayer } from "./flashcard-player";
import { ScanApiResponse, ScanResult } from "@/types/loreno";
import { createClient } from "@/lib/supabase/client";

export function CameraUpload() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [compressionStats, setCompressionStats] = useState<{
    original: number;
    compressed: number;
  } | null>(null);
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;

    setErrorMessage(null);
    setLoading(true);

    try {
      // 1. Compression Client Impérative (Canvas HTML5)
      setLoadingStep("Compression haute vitesse...");
      const compressed = await compressCourseImage(file, 1600, 0.8);
      setCompressionStats({
        original: compressed.originalSizeKb,
        compressed: compressed.sizeKb,
      });

      // 2. Upload direct dans Supabase Storage si configuré
      setLoadingStep("Sauvegarde de la note originale...");
      let uploadedPublicUrl = compressed.previewUrl;
      const isPdf =
        compressed.isPdf ||
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id || "anonymous";
        const fileExt = isPdf ? "pdf" : "jpg";
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("course-scans")
          .upload(fileName, compressed.file, {
            contentType: isPdf ? "application/pdf" : "image/jpeg",
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: signedData, error: signedErr } = await supabase.storage
            .from("course-scans")
            .createSignedUrl(uploadData.path, 3600);

          if (!signedErr && signedData?.signedUrl) {
            uploadedPublicUrl = signedData.signedUrl;
          } else {
            uploadedPublicUrl = uploadData.path;
          }
        }
      } catch (storageErr) {
        console.warn("Storage upload fallback :", storageErr);
      }

      setScannedImageUrl(uploadedPublicUrl);

      // 3. Appel API Scan (Gemini Flash Vision & Document)
      setLoadingStep("Extraction IA des concepts clés (< 2s)...");
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: compressed.base64,
          mimeType: compressed.mimeType || (isPdf ? "application/pdf" : "image/jpeg"),
          imageUrl: uploadedPublicUrl,
        }),
      });

      const json: ScanApiResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Erreur lors du scan du cours");
      }

      setScanData(json.data);
    } catch (err) {
      console.error("Scan error :", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Erreur inattendue lors de l'analyse"
      );
    } finally {
      setLoading(false);
      setLoadingStep("");
      isSubmittingRef.current = false;
    }
  };

  const handleReset = () => {
    setScanData(null);
    setScannedImageUrl(null);
    setCompressionStats(null);
    setErrorMessage(null);
  };

  if (scanData && scanData.flashcards?.length > 0) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Nouveau scan
          </button>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {scanData.subject || "Cours scanné"}
          </span>
        </div>

        <FlashcardPlayer
          cards={scanData.flashcards}
          deckTitle={scanData.title}
          subject={scanData.subject}
          imageUrl={scannedImageUrl}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden Mobile Native Camera Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Upload Zone */}
      <div
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`w-full relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${loading
            ? "border-amber-500/50 bg-amber-500/5 p-8"
            : "border-zinc-800 hover:border-amber-500/50 bg-zinc-900/50 hover:bg-zinc-900/80 p-8 sm:p-12"
          }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {loading ? (
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="relative">
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg">
                  {loadingStep}
                </h3>
                {compressionStats && (
                  <p className="text-xs text-emerald-400 font-medium mt-1">
                    Compressé : {compressionStats.original} Ko → {compressionStats.compressed} Ko
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Big Central Button in Thumb Zone */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/20 group-hover:scale-105 active:scale-95 transition-all duration-300 mb-6">
                <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-950 stroke-[2.2]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Prendre en photo mon cours
              </h2>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mt-2 leading-relaxed">
                Feuille manuscrite, schéma, polycopié ou tableau blanc.
              </p>

              <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-xs font-semibold">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Ou importer un fichier image</span>
              </div>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="w-full mt-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-900/50 flex items-center gap-2.5 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Trust & Speed Guarantees */}
      <div className="flex items-center justify-center gap-6 mt-6 text-[11px] text-zinc-500 font-medium">
        <span> Vision Gemini 1.5 Flash</span>
        <span>•</span>
        <span>📱 Compression Canvas &lt; 400 Ko</span>
        <span>•</span>
        <span>🔥 3D Swipe Tinder-like</span>
      </div>
    </div>
  );
}
