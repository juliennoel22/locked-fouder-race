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

    const checkProStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);

      // Mode Jury / Démo explicite
      const isJuryParam =
        urlParams.get("jury") === "true" ||
        urlParams.get("jury") === "1" ||
        urlParams.get("pass") === "jury" ||
        urlParams.get("demo") === "pro";

      if (isJuryParam) {
        setIsPro(true);
        setIsJuryMode(true);
        setJustUnlocked(true);
        setIsLoading(false);
        return;
      }

      // Détection de retour de paiement Stripe
      const hasPaymentReturn =
        urlParams.get("payment") === "success" ||
        urlParams.get("success") === "true" ||
        Boolean(urlParams.get("session_id"));

      // Vérification immédiate du stockage local & cookie
      const isLocalPro =
        localStorage.getItem("loreno_pro") === "true" ||
        localStorage.getItem("loreno_jury_mode") === "true" ||
        hasProCookie();

      if (isLocalPro) {
        setIsPro(true);
      }

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user;

        if (!user) {
          try {
            const { data: userData } = await supabase.auth.getUser();
            user = userData?.user || undefined;
          } catch {}
        }

        const userIsPro = Boolean(user?.user_metadata?.is_pro) || isLocalPro;
        setIsPro(userIsPro);

        if (userIsPro) {
          setProCookie();
        } else {
          removeProCookie();
        }

        if (hasPaymentReturn && userIsPro) {
          setJustUnlocked(true);
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (err) {
        console.error("Erreur vérification statut Pro Supabase :", err);
        // Fallback sur le statut local si erreur réseau/supabase
        if (isLocalPro) setIsPro(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkProStatus();
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

