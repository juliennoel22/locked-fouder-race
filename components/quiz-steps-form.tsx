"use client";

import { LEVEL_OPTIONS, GOAL_OPTIONS, PAIN_OPTIONS } from "@/lib/quiz-data";

interface QuizStepsFormProps {
  step: number;
  level: string;
  setLevel: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  userName: string;
  setUserName: (v: string) => void;
  painPoint: string;
  setPainPoint: (v: string) => void;
  selectOptionAndAdvance: (setter: (v: string) => void, val: string) => void;
  onAdvanceToStep4: () => void;
}

export function QuizStepsForm({
  step,
  level,
  setLevel,
  goal,
  setGoal,
  userName,
  setUserName,
  painPoint,
  setPainPoint,
  selectOptionAndAdvance,
  onAdvanceToStep4,
}: QuizStepsFormProps) {
  return (
    <div className="flex-1 flex flex-col justify-center py-6">
      {/* STEP 1: Niveau */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center text-black">Quel est ton niveau d&apos;études ?</h2>
          <div className="space-y-2.5 pt-2">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => selectOptionAndAdvance(setLevel, opt.id)}
                className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] ${
                  level === opt.id
                    ? "border-black bg-black text-white font-semibold"
                    : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Objectif */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center text-black">Quel est ton objectif principal ?</h2>
          <div className="space-y-2.5 pt-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => selectOptionAndAdvance(setGoal, opt.id)}
                className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] ${
                  goal === opt.id
                    ? "border-black bg-black text-white font-semibold"
                    : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Prénom */}
      {step === 3 && (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-black">Comment tu t&apos;appelles ?</h2>
            <p className="text-xs text-zinc-500">Pour personnaliser ton apprentissage</p>
          </div>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Ton prénom"
            autoFocus
            className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-center text-lg font-medium text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
          />
          <button
            disabled={!userName.trim()}
            onClick={onAdvanceToStep4}
            className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl active:scale-[0.98] transition mt-6 disabled:opacity-30"
          >
            Continuer
          </button>
        </div>
      )}

      {/* STEP 4: Blocage */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center text-black">Ce qui te ralentit le plus ?</h2>
          <div className="space-y-2.5 pt-2">
            {PAIN_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => selectOptionAndAdvance(setPainPoint, opt.id)}
                className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] ${
                  painPoint === opt.id
                    ? "border-black bg-black text-white font-semibold"
                    : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
