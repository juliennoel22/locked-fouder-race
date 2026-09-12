"use client";

import { useRef, ChangeEvent } from "react";
import { Camera, Upload, Plus, X, FileText } from "lucide-react";
import Image from "next/image";

export interface ScannedPhotoItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface QuizScanStepProps {
  photos: ScannedPhotoItem[];
  onAddPhotos: (newFiles: File[]) => void;
  onRemovePhoto: (id: string) => void;
  onConfirmAndScan: () => void;
  onSkip?: () => void;
  errorMessage: string | null;
}

export function QuizScanStep({
  photos,
  onAddPhotos,
  onRemovePhoto,
  onConfirmAndScan,
  onSkip,
  errorMessage,
}: QuizScanStepProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onAddPhotos(filesArray);
    }
    // Réinitialiser pour pouvoir ré-importer le même fichier si besoin
    e.target.value = "";
  };

  return (
    <div className="space-y-5 text-center select-none">
      {/* Inputs cachés (un pour la caméra directe, un pour les photos ou documents PDF) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFiles}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {/* CAS 1 : Aucune photo encore sélectionnée */}
      {photos.length === 0 ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-black">Scanne ton cours</h2>
            <p className="text-sm text-zinc-600 max-w-xs mx-auto">
              Prends en photo une ou plusieurs pages de tes notes. L&apos;IA combine tout en un seul cours de révision.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full h-16 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition shadow-md text-sm"
            >
              <Camera className="w-5 h-5" />
              <span>Prendre une photo</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-medium text-xs flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Importer photos ou document PDF</span>
            </button>

            {onSkip && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSkip}
                  className="w-full h-14 rounded-xl border border-zinc-300 hover:border-black bg-zinc-50 hover:bg-zinc-100 text-black font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-xs"
                >
                  <span>⚡ Je n&apos;ai pas mon cours sous la main</span>
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-1.5">
                  Teste immédiatement avec un exemple de cours
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CAS 2 : Étape de confirmation avec les photos sélectionnées */
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-white font-bold">
                {photos.length} document{photos.length > 1 ? "s" : ""}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-black">
              Confirme tes documents
            </h2>
            <p className="text-xs text-zinc-500">
              Vérifie tes photos ou PDF avant de lancer l&apos;analyse IA.
            </p>
          </div>

          {/* Grille des miniatures avec bouton supprimer */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[42vh] overflow-y-auto p-1 no-scrollbar">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative group rounded-xl border border-zinc-200 bg-zinc-100 overflow-hidden aspect-[3/4] shadow-sm flex flex-col justify-between"
              >
                {/* Image ou Carte Document PDF */}
                {photo.file.type === "application/pdf" ||
                photo.file.name.toLowerCase().endsWith(".pdf") ? (
                  <div className="w-full h-full p-3 flex flex-col justify-between items-center text-center bg-zinc-50">
                    <div className="w-full flex justify-start items-center">
                      <span className="px-1.5 py-0.5 rounded bg-black text-white text-[9px] font-bold">
                        PDF
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 my-auto px-1">
                      <FileText className="w-8 h-8 text-black stroke-[1.5]" />
                      <p className="text-[10px] font-semibold text-zinc-800 line-clamp-2 break-all leading-tight">
                        {photo.file.name}
                      </p>
                      <span className="text-[9px] text-zinc-400 font-mono">
                        {Math.round(photo.file.size / 1024)} Ko
                      </span>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={photo.previewUrl}
                    alt={`Page ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}

                {/* Badge numéro de page */}
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                  Page {index + 1}
                </div>

                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 text-zinc-700 hover:text-black hover:bg-white flex items-center justify-center shadow transition"
                  aria-label="Supprimer ce document"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Carte pour ajouter une autre page ou un PDF */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-zinc-300 hover:border-black bg-zinc-50 hover:bg-zinc-100 transition aspect-[3/4] flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-black p-3"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold">Ajouter photo ou PDF</span>
            </button>
          </div>

          {/* Actions de confirmation dans la zone du pouce */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onConfirmAndScan}
              className="w-full h-14 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md text-sm"
            >
              <span>Générer mon cours ({photos.length} page{photos.length > 1 ? "s" : ""}) →</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 h-11 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Prendre photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-11 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Galerie</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
