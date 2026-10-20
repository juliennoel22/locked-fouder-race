"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Image as ImageIcon } from "lucide-react";
import { compressCourseImage } from "@/lib/image-compression";
import { showToast } from "@/lib/toast";
import confetti from "canvas-confetti";
import { CourseDoc, MirrorModalProps } from "./mirror/types";
import { MirrorHeader } from "./mirror/mirror-header";
import { MirrorBanner } from "./mirror/mirror-banner";
import { MirrorDocCard } from "./mirror/mirror-doc-card";
import { MirrorFooter } from "./mirror/mirror-footer";

export function MirrorModal({
  isOpen,
  onClose,
  imageUrl,
  imageUrls,
  deckTitle,
  currentNotebook,
  onDeckUpdated,
}: MirrorModalProps) {
  const [documents, setDocuments] = useState<CourseDoc[]>([]);
  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const title = currentNotebook?.title || deckTitle || "Cours original";
  const deckId = currentNotebook?.id;

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
    setRotations({});
    setIsAnalyzing(false);
  }, [imageUrl, imageUrls, currentNotebook, isOpen]);

  if (!isOpen) return null;

  const rotateDoc = (docId: string) => {
    setRotations((prev) => ({
      ...prev,
      [docId]: ((prev[docId] || 0) + 90) % 360,
    }));
  };

  const moveDocUp = (index: number) => {
    if (index <= 0) return;
    setDocuments((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDocDown = (index: number) => {
    if (index >= documents.length - 1) return;
    setDocuments((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const deleteDoc = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: CourseDoc[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      try {
        if (isPdf) {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          newDocs.push({
            id: `new-${Date.now()}-${i}`,
            url: URL.createObjectURL(file),
            name: file.name,
            isPdf: true,
            isNew: true,
            base64,
            mimeType: "application/pdf",
          });
        } else {
          const compressed = await compressCourseImage(file, 1600, 0.8);
          newDocs.push({
            id: `new-${Date.now()}-${i}`,
            url: compressed.previewUrl,
            name: file.name || `Page ${documents.length + i + 1}`,
            isPdf: false,
            isNew: true,
            base64: compressed.base64,
            mimeType: compressed.mimeType || "image/jpeg",
          });
        }
      } catch (err) {
        console.error("Erreur lecture document :", err);
      }
    }

    if (newDocs.length > 0) {
      setDocuments((prev) => [...prev, ...newDocs]);
    }
    e.target.value = "";
  };

  const handleConfirmAndAnalyze = async () => {
    const newDocs = documents.filter((d) => d.isNew && d.base64);

    if (newDocs.length === 0) {
      showToast({
        title: "Aucun nouveau document",
        description: "Prends une photo ou importe un fichier d'abord.",
        type: "error",
      });
      return;
    }

    if (!deckId) {
      showToast({
        title: "Documents ajoutés à la vue",
        description: "Enregistre ce cours pour sauvegarder les fiches en BDD.",
        type: "success",
      });
      setDocuments((prev) => prev.map((d) => ({ ...d, isNew: false })));
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/decks/append", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId,
          images: newDocs.map((d) => ({
            base64: d.base64,
            mimeType: d.mimeType || (d.isPdf ? "application/pdf" : "image/jpeg"),
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de l'analyse IA");
      }

      setDocuments((prev) => prev.map((d) => ({ ...d, isNew: false })));

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      showToast({
        title: "Cours enrichi avec succès !",
        description: json.message || "La fiche de cours a été mise à jour avec les nouveaux supports.",
        type: "success",
      });

      if (onDeckUpdated) onDeckUpdated();
    } catch (err) {
      console.error("Erreur validation et analyse append :", err);
      showToast({
        title: "Erreur d'analyse IA",
        description: err instanceof Error ? err.message : "Erreur inattendue",
        type: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasNewDocs = documents.some((d) => d.isNew);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[92dvh] sm:h-[85dvh] flex flex-col bg-white border border-zinc-200 rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" multiple onChange={handleFileUpload} className="hidden" />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
        <div className="w-full pt-2.5 pb-1 flex justify-center sm:hidden bg-white">
          <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
        </div>
        <MirrorHeader
          title={title}
          docCount={documents.length}
          onClose={onClose}
        />

        {hasNewDocs && (
          <MirrorBanner
            isAnalyzing={isAnalyzing}
            onConfirmAndAnalyze={handleConfirmAndAnalyze}
          />
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-100">
          {documents.length > 0 ? (
            documents.map((doc, idx) => (
              <MirrorDocCard
                key={doc.id}
                doc={doc}
                index={idx}
                totalDocs={documents.length}
                rotation={rotations[doc.id] || 0}
                title={title}
                onRotate={rotateDoc}
                onMoveUp={moveDocUp}
                onMoveDown={moveDocDown}
                onDelete={deleteDoc}
              />
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

        <MirrorFooter
          onTakePhoto={() => cameraInputRef.current?.click()}
          onUploadPdf={() => fileInputRef.current?.click()}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
