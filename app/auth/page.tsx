"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");
  const [retentionScore, setRetentionScore] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const score = sessionStorage.getItem("loreno_retention_score");
      if (score) setRetentionScore(score);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Veuillez entrer une adresse email valide.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Enregistrement automatique et sécurisé côté serveur dans Supabase auth.users
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.secret) {
        throw new Error(data.error || "Impossible de se connecter.");
      }

      // 2. Établissement de la session Supabase client sans mot de passe visible
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: data.secret,
      });

      if (signInError) {
        console.warn("Avertissement session client :", signInError.message);
      }

      // 3. Sauvegarde locale de l'email et redirection directe vers le dashboard
      localStorage.setItem("loreno_user_email", cleanEmail);
      router.push("/dashboard");
    } catch (err) {
      console.error("Erreur connexion email:", err);
      // Même en cas d'erreur de réseau temporaire, on ne bloque jamais l'étudiant
      localStorage.setItem("loreno_user_email", cleanEmail);
      router.push("/dashboard");
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

        {/* Content Minimalist : Email Only */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              {retentionScore && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-black mx-auto mb-1">
                  <span>🎯 Score de rétention : {retentionScore}%</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                Entre ton email pour continuer
              </h1>
              <p className="text-sm text-zinc-600 max-w-xs mx-auto">
                {retentionScore
                  ? "Sauvegarde tes fiches d'examen et retrouve tes révisions sur tous tes appareils."
                  : "Accède à tes fiches d'examen et à ton tuteur IA sans aucun mot de passe."}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Formulaire 100% Email Unique */}
              <form onSubmit={handleSubmit} className="space-y-3">
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
                  className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <span>Accéder à mes cours</span>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                <span>Connexion instantanée • Sans mot de passe</span>
              </div>

              {errorMessage && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl text-center">
                  {errorMessage}
                </p>
              )}

              {/* Passerelle directe et reconnexion */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  className="text-xs text-zinc-500 hover:text-black transition"
                >
                  Déjà un compte ? Se connecter avec un code →
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
