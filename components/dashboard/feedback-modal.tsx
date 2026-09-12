"use client";

import { X, MessageSquare } from "lucide-react";
import { FeedbackForm } from "./feedback-form";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 max-h-[90dvh] overflow-y-auto">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête de la modale */}
        <div className="text-left mb-4 space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-black" />
            <span>Ton avis compte</span>
          </div>
          <h2 className="text-xl font-bold text-black tracking-tight">
            Donne ton avis à Julien & Baptiste
          </h2>
          <p className="text-xs text-zinc-500">
            Une idée, un ressenti ou un bug ? Dis-nous tout pour continuer d&apos;améliorer Loreno.
          </p>
        </div>

        {/* Formulaire interactif */}
        <FeedbackForm onClose={onClose} hideHeader={true} />
      </div>
    </div>
  );
}
