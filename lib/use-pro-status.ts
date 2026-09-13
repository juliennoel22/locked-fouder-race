"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

function setProCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "loreno_pro=true; path=/; max-age=31536000; SameSite=Lax";
  }
}

function removeProCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "loreno_pro=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

function hasProCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((item) => item.trim().startsWith("loreno_pro=true"));
}

export function useProStatus() {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [justUnlocked, setJustUnlocked] = useState<boolean>(false);
  const [isJuryMode, setIsJuryMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);

    // 0. Mode Jury / Démo / Évaluateur (Débloque immédiatement et persiste pour toute la navigation)
    const isJuryParam =
      urlParams.get("jury") === "true" ||
      urlParams.get("jury") === "1" ||
      urlParams.get("pass") === "jury" ||
      urlParams.get("demo") === "pro" ||
      urlParams.get("demo") === "true" ||
      urlParams.get("eval") === "true";

    // 1. Mode Développement local
    const isDevEnv =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      urlParams.get("dev") === "true" ||
      urlParams.get("pro") === "true";

    // 2. Vérification retour Stripe
    const hasPaymentSuccess =
      urlParams.get("paid") === "true" ||
      urlParams.get("payment") === "success" ||
      urlParams.get("unlocked") === "true" ||
      urlParams.get("success") === "true" ||
      Boolean(urlParams.get("session_id"));

    const localPro = localStorage.getItem("loreno_pro") === "true" || hasProCookie();
    const localJury = localStorage.getItem("loreno_jury_mode") === "true";

    if (isJuryParam) {
      localStorage.setItem("loreno_pro", "true");
      localStorage.setItem("loreno_jury_mode", "true");
      setProCookie();
      setIsPro(true);
      setIsJuryMode(true);
      setJustUnlocked(true);
    } else if (hasPaymentSuccess) {
      localStorage.setItem("loreno_pro", "true");
      setProCookie();
      setIsPro(true);
      setJustUnlocked(true);

      // Sync user_metadata if logged in
      try {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.auth.updateUser({
              data: { is_pro: true, plan: "fondateur" },
            });
          }
        });
      } catch (err) {
        console.error("Erreur sync statut pro Supabase :", err);
      }

      // Clean URL params cleanly
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (isDevEnv || localPro) {
      setIsPro(true);
      if (localJury) setIsJuryMode(true);
    } else {
      // Sync from Supabase metadata
      try {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user?.user_metadata?.is_pro) {
            localStorage.setItem("loreno_pro", "true");
            setProCookie();
            setIsPro(true);
          }
        });
      } catch (err) {
        console.error("Erreur lecture statut pro :", err);
      }
    }

    setIsLoading(false);
  }, []);

  const activatePro = useCallback(() => {
    localStorage.setItem("loreno_pro", "true");
    setProCookie();
    setIsPro(true);
  }, []);

  const deactivatePro = useCallback(() => {
    localStorage.removeItem("loreno_pro");
    localStorage.removeItem("loreno_jury_mode");
    removeProCookie();
    setIsPro(false);
    setIsJuryMode(false);
  }, []);

  const dismissCelebration = useCallback(() => {
    setJustUnlocked(false);
  }, []);

  return {
    isPro,
    isJuryMode,
    isLoading,
    justUnlocked,
    dismissCelebration,
    activatePro,
    deactivatePro,
  };
}
