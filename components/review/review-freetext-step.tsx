"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { ReviewQueueItem } from "./review-types";

export function checkFreeTextAnswer(userAnswer: string, correctAnswer: string): boolean {
  const cleanUser = userAnswer.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleanCorrect = correctAnswer.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (!cleanUser) return false;
  if (cleanUser === cleanCorrect) return true;
  if (cleanUser.length >= 3 && cleanCorrect.includes(cleanUser)) return true;
  if (cleanCorrect.length >= 3 && cleanUser.includes(cleanCorrect)) return true;

  const userWords = cleanUser.split(/\s+/).filter((w) => w.length >= 3);
  const correctWords = cleanCorrect.split(/\s+/).filter((w) => w.length >= 3);

  if (correctWords.length > 0 && userWords.length > 0) {
    const matchCount = userWords.filter((uw) =>
      correctWords.some((cw) => cw.includes(uw) || uw.includes(cw))
    ).length;
    if (matchCount >= Math.ceil(correctWords.length * 0.4)) return true;
  }

  return false;
}

interface ReviewFreeTextStepProps {
  item: ReviewQueueItem;
  onSubmitAnswer: (isCorrect: boolean, userAnswer: string) => void;
}

export function ReviewFreeTextStep({ item, onSubmitAnswer }: ReviewFreeTextStepProps) {
  const [userAnswer, setUserAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    const isCorrect = checkFreeTextAnswer(userAnswer, item.back);
    onSubmitAnswer(isCorrect, userAnswer);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 text-left my-auto">
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
          ✍️ Saisie Libre (Examen)
        </span>
        <p className="text-sm font-bold text-black pt-1">{item.front}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-600">
          Rédige ta réponse de mémoire :
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Tape ta réponse ou tes mots-clés ici..."
          rows={3}
          className="w-full p-3.5 rounded-2xl border border-zinc-300 bg-white text-black text-base placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={!userAnswer.trim()}
        className="w-full h-13 rounded-2xl bg-gradient-to-r from-indigo-600 via-brand to-violet-600 hover:brightness-105 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>Valider ma réponse</span>
      </button>
    </form>
  );
}
