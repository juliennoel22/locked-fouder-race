"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useProStatus() {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [justUnlocked, setJustUnlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);

    // 0. Accès automatique en mode Développement local (localhost / 127.0.0.1 / dev flags)
    const isDevEnv =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      urlParams.get("dev") === "true" ||
      urlParams.get("pro") === "true";

    if (isDevEnv) {
      setIsPro(true);
      setIsLoading(false);
      return;
    }

    // 1. Vérification paramètre URL de retour Stripe (?payment=success)
    const hasPaymentSuccess =
      urlParams.get("payment") === "success" ||
      urlParams.get("unlocked") === "true" ||
      Boolean(urlParams.get("session_id"));

    // 2. Vérification localStorage
    const localPro = localStorage.getItem("loreno_pro") === "true";

    if (hasPaymentSuccess) {
      localStorage.setItem("loreno_pro", "true");
      setIsPro(true);
      setJustUnlocked(true);

      // Mettre à jour les métadonnées Supabase en tâche de fond si connecté
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

      // Nettoyer l'URL sans rechargement
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (localPro) {
      setIsPro(true);
    } else {
      // Vérifier si l'utilisateur connecté a is_pro dans ses user_metadata
      try {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user?.user_metadata?.is_pro) {
            localStorage.setItem("loreno_pro", "true");
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
    setIsPro(true);
  }, []);

  const dismissCelebration = useCallback(() => {
    setJustUnlocked(false);
  }, []);

  return {
    isPro,
    isLoading,
    justUnlocked,
    dismissCelebration,
    activatePro,
  };
}
