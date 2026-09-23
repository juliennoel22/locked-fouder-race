"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  X,
  Eye,
  FileText,
  Image as ImageIcon,
  Camera,
  Upload,
  RotateCw,
  ExternalLink,
  Zap,
  Loader2,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { compressCourseImage } from "@/lib/image-compression";
import { showToast } from "@/lib/toast";
import confetti from "canvas-confetti";

interface CourseDoc {
  id: string;
  url: string;
  name?: string;
  isPdf?: boolean;
  isNew?: boolean;
  base64?: string;
  mimeType?: string;
}

interface MirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  deckTitle?: string;
  currentNotebook?: NotebookItem;
  onDeckUpdated?: () => void;
}

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

  // Initialisation des documents
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

  // Tourner la photo de 90 degres
  const rotateDoc = (docId: string) => {
    setRotations((prev) => ({
      ...prev,
      [docId]: ((prev[docId] || 0) + 90) % 360,
    }));
  };

  // Monter un document dans la liste
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

  // Descendre un document dans la liste
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

  // Supprimer un document
  const deleteDoc = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Traitement et ajout de nouveaux fichiers (images/PDFs)
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

  // Validation par l'utilisateur : Analyse IA & Fusion des nouvelles cartes dans le cours
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
      // Marquer comme validé localement
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

      // Marquer les documents comme enregistrés
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
      <div className="relative w-full max-w-lg h-[92dvh] sm:h-[85dvh] flex flex-col bg-white border border-zinc-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Inputs cachés */}
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
                  Cours original
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bannière d'action si de nouveaux documents ont été scannés */}
        {hasNewDocs && (
          <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Nouveau document ajouté ! Valider l&apos;analyse IA ?</span>
            </div>
            <button
              onClick={handleConfirmAndAnalyze}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valider IA</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Visionneuse continue */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-100">
          {documents.length > 0 ? (
            documents.map((doc, idx) => {
              const currentRotation = rotations[doc.id] || 0;

              return (
                <div
                  key={doc.id}
                  className="relative bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Badge & Contrôles de page */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                    <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1.5 shadow-xs pointer-events-auto">
                      {doc.isPdf ? (
                        <FileText className="w-3 h-3 text-red-400" />
                      ) : (
                        <ImageIcon className="w-3 h-3 text-amber-400" />
                      )}
                      <span>Page {idx + 1}</span>
                      {doc.isNew && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px]">
                          Nouveau
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 pointer-events-auto bg-black/80 backdrop-blur-xs p-1 rounded-xl shadow-xs">
                      {/* Monter */}
                      <button
                        onClick={() => moveDocUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                        title="Monter cette page"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Descendre */}
                      <button
                        onClick={() => moveDocDown(idx)}
                        disabled={idx === documents.length - 1}
                        className="p-1.5 rounded-lg text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                        title="Descendre cette page"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Bouton Rotation Photo */}
                      {!doc.isPdf && (
                        <button
                          onClick={() => rotateDoc(doc.id)}
                          className="p-1.5 rounded-lg text-white hover:bg-zinc-800 transition cursor-pointer"
                          title="Pivoter la photo à 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Lien externe pour les PDF */}
                      {doc.isPdf && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-white hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                          title="Ouvrir le PDF dans un nouvel onglet"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Supprimer le document */}
                      <button
                        onClick={() => deleteDoc(doc.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition cursor-pointer"
                        title="Supprimer ce document du cours"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rendu Document Image (avec rotation CSS) ou PDF */}
                  <div className="w-full flex items-center justify-center bg-zinc-50 min-h-[320px] p-2 overflow-hidden">
                    {doc.isPdf ? (
                      <div className="w-full space-y-2 pt-10">
                        <object
                          data={doc.url}
                          type="application/pdf"
                          className="w-full h-[520px] border-0 rounded-xl bg-white"
                        >
                          <div className="text-center p-6 space-y-3 bg-white rounded-xl border border-zinc-200">
                            <FileText className="w-8 h-8 text-red-500 mx-auto" />
                            <p className="text-xs text-zinc-600 font-medium">
                              Visualisation du PDF intégrée
                            </p>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-semibold"
                            >
                              <span>Ouvrir le PDF original</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </object>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={doc.url}
                        alt={`Document ${title} - Page ${idx + 1}`}
                        style={{
                          transform: `rotate(${currentRotation}deg)`,
                          transition: "transform 0.3s ease",
                        }}
                        className="w-full h-auto object-contain select-none max-h-[70vh] rounded-lg"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              );
            })
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

        {/* Footer Fixe */}
        <div className="p-3.5 border-t border-zinc-200 bg-white space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Ajouter une photo</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-12 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Ajouter un PDF</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full h-9 rounded-xl text-zinc-500 hover:text-black font-medium text-xs transition cursor-pointer"
          >
            Fermer la visionneuse
          </button>
        </div>
      </div>
    </div>
  );
}
