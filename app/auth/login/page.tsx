"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { OtpAuthForm } from "@/components/auth/otp-auth-form";
import { AuthRetentionBanner } from "@/components/auth/auth-retention-banner";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [retentionScore, setRetentionScore] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const score = sessionStorage.getItem("loreno_retention_score");
      if (score) setRetentionScore(score);
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        "/dashboard"
      )}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Erreur connexion Google :", err);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-zinc-50 p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-between pt-2">
        <button
          onClick={() => router.push("/")}
          className="p-2 -ml-2 rounded-xl text-zinc-500 hover:text-black hover:bg-zinc-100 transition cursor-pointer"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Connexion
        </span>
        <div className="w-9" />
      </div>

      {/* Corps Principal */}
      <div className="w-full max-w-sm mx-auto my-auto space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-black text-black tracking-tight">
            Accède à tes cours
          </h1>
          <p className="text-xs text-zinc-500">
            Retrouve tes synthèses et flashcards en 1 clic
          </p>
        </div>

        <AuthRetentionBanner score={retentionScore} />

        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-5">
          <GoogleAuthButton
            isLoading={isGoogleLoading}
            onClick={handleGoogleLogin}
            text="Connexion avec Google"
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider absolute">
              ou par email
            </span>
          </div>

          <OtpAuthForm onSuccess={() => router.push("/dashboard")} />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-sm mx-auto text-center pb-4 space-y-2">
        <p className="text-[11px] text-zinc-400">
          En continuant, tu acceptes nos{" "}
          <Link href="/terms" className="underline hover:text-black">
            Conditions
          </Link>{" "}
          et notre{" "}
          <Link href="/privacy" className="underline hover:text-black">
            Politique de Confidentialité
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
