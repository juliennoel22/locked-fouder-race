"use client";

import { Loader2, ShieldCheck, Mail, KeyRound, CheckCircle2 } from "lucide-react";

interface QuizStepEmailOtpProps {
  userName: string;
  email: string;
  setEmail: (v: string) => void;
  otpCode: string;
  setOtpCode: (v: string) => void;
  otpSent: boolean;
  onEditEmail: () => void;
  isSubmittingEmail: boolean;
  errorMessage: string | null;
  successMessage?: string | null;
  onSendOtp: (e: React.FormEvent) => void;
  onVerifyOtp: (e: React.FormEvent) => void;
  showGoogleLogin?: boolean;
  onGoogleLogin?: () => void;
}

export function QuizStepEmailOtp({
  userName,
  email,
  setEmail,
  otpCode,
  setOtpCode,
  otpSent,
  onEditEmail,
  isSubmittingEmail,
  errorMessage,
  successMessage,
  onSendOtp,
  onVerifyOtp,
  showGoogleLogin = false,
  onGoogleLogin,
}: QuizStepEmailOtpProps) {
  return (
    <div className="space-y-5 text-center">
      {!otpSent ? (
        <>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-black">
              {userName ? `Ravi de te rencontrer ${userName} !` : "Bienvenue sur Loreno !"}
            </h2>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              Reçois un code de connexion à 6 chiffres par email pour sécuriser ton espace.
            </p>
          </div>

          <div className="space-y-3 pt-1 text-left">
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

            <form onSubmit={onSendOtp} className="space-y-3">
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
                    <span>Envoi du code...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>M&apos;envoyer le code à 6 chiffres</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-2">
              <KeyRound className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-xl font-bold text-black">Entre ton code à 6 chiffres</h2>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              Code envoyé à <strong className="text-black">{email}</strong>
            </p>
          </div>

          {successMessage && (
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={onVerifyOtp} className="space-y-3 pt-1 text-left">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              required
              autoFocus
              className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-center text-2xl font-mono tracking-widest font-bold text-black placeholder:text-zinc-300 focus:outline-none focus:border-black transition"
              style={{ fontSize: "24px" }}
            />

            {errorMessage && (
              <p className="text-xs text-red-600 font-medium px-1 text-center">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmittingEmail || otpCode.length < 6}
              className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 mt-4 disabled:opacity-30 shadow-sm cursor-pointer"
            >
              {isSubmittingEmail ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Validation du code...</span>
                </>
              ) : (
                <span>Valider et accéder à mes cours</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={onEditEmail}
                className="text-zinc-500 hover:text-black underline cursor-pointer"
              >
                Modifier l&apos;email
              </button>
              <button
                type="button"
                onClick={onSendOtp}
                disabled={isSubmittingEmail}
                className="text-zinc-500 hover:text-black underline cursor-pointer"
              >
                Renvoyer le code
              </button>
            </div>
          </form>
        </>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Sécurisé Supabase • Zéro mot de passe à retenir</span>
      </div>
    </div>
  );
}
