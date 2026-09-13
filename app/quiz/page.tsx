"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { QuizStepsForm } from "@/components/quiz-steps-form";
import { isInAppBrowser } from "@/lib/in-app-browser";

export default function QuizPage() {
  const router = useRouter();
  const supabase = createClient();

  // 1: Level, 2: Goal, 3: Name, 4: Pain, 5: Email (Step 6/6 in overall flow)
  const [step, setStep] = useState<number>(1);
  const [level, setLevel] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [painPoint, setPainPoint] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [isSubmittingEmail, setIsSubmittingEmail] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGoogleLogin, setShowGoogleLogin] = useState<boolean>(false);

  useEffect(() => {
    // Activer Google OAuth uniquement sur les navigateurs standards (évite l'erreur 403 Google sur TikTok/Insta)
    setShowGoogleLogin(!isInAppBrowser());
  }, []);

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      router.push("/");
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmittingEmail(true);
    setErrorMessage(null);
    try {
      if (userName.trim()) {
        localStorage.setItem("loreno_user_name", userName.trim());
      }
      localStorage.setItem(
        "loreno_onboarding",
        JSON.stringify({
          level,
          goal,
          userName: userName.trim(),
          painPoint,
          completedAt: new Date().toISOString(),
        })
      );

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard?onboard=true`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur de connexion Google");
      setIsSubmittingEmail(false);
    }
  };

  const selectOptionAndAdvance = (setter: (val: string) => void, value: string) => {
    setter(value);
    setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 150);
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Veuillez entrer une adresse email valide.");
      return;
    }

    setIsSubmittingEmail(true);
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

      // 2. Établissement de la session Supabase client
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: data.secret,
      });

      if (signInError) {
        console.warn("Avertissement session client :", signInError.message);
      }

      // 3. Sauvegarde locale du profil et redirection vers le dashboard
      localStorage.setItem("loreno_user_email", cleanEmail);
      if (userName.trim()) {
        localStorage.setItem("loreno_user_name", userName.trim());
      }
      localStorage.setItem(
        "loreno_onboarding",
        JSON.stringify({
          level,
          goal,
          userName: userName.trim(),
          painPoint,
          completedAt: new Date().toISOString(),
        })
      );

      // Mettre à jour les métadonnées de l'utilisateur si connecté
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: userName.trim() || undefined,
            study_level: level || undefined,
            study_goal: goal || undefined,
          },
        });
      } catch (syncErr) {
        console.warn("Sync metadata warning :", syncErr);
      }

      router.push("/dashboard?onboard=true");
    } catch (err) {
      console.error("Erreur connexion email :", err);
      // Mode tolérant aux pannes : enregistrement local et redirection immédiate
      localStorage.setItem("loreno_user_email", cleanEmail);
      if (userName.trim()) {
        localStorage.setItem("loreno_user_name", userName.trim());
      }
      router.push("/dashboard?onboard=true");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black selection:bg-black selection:text-white">
        {/* Top Header : Back Button, Logo & Progress Bar */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between h-9 mb-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-zinc-400 hover:text-black transition cursor-pointer"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Image
              src="/logo.png"
              alt="loreno.app"
              width={130}
              height={32}
              className="h-7 sm:h-8 w-auto object-contain"
              priority
            />
            <span className="text-xs font-mono text-zinc-400">
              {step + 1} / 6
            </span>
          </div>

          <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden border border-zinc-200">
            <div
              className="bg-black h-full transition-all duration-300"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content Area */}
        <QuizStepsForm
          step={step}
          level={level}
          setLevel={setLevel}
          goal={goal}
          setGoal={setGoal}
          userName={userName}
          setUserName={setUserName}
          painPoint={painPoint}
          setPainPoint={setPainPoint}
          email={email}
          setEmail={setEmail}
          isSubmittingEmail={isSubmittingEmail}
          errorMessage={errorMessage}
          selectOptionAndAdvance={selectOptionAndAdvance}
          onAdvanceToStep4={() => setStep(4)}
          onSubmitEmail={handleSubmitEmail}
          showGoogleLogin={showGoogleLogin}
          onGoogleLogin={handleGoogleLogin}
        />

        {/* Footer Minimalist */}
        <div className="py-2 text-center text-[11px] text-zinc-400">
          Loreno
        </div>
      </div>
    </main>
  );
}
