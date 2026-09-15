"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { X, Eye, Plus, FileText, Image as ImageIcon, Camera, Upload } from "lucide-react";
import { NotebookItem } from "@/types/loreno";

interface CourseDoc {
  id: string;
  url: string;
  name?: string;
  isPdf?: boolean;
}

interface MirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  deckTitle?: string;
  currentNotebook?: NotebookItem;
}

export function MirrorModal({
  isOpen,
  onClose,
  imageUrl,
  imageUrls,
  deckTitle,
  currentNotebook,
}: MirrorModalProps) {
  const [documents, setDocuments] = useState<CourseDoc[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const title = currentNotebook?.title || deckTitle || "Cours original";

  // Initialisation de l'ensemble des documents du cours
  useEffect(() => {
    if (!isOpen) return;

    const urlsList: string[] = [];
    if (currentNotebook?.imageUrls && currentNotebook.imageUrls.length > 0) {
      urlsList.push(...currentNotebook.imageUrls);
    } else if (imageUrls && imageUrls.length > 0) {
      urlsList.push(...imageUrls);
    } else if (currentNotebook?.imageUrl) {
      urlsList.push(currentNotebook.imageUrl);
    } else if (imageUrl) {
      urlsList.push(imageUrl);
    }

    if (urlsList.length > 0) {
      const docsList: CourseDoc[] = urlsList.map((url, idx) => {
        const isPdf =
          url.startsWith("data:application/pdf") ||
          url.toLowerCase().includes(".pdf");
        return {
          id: `doc-${idx + 1}-${url.slice(-10)}`,
          url,
          name: `Page ${idx + 1}`,
          isPdf,
        };
      });
      setDocuments(docsList);
    } else {
      setDocuments([]);
    }
  }, [imageUrl, imageUrls, currentNotebook, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newDocs: CourseDoc[] = newFiles.map((file, idx) => ({
        id: `upload-${Date.now()}-${idx}`,
        url: URL.createObjectURL(file),
        name: file.name || `Page ${documents.length + idx + 1}`,
        isPdf:
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf"),
      }));

      setDocuments((prev) => [...prev, ...newDocs]);
    }
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[92dvh] sm:h-[85dvh] flex flex-col bg-white border border-zinc-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Inputs cachés pour l'import de documents */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 bg-zinc-50/90">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-black uppercase tracking-wider block">
                  Documents du cours
                </span>
                {documents.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-zinc-200 text-zinc-800 font-semibold">
                    {documents.length} page{documents.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-500 truncate max-w-[220px] block">
                {title}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visionneuse continue : Documents affichés les uns après les autres */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-100">
          {documents.length > 0 ? (
            documents.map((doc, idx) => (
              <div
                key={doc.id}
                className="relative bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Badge numéro de page */}
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                  {doc.isPdf ? (
                    <FileText className="w-3 h-3" />
                  ) : (
                    <ImageIcon className="w-3 h-3" />
                  )}
                  <span>Page {idx + 1}</span>
                </div>

                {/* Contenu Image ou PDF */}
                <div className="w-full flex items-center justify-center bg-zinc-50 min-h-[300px]">
                  {doc.isPdf ? (
                    <iframe
                      src={doc.url}
                      title={`Document PDF - ${title} (Page ${idx + 1})`}
                      className="w-full h-[500px] border-0 bg-white"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={doc.url}
                      alt={`Document ${title} - Page ${idx + 1}`}
                      className="w-full h-auto object-contain select-none max-h-[70vh]"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 space-y-4 max-w-xs mx-auto my-auto bg-white rounded-2xl border border-zinc-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-black">
                  Aucun document attaché
                </p>
                <p className="text-xs text-zinc-500">
                  Prends une photo ou importe un PDF de ton cours.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Fixe avec bouton d'ajout en bas dans la Thumb Zone */}
        <div className="p-3.5 border-t border-zinc-200 bg-white space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Prendre une photo</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-12 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>Importer PDF / Galerie</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full h-9 rounded-xl text-zinc-500 hover:text-black font-medium text-xs transition"
          >
            Fermer la visionneuse
          </button>
        </div>
      </div>
    </div>
  );
}
