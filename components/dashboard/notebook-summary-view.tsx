"use client";

import { FileText, ArrowRight } from "lucide-react";

interface NotebookSummaryViewProps {
  title: string;
  subject?: string | null;
  summary?: string | null;
  onTestFlashcards: () => void;
}

export function NotebookSummaryView({
  title,
  subject,
  summary,
  onTestFlashcards,
}: NotebookSummaryViewProps) {
  return (
    <div className="w-full space-y-5 text-left select-none animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-black" />
          <h2 className="text-base font-bold text-black">Fiche de révision</h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
          {subject || "Essentiel"}
        </span>
      </div>

      <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
          {summary || "Synthèse en cours de génération pour ce carnet."}
        </p>
      </div>

      <button
        onClick={onTestFlashcards}
        className="w-full h-13 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm py-3.5"
      >
        <span>S&apos;entraîner avec les flashcards</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
