"use client";

import { AlertTriangle, Lock, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface ExamTrapBoxProps {
  initialQuestion?: string | null;
  subject?: string | null;
  deckTitle?: string;
  onUnlock: () => void;
}

export function ExamTrapBox({
  initialQuestion,
  subject,
  deckTitle,
  onUnlock,
}: ExamTrapBoxProps) {
  return (
    <div className="w-full mt-6 space-y-4 text-left">
      {/* Audit & Diagnostic d'Examen */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
            Audit d&apos;examen
          </span>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-zinc-200 text-zinc-700 border border-zinc-300">
            Niveau Recommandé
          </span>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          Pour ta note de <strong className="text-black">{subject || "cours"}</strong>, 3 notions clés indispensables ont été identifiées.
        </p>

        {/* La Question Piège du Professeur */}
        {initialQuestion && (
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-black">
              <span>Question d&apos;examen probable :</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-800 italic">
              &laquo; {initialQuestion} &raquo;
            </p>
            <Button
              onClick={onUnlock}
              size="sm"
              className="w-full mt-2 h-10 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
            >
              <Lock className="w-3 h-3" />
              Voir le corrigé type &amp; la grille de notation
            </Button>
          </div>
        )}
      </div>

      {/* Teaser des Cartes Floutées */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-black flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
            Fiches complètes détectées
          </span>
          <span className="text-[11px] text-zinc-500">Pack Premium</span>
        </div>

        {/* Cartes Floutées Teasing */}
        <div className="space-y-1.5">
          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between text-xs text-zinc-600 select-none">
            <span className="blur-[2px]">Notion clé n°1 des examinateurs</span>
            <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between text-xs text-zinc-600 select-none">
            <span className="blur-[2px]">Définition éliminatoire &amp; Cas pratique type</span>
            <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between text-xs text-zinc-600 select-none">
            <span className="blur-[2px]">Synthèse essentielle pour sécuriser la note</span>
            <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </div>
        </div>

        <Button
          onClick={onUnlock}
          variant="outline"
          className="w-full h-10 rounded-xl border-zinc-200 bg-white hover:bg-zinc-100 text-black font-semibold text-xs flex items-center justify-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5 text-zinc-500" />
          Débloquer toutes les cartes (9,99 €)
        </Button>
      </div>
    </div>
  );
}

