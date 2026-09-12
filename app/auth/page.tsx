"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loadingGoogle, setLoadingGoogle] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMessage(null);
      const redirectTo = `${window.location.origin}/auth/confirm?next=/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Erreur Google Auth:", err);
      setErrorMessage(err instanceof Error ? err.message : "Erreur de connexion Google");
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Veuillez entrer une adresse email valide.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Tenter la connexion avec mot de passe
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!signInError && signInData.session) {
        router.push("/dashboard");
        return;
      }

      // 2. Si le compte n'existe pas encore, créer le compte immédiatement
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (!signUpError && (signUpData.session || signUpData.user)) {
        router.push("/dashboard");
        return;
      }

      if (signInError) {
        throw signInError;
      } else if (signUpError) {
        throw signUpError;
      }
    } catch (err) {
      console.error("Erreur Auth:", err);
      setErrorMessage(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black selection:bg-black selection:text-white">
        {/* Header : Progress Bar */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between h-8 mb-3">
            <Link
              href="/quiz"
              className="p-2 -ml-2 text-zinc-400 hover:text-black transition"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-xs font-mono text-zinc-400">6 / 6</span>
          </div>

          <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden border border-zinc-200">
            <div className="bg-black h-full transition-all duration-300" style={{ width: "100%" }} />
          </div>
        </div>

        {/* Content Minimalist */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                Connecte-toi pour continuer
              </h1>
              <p className="text-sm text-zinc-600 max-w-xs mx-auto">
                Accède à tes fiches d&apos;examen et à ton tuteur IA.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle || loading}
                className="w-full h-14 bg-white hover:bg-zinc-50 border border-zinc-200 text-black font-semibold rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
              >
                {loadingGoogle ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-zinc-200 w-full" />
                <span className="bg-white px-3 text-xs text-zinc-400 uppercase tracking-wider absolute">
                  ou
                </span>
              </div>

              {/* Email + Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  required
                  className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-center text-sm font-medium text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
                  style={{ fontSize: "16px" }}
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  required
                  className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-center text-sm font-medium text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
                  style={{ fontSize: "16px" }}
                />

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password.trim()}
                  className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <span>Continuer</span>
                  )}
                </button>
              </form>

              {errorMessage && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl text-center">
                  {errorMessage}
                </p>
              )}

              {/* Passerelle directe */}
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="text-xs text-zinc-500 hover:text-black transition"
                >
                  Passer et voir mes fiches tout de suite →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Minimalist */}
        <div className="py-2 text-center text-[11px] text-zinc-400">
          Loreno
        </div>
      </div>
    </main>
  );
}
