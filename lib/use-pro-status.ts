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

    // Forçage explicite du mode gratuit via URL (?free=true ou ?pro=false)
    const isExplicitFree =
      urlParams.get("free") === "true" ||
      urlParams.get("pro") === "false" ||
      urlParams.get("mode") === "free";

    if (isExplicitFree) {
      localStorage.setItem("loreno_pro", "false");
      localStorage.removeItem("loreno_jury_mode");
      removeProCookie();
      setIsPro(false);
      setIsJuryMode(false);
      setIsLoading(false);
      return;
    }

    // Mode Jury / Démo
    const isJuryParam =
      urlParams.get("jury") === "true" ||
      urlParams.get("jury") === "1" ||
      urlParams.get("pass") === "jury" ||
      urlParams.get("demo") === "pro" ||
      urlParams.get("demo") === "true";

    // Mode Pro forcé via URL
    const isProParam = urlParams.get("pro") === "true" || urlParams.get("dev") === "true";

    // Retour Stripe Payant
    const hasPaymentSuccess =
      urlParams.get("paid") === "true" ||
      urlParams.get("payment") === "success" ||
      urlParams.get("unlocked") === "true" ||
      urlParams.get("success") === "true" ||
      Boolean(urlParams.get("session_id"));

    const storedPro = localStorage.getItem("loreno_pro");
    const localPro = storedPro === "true" || (storedPro === null && hasProCookie());
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

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (isProParam) {
      localStorage.setItem("loreno_pro", "true");
      setProCookie();
      setIsPro(true);
    } else if (storedPro === "false") {
      setIsPro(false);
    } else if (localPro) {
      setIsPro(true);
      if (localJury) setIsJuryMode(true);
    } else {
      // Vérification utilisateur Supabase
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
    localStorage.setItem("loreno_pro", "false");
    localStorage.removeItem("loreno_jury_mode");
    removeProCookie();
    setIsPro(false);
    setIsJuryMode(false);
  }, []);

  const togglePro = useCallback(() => {
    if (isPro) deactivatePro();
    else activatePro();
  }, [isPro, activatePro, deactivatePro]);

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
    togglePro,
  };
}

