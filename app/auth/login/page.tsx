"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail, KeyRound, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");
  const [otpToken, setOtpToken] = useState<string>("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Veuillez entrer une adresse email valide.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setStep("otp");
      setSuccessMessage(`Un code de connexion à 6 chiffres a été envoyé à ${cleanEmail}`);
    } catch (err: unknown) {
      console.error("Erreur envoi code OTP:", err);
      const msg = err instanceof Error ? err.message : "Erreur lors de l'envoi du code.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = otpToken.trim();

    if (!cleanToken || cleanToken.length < 6) {
      setErrorMessage("Veuillez entrer le code à 6 chiffres reçu par email.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: cleanToken,
        type: "email",
      });

      if (error) {
        throw error;
      }

      localStorage.setItem("loreno_user_email", email.trim().toLowerCase());
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Erreur vérification code:", err);
      const msg = err instanceof Error ? err.message : "Code invalide ou expiré.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black">
        {/* Header */}
        <div className="w-full pt-2 flex items-center justify-between h-8">
          <Link
            href="/auth"
            className="p-2 -ml-2 text-zinc-400 hover:text-black transition"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-medium text-zinc-500">Connexion sécurisée</span>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="space-y-6 text-center">
            {step === "email" ? (
              <>
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                    Connexion avec code
                  </h1>
                  <p className="text-sm text-zinc-600 max-w-xs mx-auto">
                    Déjà inscrit ? Reçois un code unique par email pour te reconnecter sans mot de passe.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-3 pt-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entre ton adresse email"
                    required
                    autoFocus
                    className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-center text-sm font-medium text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
                    style={{ fontSize: "16px" }}
                  />

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <span>Envoyer mon code de connexion</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                    <KeyRound className="w-6 h-6 text-black" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                    Entre ton code
                  </h1>
                  <p className="text-sm text-zinc-600 max-w-xs mx-auto">
                    Code à 6 chiffres envoyé à <strong className="text-black">{email}</strong>
                  </p>
                </div>

                {successMessage && (
                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 p-3 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-zinc-800" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    autoFocus
                    className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-center text-2xl font-mono tracking-widest font-bold text-black placeholder:text-zinc-300 focus:outline-none focus:border-black transition"
                    style={{ fontSize: "24px" }}
                  />

                  <button
                    type="submit"
                    disabled={loading || otpToken.length < 6}
                    className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <span>Valider et me connecter</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="text-zinc-500 hover:text-black underline"
                    >
                      Modifier l&apos;email
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-zinc-500 hover:text-black underline"
                    >
                      Renvoyer le code
                    </button>
                  </div>
                </form>
              </>
            )}

            {errorMessage && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl text-center">
                {errorMessage}
              </p>
            )}

            <div className="pt-4 border-t border-zinc-100">
              <Link
                href="/auth"
                className="text-xs text-zinc-500 hover:text-black transition"
              >
                Pas encore de compte ? S&apos;inscrire instantanément →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-2 text-center text-[11px] text-zinc-400">
          Loreno
        </div>
      </div>
    </main>
  );
}
