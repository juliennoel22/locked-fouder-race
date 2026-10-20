"use client";

import { X, Play, BookOpen, Zap } from "lucide-react";
import { getStepConfig } from "@/lib/review-config";
import { PathNode } from "./course-path-map";

interface PathNodeModalProps {
  isOpen: boolean;
  node: PathNode | null;
  onClose: () => void;
  onStartSession: (node: PathNode) => void;
  onCompleteNode?: (node: PathNode) => void;
}

export function PathNodeModal({
  isOpen,
  node,
  onClose,
  onStartSession,
  onCompleteNode,
}: PathNodeModalProps) {
  if (!isOpen || !node) return null;

  const IconComponent = node.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-5 shadow-2xl space-y-3.5 text-left animate-in zoom-in-95 duration-200 select-none">
        {/* Bouton fermer */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modale de Nœud */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center shrink-0 shadow-md">
            <IconComponent className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Étape {node.stepNumber} sur 6
            </span>
            <h3 className="text-lg font-black text-black tracking-tight mt-0.5">
              {node.title}
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              {node.subtitle}
            </p>
          </div>
        </div>

        {/* Description de la micro-session */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1 text-xs text-zinc-700">
          <div className="flex items-center gap-1.5 font-bold text-black">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Objectif de la session :</span>
          </div>
          <p className="text-zinc-600 leading-relaxed">
            {getStepConfig(node.stepNumber).objectiveText}
          </p>
        </div>

        {/* Bouton de démarrage */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onStartSession(node);
          }}
          className="w-full h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-600 border-t border-white/25 border-b-4 border-b-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 active:border-b-0 active:translate-y-1 transition-all duration-100 shadow-[0_8px_20px_rgba(16,185,129,0.35)] cursor-pointer select-none"
        >
          <Play className="w-4 h-4 fill-white text-white stroke-[2.5]" />
          <span className="tracking-wide">Commencer la session</span>
        </button>

        {/* Bouton Mode Test (Fast Complete) */}
        {onCompleteNode && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onCompleteNode(node);
            }}
            className="w-full h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 border-t border-white/20 border-b-4 border-b-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer shadow-[0_4px_14px_rgba(245,158,11,0.3)] select-none"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span className="tracking-wide">⚡ Mode Test : Valider instantanément cette étape</span>
          </button>
        )}
      </div>
    </div>
  );
}
