"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { QuizStepsForm } from "@/components/quiz-steps-form";
import { isInAppBrowser } from "@/lib/in-app-browser";

export default function QuizPage() {
  const router = useRouter();
  const supabase = createClient();

  // 1: Level, 2: Goal, 3: Name, 4: Pain, 5: Email (1-Tap Passwordless)
  const [step, setStep] = useState<number>(1);
  const [level, setLevel] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [painPoint, setPainPoint] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [isSubmittingEmail, setIsSubmittingEmail] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGoogleLogin, setShowGoogleLogin] = useState<boolean>(false);

  // Débloquer immédiatement le formulaire si retour arrière navigateur / bfcache
  const unlockForm = useCallback(() => {
    setIsSubmittingEmail(false);
    setIsGoogleLoading(false);
  }, []);

  useEffect(() => {
    setShowGoogleLogin(!isInAppBrowser());
    unlockForm();

    const handleVisibility = () => { if (document.visibilityState === "visible") unlockForm(); };
    window.addEventListener("pageshow", unlockForm);
    window.addEventListener("focus", unlockForm);
    window.addEventListener("popstate", unlockForm);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pageshow", unlockForm);
      window.removeEventListener("focus", unlockForm);
      window.removeEventListener("popstate", unlockForm);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [unlockForm]);

  // Si l'utilisateur est déjà connecté, valider l'onboarding et aller directement sur /dashboard
  useEffect(() => {
    const fetchSavedState = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          if (meta.onboarding_completed === true || user.email) {
            if (meta.onboarding_completed !== true) {
              await supabase.auth.updateUser({ data: { onboarding_completed: true, onboarding_step: 5 } });
            }
            router.replace("/dashboard?onboard=true");
            return;
          }
          if (meta.study_level) setLevel(meta.study_level);
          if (meta.study_goal) setGoal(meta.study_goal);
          if (meta.full_name) setUserName(meta.full_name);
          if (meta.pain_point) setPainPoint(meta.pain_point);
          if (typeof meta.onboarding_step === "number" && meta.onboarding_step >= 1 && meta.onboarding_step <= 5) {
            setStep(meta.onboarding_step);
          }
        }
      } catch (err) {
        console.warn("Could not fetch saved onboarding state", err);
      }
    };
    fetchSavedState();
  }, [router, supabase]);

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      if (userName.trim()) localStorage.setItem("loreno_user_name", userName.trim());
      localStorage.setItem("loreno_onboarding", JSON.stringify({ level, goal, userName: userName.trim(), painPoint, completedAt: new Date().toISOString() }));
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard?onboard=true")}`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectUrl } });
      if (error) throw error;
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur de connexion Google");
      setIsGoogleLoading(false);
    }
  };

  const selectOptionAndAdvance = (setter: (val: string) => void, value: string) => {
    setter(value);
    setTimeout(() => {
      setStep((prev) => {
        const nextStep = prev + 1;
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.auth.updateUser({
              data: {
                onboarding_step: nextStep,
                study_level: setter === setLevel ? value : level,
                study_goal: setter === setGoal ? value : goal,
                pain_point: setter === setPainPoint ? value : painPoint,
              },
            });
          }
        }).catch(() => {});
        return nextStep;
      });
    }, 150);
  };

  const handleAdvanceToStep4 = () => {
    setStep(4);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.auth.updateUser({
          data: {
            onboarding_step: 4,
            full_name: userName.trim(),
          },
        });
      }
    }).catch(() => {});
  };

  // Connexion instantanée 1-Tap & Enregistrement Onboarding en base
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
      // 1. Enregistrement automatique et sécurisé côté serveur avec sauvegarde onboarding
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          onboarding: {
            step: 5,
            level,
            goal,
            userName: userName.trim(),
            painPoint,
            completed: true,
          },
        }),
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

      router.push("/dashboard?onboard=true");
    } catch (err) {
      console.error("Erreur connexion email :", err);
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
        {/* Top Header */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between h-9 mb-3">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 text-zinc-400 hover:text-black transition cursor-pointer"
                aria-label="Étape précédente"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}
            <Image
              src="/logo.png"
              alt="loreno.app"
              width={160}
              height={40}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
            <span className="text-xs font-mono text-zinc-400">
              {step} / 5
            </span>
          </div>

          <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden border border-zinc-200">
            <div
              className="bg-black h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
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
          isGoogleLoading={isGoogleLoading}
          errorMessage={errorMessage}
          selectOptionAndAdvance={selectOptionAndAdvance}
          onAdvanceToStep4={handleAdvanceToStep4}
          onSubmitEmail={handleSubmitEmail}
          showGoogleLogin={showGoogleLogin}
          onGoogleLogin={handleGoogleLogin}
        />

        {/* Footer Minimalist Powered by FounderRace */}
        <div className="py-3 flex items-center justify-center">
          <a
            href="https://founderrace.com/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-black transition group opacity-90 hover:opacity-100"
          >
            <span className="font-medium text-zinc-500">Powered by</span>
            <div className="flex items-center gap-1.5 font-bold text-black">
              <Image src="/founderrace-logo.svg" alt="FounderRace" width={20} height={20} className="w-5 h-5 rounded-[5px] shadow-2xs" />
              <span className="font-mono text-xs uppercase tracking-wider group-hover:underline">FounderRace</span>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
