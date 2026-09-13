"use client";

import { LEVEL_OPTIONS, GOAL_OPTIONS, PAIN_OPTIONS } from "@/lib/quiz-data";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

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
  email: string;
  setEmail: (v: string) => void;
  isSubmittingEmail: boolean;
  errorMessage: string | null;
  selectOptionAndAdvance: (setter: (v: string) => void, val: string) => void;
  onAdvanceToStep4: () => void;
  onSubmitEmail: (e: React.FormEvent) => void;
  showGoogleLogin?: boolean;
  onGoogleLogin?: () => void;
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
  email,
  setEmail,
  isSubmittingEmail,
  errorMessage,
  selectOptionAndAdvance,
  onAdvanceToStep4,
  onSubmitEmail,
  showGoogleLogin = false,
  onGoogleLogin,
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
            <p className="text-xs text-zinc-500">Pour personnaliser ton tuteur IA</p>
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
            className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl active:scale-[0.98] transition mt-6 disabled:opacity-30 cursor-pointer"
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

      {/* STEP 5 (Dernière étape 6/6) : Connexion Google ou Email */}
      {step === 5 && (
        <div className="space-y-5 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto text-xl shadow-xs">
              ⚡
            </div>
            <h2 className="text-xl font-bold text-black">
              {userName ? `Ravi de te rencontrer ${userName} !` : "Bienvenue sur Loreno !"}
            </h2>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              Connecte-toi pour sauvegarder tes fiches de révision et accéder à ton espace.
            </p>
          </div>

          <div className="space-y-3 pt-1 text-left">
            {/* Bouton Google Login (activé uniquement sur navigateur classique) */}
            {showGoogleLogin && onGoogleLogin && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={isSubmittingEmail}
                  className="w-full h-14 bg-white hover:bg-zinc-50 text-black border border-zinc-300 font-semibold text-sm rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-3 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuer avec Google</span>
                </button>

                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200" />
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    ou par email
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={onSubmitEmail} className="space-y-3">
              <div>
                <label htmlFor="quiz-email" className="block text-xs font-semibold text-zinc-700 mb-1.5 pl-0.5">
                  Adresse email
                </label>
                <input
                  id="quiz-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton.email@etudiant.fr"
                  autoFocus={!showGoogleLogin}
                  required
                  disabled={isSubmittingEmail}
                  className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-base font-medium text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-red-600 font-medium px-1">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmittingEmail || !email.trim()}
                className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 mt-4 disabled:opacity-30 shadow-sm cursor-pointer"
              >
                {isSubmittingEmail ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connexion à ton espace...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Accéder à mon espace ⚡</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connexion instantanée sécurisée • Zéro mot de passe</span>
          </div>
        </div>
      )}
    </div>
  );
}

