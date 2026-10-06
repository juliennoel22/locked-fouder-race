"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isInAppBrowser } from "@/lib/in-app-browser";

export function useQuizOnboarding() {
  const router = useRouter();
  const supabase = createClient();

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

  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  const unlockForm = useCallback(() => {
    setIsSubmittingEmail(false);
    setIsGoogleLoading(false);
  }, []);

  useEffect(() => {
    setShowGoogleLogin(!isInAppBrowser());
    unlockForm();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") unlockForm();
    };
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

  useEffect(() => {
    const fetchSavedState = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          if (meta.onboarding_completed === true || user.email) {
            if (meta.onboarding_completed !== true) {
              await supabase.auth.updateUser({
                data: { onboarding_completed: true, onboarding_step: 5 },
              });
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
    if (step > 1) setStep((prev) => prev - 1);
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
          data: { onboarding_step: 4, full_name: userName.trim() },
        });
      }
    }).catch(() => {});
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      if (userName.trim()) localStorage.setItem("loreno_user_name", userName.trim());
      localStorage.setItem("loreno_onboarding", JSON.stringify({
        level, goal, userName: userName.trim(), painPoint, completedAt: new Date().toISOString(),
      }));
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard?onboard=true")}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur de connexion Google");
      setIsGoogleLoading(false);
    }
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
      await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          onboarding: { step: 5, level, goal, userName: userName.trim(), painPoint, completed: true },
        }),
      });

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          data: { onboarding_completed: true, full_name: userName.trim() },
        },
      });

      if (otpError) throw otpError;

      localStorage.setItem("loreno_user_email", cleanEmail);
      if (userName.trim()) localStorage.setItem("loreno_user_name", userName.trim());
      setOtpSent(true);
    } catch (err: unknown) {
      console.error("Erreur envoi OTP :", err);
      setErrorMessage(err instanceof Error ? err.message : "Impossible d'envoyer le code de connexion.");
    } finally {
      setIsSubmittingEmail(false);
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

      localStorage.setItem("loreno_onboarding", JSON.stringify({
        level, goal, userName: userName.trim(), painPoint, completedAt: new Date().toISOString(),
      }));

      router.push("/dashboard?onboard=true");
    } catch (err: unknown) {
      console.error("Erreur vérification OTP :", err);
      setErrorMessage(err instanceof Error ? err.message : "Code invalide ou expiré.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return {
    step, level, setLevel, goal, setGoal, userName, setUserName, painPoint, setPainPoint,
    email, setEmail, isSubmittingEmail, isGoogleLoading, errorMessage, showGoogleLogin,
    otpSent, otpCode, setOtpCode, isVerifyingOtp, handleBack, selectOptionAndAdvance,
    handleAdvanceToStep4, handleGoogleLogin, handleSubmitEmail, handleVerifyOtp,
    resetOtp: () => setOtpSent(false),
  };
}
