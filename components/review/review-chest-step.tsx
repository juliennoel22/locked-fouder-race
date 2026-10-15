"use client";

import { useEffect, useState } from "react";
import { Gift, Sparkles, Flame, Trophy, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { ReviewQueueItem } from "./review-types";

interface ReviewChestStepProps {
  item: ReviewQueueItem;
  onValidate: () => void;
}

export function ReviewChestStep({ onValidate }: ReviewChestStepProps) {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  useEffect(() => {
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  }, []);

  const handleOpenChest = () => {
    setIsOpened(true);
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } catch {}
    setTimeout(() => {
      onValidate();
    }, 600);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-2 text-center animate-in fade-in duration-300 select-none">
      <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Coffre avec orbe animé */}
        <div className="relative inline-flex items-center justify-center pt-2">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 flex items-center justify-center text-white shadow-xl shadow-amber-500/25 animate-bounce">
            <Gift className="w-12 h-12 text-white fill-white/20" />
          </div>
          <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 fill-white text-white" />
          </span>
        </div>

        {/* Textes de Victoire Intermédiaire */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block">
            Palier Mi-Parcours Débloqué
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            Coffre Trésor de Rétention
          </h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Tu as assimilé les concepts clés et réussi le test 3D. Ta mémoire de travail est amorcée.
          </p>
        </div>

        {/* Récompenses visuelles (Dopamine Grid) */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
          <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-0.5">
            <Sparkles className="w-4 h-4 text-amber-600 mx-auto" />
            <div className="text-xs font-black text-amber-900">+50 XP</div>
            <div className="text-[9px] text-zinc-400 font-bold uppercase">Mémoire</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-0.5">
            <Flame className="w-4 h-4 text-emerald-600 mx-auto" />
            <div className="text-xs font-black text-emerald-900">Cap 50%</div>
            <div className="text-[9px] text-zinc-400 font-bold uppercase">Validé</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-0.5">
            <Trophy className="w-4 h-4 text-brand mx-auto" />
            <div className="text-xs font-black text-brand">Niveau 2</div>
            <div className="text-[9px] text-zinc-400 font-bold uppercase">Débloqué</div>
          </div>
        </div>
      </div>

      {/* Action Thumb Zone */}
      <div className="pt-4 pb-2">
        <button
          type="button"
          onClick={handleOpenChest}
          disabled={isOpened}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-xl cursor-pointer disabled:opacity-80"
        >
          <span>Ouvrir et continuer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
