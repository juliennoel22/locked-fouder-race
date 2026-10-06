"use client";

import { ArrowRight } from "lucide-react";

interface QuizNameStepProps {
  userName: string;
  setUserName: (v: string) => void;
  onAdvance: () => void;
}

export function QuizNameStep({
  userName,
  setUserName,
  onAdvance,
}: QuizNameStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-black">
        Comment tu t&apos;appelles ?
      </h2>
      <p className="text-xs text-center text-zinc-500">
        Pour personnaliser tes synthèses et ton programme de révision
      </p>
      <div className="space-y-3 pt-2">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Ton prénom (ex: Julien)"
          autoFocus
          className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:border-black focus:ring-1 focus:ring-black outline-hidden transition"
        />
        <button
          type="button"
          onClick={onAdvance}
          className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <span>Continuer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
