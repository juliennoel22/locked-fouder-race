"use client";

import { useRef, ChangeEvent } from "react";
import { Camera, Upload, Plus, X } from "lucide-react";
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
      {/* Inputs cachés (un pour la caméra directe, un pour la galerie multiple) */}
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
        accept="image/*"
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
              Prends en photo une ou plusieurs pages de tes notes. L&apos;IA combine tout en un seul carnet de révision.
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
              <span>Importer des photos (sélection multiple possible)</span>
            </button>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="w-full text-center text-xs text-zinc-400 hover:text-black pt-3 underline transition block"
              >
                Je n&apos;ai pas mon cours sous la main (Passer)
              </button>
            )}
          </div>
        </div>
      ) : (
        /* CAS 2 : Étape de confirmation avec les photos sélectionnées */
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-white font-bold">
                {photos.length} page{photos.length > 1 ? "s" : ""}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-black">
              Confirme tes pages
            </h2>
            <p className="text-xs text-zinc-500">
              Vérifie tes photos ou ajoute d&apos;autres pages avant de lancer l&apos;IA.
            </p>
          </div>

          {/* Grille des miniatures avec bouton supprimer */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[42vh] overflow-y-auto p-1 no-scrollbar">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative group rounded-xl border border-zinc-200 bg-zinc-100 overflow-hidden aspect-[3/4] shadow-sm flex flex-col justify-between"
              >
                {/* Image */}
                <Image
                  src={photo.previewUrl}
                  alt={`Page ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Badge numéro de page */}
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                  Page {index + 1}
                </div>

                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 text-zinc-700 hover:text-black hover:bg-white flex items-center justify-center shadow transition"
                  aria-label="Supprimer cette page"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Carte pour ajouter une autre page */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-zinc-300 hover:border-black bg-zinc-50 hover:bg-zinc-100 transition aspect-[3/4] flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-black p-3"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold">Ajouter une page</span>
            </button>
          </div>

          {/* Actions de confirmation dans la zone du pouce */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onConfirmAndScan}
              className="w-full h-14 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md text-sm"
            >
              <span>Générer mon carnet ({photos.length} page{photos.length > 1 ? "s" : ""}) →</span>
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
