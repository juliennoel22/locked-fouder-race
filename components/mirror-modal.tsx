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
  deckTitle?: string;
  currentNotebook?: NotebookItem;
}

export function MirrorModal({
  isOpen,
  onClose,
  imageUrl,
  deckTitle,
  currentNotebook,
}: MirrorModalProps) {
  const [documents, setDocuments] = useState<CourseDoc[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const title = currentNotebook?.title || deckTitle || "Cours original";
  const primaryUrl = currentNotebook?.imageUrl || imageUrl;

  // Initialisation des documents du cours
  useEffect(() => {
    if (!isOpen) return;

    if (primaryUrl) {
      const isPdf =
        primaryUrl.startsWith("data:application/pdf") ||
        primaryUrl.toLowerCase().includes(".pdf");
      setDocuments([
        {
          id: "doc-1",
          url: primaryUrl,
          name: "Page 1",
          isPdf,
        },
      ]);
      setActiveIndex(0);
    } else {
      setDocuments([]);
      setActiveIndex(0);
    }
  }, [primaryUrl, isOpen]);

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
      setActiveIndex(documents.length); // Basculer sur le premier nouveau document importé
    }
    e.target.value = "";
  };

  const activeDoc = documents[activeIndex] || null;

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
                    {activeIndex + 1} / {documents.length}
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

        {/* Barre de sélection des pages / photos du cours & Bouton Importer */}
        <div className="px-4 py-2 border-b border-zinc-100 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
          {documents.map((doc, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveIndex(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition shrink-0 ${
                  isSelected
                    ? "bg-black text-white shadow-xs"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                }`}
              >
                {doc.isPdf ? (
                  <FileText className="w-3.5 h-3.5" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5" />
                )}
                <span>Page {idx + 1}</span>
              </button>
            );
          })}

          {/* Bouton Importer des nouvelles photos ou un PDF */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-full border border-dashed border-zinc-300 hover:border-black bg-zinc-50 hover:bg-zinc-100 text-black text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition shrink-0 active:scale-95"
            title="Importer des photos ou un document PDF supplémentaire"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Importer photos / PDF</span>
          </button>
        </div>

        {/* Visionneuse Photo ou PDF du document actif */}
        <div className="flex-1 overflow-auto p-3 flex items-center justify-center bg-zinc-100">
          {activeDoc ? (
            activeDoc.isPdf ? (
              <iframe
                src={activeDoc.url}
                title={`Document PDF - ${title}`}
                className="w-full h-full rounded-2xl border border-zinc-200 shadow-md bg-white"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeDoc.url}
                alt={`Photo - ${title} (Page ${activeIndex + 1})`}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-md select-none bg-white"
              />
            )
          ) : (
            <div className="text-center p-8 space-y-4 max-w-xs mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mx-auto shadow-xs">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-black">
                  Aucun document attaché
                </p>
                <p className="text-xs text-zinc-500">
                  Prends une photo ou importe un PDF de tes notes.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3.5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-black text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importer PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 bg-white">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs transition active:scale-[0.99]"
          >
            Retourner au cours
          </button>
        </div>
      </div>
    </div>
  );
}
