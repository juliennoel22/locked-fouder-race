"use client";

import { useState } from "react";
import { Mail, Loader2, ArrowRight, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface OtpAuthFormProps {
  onSuccess: () => void;
  defaultEmail?: string;
}

export function OtpAuthForm({ onSuccess, defaultEmail = "" }: OtpAuthFormProps) {
  const supabase = createClient();
  const [email, setEmail] = useState<string>(defaultEmail);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Veuillez entrer une adresse email valide.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        if (otpError.message.includes("security purposes") || otpError.status === 429) {
          setErrorMessage(
            "Un email vient déjà d'être envoyé. Merci de vérifier ta boîte mail ou de patienter 30 secondes."
          );
          setOtpSent(true);
          return;
        }
        throw otpError;
      }

      localStorage.setItem("loreno_user_email", cleanEmail);
      setOtpSent(true);
    } catch (err: unknown) {
      console.error("Erreur connexion email :", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("security")) {
        setErrorMessage("Un email vient déjà d'être envoyé. Merci de vérifier ta boîte mail.");
        setOtpSent(true);
      } else {
        setErrorMessage(msg || "Impossible d'envoyer le code de connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = otpCode.trim();

    if (!cleanCode || cleanCode.length < 6) {
      setErrorMessage("Veuillez entrer le code à 6 chiffres reçu par email.");
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: "email",
      });

      if (verifyError) throw verifyError;
      onSuccess();
    } catch (err: unknown) {
      console.error("Erreur vérification OTP :", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Code de vérification invalide ou expiré."
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
          <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!otpSent ? (
        <form onSubmit={handleSendEmail} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Ton adresse email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="julien@universite.fr"
                required
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:border-black focus:ring-1 focus:ring-black outline-hidden transition"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            ) : (
              <>
                <span>Recevoir mon code magique</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-3">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            Code envoyé à <strong className="font-bold">{email}</strong>. Vérifie tes spams si besoin.
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Code à 6 chiffres
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              autoFocus
              className="w-full h-12 text-center tracking-widest text-lg font-mono font-bold rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-hidden transition"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifyingOtp}
            className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isVerifyingOtp ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            ) : (
              <span>Vérifier et accéder à mes cours</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOtpSent(false)}
            className="w-full text-center text-xs text-zinc-500 hover:text-black py-1 transition cursor-pointer"
          >
            Changer d&apos;email
          </button>
        </form>
      )}
    </div>
  );
}
