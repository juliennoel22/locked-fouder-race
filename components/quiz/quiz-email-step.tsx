"use client";

import { Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

interface QuizEmailStepProps {
  email: string;
  setEmail: (v: string) => void;
  isSubmittingEmail: boolean;
  onSubmitEmail: (e: React.FormEvent) => void;
  showGoogleLogin?: boolean;
  isGoogleLoading?: boolean;
  onGoogleLogin?: () => void;
  otpSent?: boolean;
  otpCode?: string;
  setOtpCode?: (v: string) => void;
  isVerifyingOtp?: boolean;
  onVerifyOtp?: (e: React.FormEvent) => void;
  onResetOtp?: () => void;
}

export function QuizEmailStep({
  email,
  setEmail,
  isSubmittingEmail,
  onSubmitEmail,
  showGoogleLogin = false,
  isGoogleLoading = false,
  onGoogleLogin,
  otpSent = false,
  otpCode = "",
  setOtpCode,
  isVerifyingOtp = false,
  onVerifyOtp,
  onResetOtp,
}: QuizEmailStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-black">
          {otpSent ? "Vérifie tes emails" : "Où t'envoyer tes fiches ?"}
        </h2>
        <p className="text-xs text-zinc-500">
          {otpSent
            ? `Entre le code à 6 chiffres envoyé à ${email}`
            : "Reçois tes synthèses et révise n'importe où"}
        </p>
      </div>

      <div className="pt-2 space-y-3">
        {!otpSent && showGoogleLogin && onGoogleLogin && (
          <>
            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-12 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold text-sm flex items-center justify-center gap-3 transition active:scale-[0.98] shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              ) : (
                <>
                  <Image
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                  />
                  <span>Continuer avec Google</span>
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-zinc-50 px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider absolute">
                ou par email
              </span>
            </div>
          </>
        )}

        {!otpSent ? (
          <form onSubmit={onSubmitEmail} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="julien@universite.fr"
              required
              autoFocus
              className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:border-black focus:ring-1 focus:ring-black outline-hidden transition"
            />
            <button
              type="submit"
              disabled={isSubmittingEmail}
              className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmittingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              ) : (
                <>
                  <span>Créer mon compte et réviser</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode && setOtpCode(e.target.value)}
              placeholder="123456"
              autoFocus
              className="w-full h-12 text-center tracking-widest text-lg font-mono font-bold rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-hidden transition"
            />
            <button
              type="submit"
              disabled={isVerifyingOtp}
              className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isVerifyingOtp ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              ) : (
                <span>Vérifier mon code</span>
              )}
            </button>
            {onResetOtp && (
              <button
                type="button"
                onClick={onResetOtp}
                className="w-full text-center text-xs text-zinc-500 hover:text-black py-1 transition cursor-pointer"
              >
                Changer d&apos;email
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
