"use client";

import { useState, useEffect } from "react";
import { X, Eye, Plus, FileText, Image as ImageIcon } from "lucide-react";
import { NotebookItem } from "@/types/loreno";

interface MirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNotebook?: NotebookItem;
  allNotebooks?: NotebookItem[];
  onSelectNotebook?: (nb: NotebookItem) => void;
  onAddNewCourse?: () => void;
  imageUrl?: string | null;
  deckTitle?: string;
}

export function MirrorModal({
  isOpen,
  onClose,
  currentNotebook,
  allNotebooks = [],
  onSelectNotebook,
  onAddNewCourse,
  imageUrl,
  deckTitle,
}: MirrorModalProps) {
  const fallbackNb: NotebookItem = currentNotebook || {
    id: "active",
    title: deckTitle || "Note originale",
    subject: "Général",
    emoji: "📝",
    date: "Aujourd'hui",
    sourceCount: 5,
    deck: { title: deckTitle || "Note originale", subject: "Général", summary: "", initial_quiz_question: "", flashcards: [] },
    imageUrl: imageUrl || null,
  };

  const [selectedNb, setSelectedNb] = useState<NotebookItem>(fallbackNb);

  useEffect(() => {
    if (currentNotebook) {
      setSelectedNb(currentNotebook);
    } else {
      setSelectedNb({
        id: "active",
        title: deckTitle || "Note originale",
        subject: "Général",
        emoji: "📝",
        date: "Aujourd'hui",
        sourceCount: 5,
        deck: { title: deckTitle || "Note originale", subject: "Général", summary: "", initial_quiz_question: "", flashcards: [] },
        imageUrl: imageUrl || null,
      });
    }
  }, [currentNotebook, imageUrl, deckTitle, isOpen]);

  if (!isOpen) return null;

  const coursesList = allNotebooks.length > 0 ? allNotebooks : [selectedNb];
  const activeImageUrl = selectedNb.imageUrl || imageUrl;

  const handleSwitchCourse = (nb: NotebookItem) => {
    setSelectedNb(nb);
    if (onSelectNotebook) {
      onSelectNotebook(nb);
    }
  };

  const handleAddCourseClick = () => {
    onClose();
    if (onAddNewCourse) {
      onAddNewCourse();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[92dvh] sm:h-[85dvh] flex flex-col bg-white border border-zinc-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 bg-zinc-50/90">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-black uppercase tracking-wider block">
                Cours originaux
              </span>
              <span className="text-[11px] text-zinc-500 truncate max-w-[220px] block">
                {selectedNb.title}
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

        {/* Sélecteur horizontal des cours + Bouton Ajouter un cours */}
        <div className="px-4 py-2.5 border-b border-zinc-100 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
          {coursesList.map((nb) => {
            const isSelected = nb.id === selectedNb.id;
            return (
              <button
                key={nb.id}
                onClick={() => handleSwitchCourse(nb)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition shrink-0 ${
                  isSelected
                    ? "bg-black text-white shadow-xs"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                }`}
              >
                <span>{nb.emoji}</span>
                <span className="truncate max-w-[120px]">{nb.title}</span>
              </button>
            );
          })}

          {/* Bouton Ajouter un nouveau cours */}
          <button
            onClick={handleAddCourseClick}
            className="px-3 py-1.5 rounded-full border border-dashed border-zinc-300 hover:border-black bg-zinc-50 hover:bg-zinc-100 text-black text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un cours</span>
          </button>
        </div>

        {/* Visionneuse Image ou PDF du cours sélectionné */}
        <div className="flex-1 overflow-auto p-3 flex items-center justify-center bg-zinc-100">
          {activeImageUrl ? (
            activeImageUrl.startsWith("data:application/pdf") ||
            activeImageUrl.toLowerCase().includes(".pdf") ? (
              <iframe
                src={activeImageUrl}
                title={`Document PDF - ${selectedNb.title}`}
                className="w-full h-full rounded-2xl border border-zinc-200 shadow-md bg-white"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeImageUrl}
                alt={`Note originale - ${selectedNb.title}`}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-md select-none bg-white"
              />
            )
          ) : (
            <div className="text-center p-8 space-y-3 max-w-xs mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mx-auto shadow-xs">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-black">
                Aucun document attaché à ce cours
              </p>
              <button
                onClick={handleAddCourseClick}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition"
              >
                Scanner un document
              </button>
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
