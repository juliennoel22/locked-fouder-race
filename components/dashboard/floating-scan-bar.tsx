"use client";

import { useRef, ChangeEvent, useState } from "react";
import { Camera, Plus, Loader2 } from "lucide-react";
import { compressCourseImage } from "@/lib/image-compression";
import { ScanApiResponse, ScanResult, NotebookItem } from "@/types/loreno";
import { useRouter } from "next/navigation";

interface FloatingScanBarProps {
  onNewNotebook: (item: NotebookItem) => void;
}

export function FloatingScanBar({ onNewNotebook }: FloatingScanBarProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const compressed = await compressCourseImage(file, 1600, 0.8);
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: compressed.base64,
          mimeType: "image/jpeg",
          imageUrl: compressed.previewUrl,
        }),
      });

      const json: ScanApiResponse = await res.json();
      if (json.data) {
        const newNotebook: NotebookItem = {
          id: "scan-" + Date.now(),
          title: json.data.title || "Nouveau cours scanné",
          subject: json.data.subject || "Cours scanné",
          emoji: "📝",
          date: "À l'instant",
          sourceCount: json.data.flashcards?.length || 5,
          deck: json.data,
          imageUrl: json.imageUrl || compressed.previewUrl,
        };
        onNewNotebook(newNotebook);
      } else {
        router.push("/quiz");
      }
    } catch {
      router.push("/quiz");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 flex items-center justify-center gap-2.5 z-40 pointer-events-auto">
        {uploading ? (
          <div className="h-12 px-6 rounded-full bg-white border border-zinc-200 text-black font-medium text-xs flex items-center gap-2 shadow-xl">
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>Analyse IA du cours...</span>
          </div>
        ) : (
          <>
            <button
              onClick={handleCameraClick}
              className="w-12 h-12 rounded-full bg-white border border-zinc-200 text-black flex items-center justify-center shadow-xl active:scale-95 hover:bg-zinc-100 transition"
              aria-label="Prendre une photo"
            >
              <Camera className="w-5 h-5 text-black" />
            </button>

            <button
              onClick={handleCameraClick}
              className="h-12 px-5 rounded-full bg-black border border-black text-white font-semibold text-xs flex items-center gap-2 shadow-xl active:scale-95 hover:bg-zinc-800 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau carnet</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}
