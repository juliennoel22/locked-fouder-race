"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function ReferralListener() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Capture du paramètre ?ref=... depuis l'URL si présent
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get("ref");
      if (refParam) {
        const cleanRef = refParam.trim().toUpperCase();
        localStorage.setItem("loreno_ref_code", cleanRef);
        document.cookie = `loreno_ref_code=${encodeURIComponent(cleanRef)}; path=/; max-age=2592000; SameSite=Lax`;
      }
    } catch {}

    const supabase = createClient();

    // 2. Fonction d'auto-liaison du parrainage pour un utilisateur connecté
    const bindReferral = async (userId: string) => {
      const savedRef = localStorage.getItem("loreno_ref_code");
      if (!savedRef) return;

      const attemptedKey = `loreno_ref_attempted_${userId}_${savedRef}`;
      if (sessionStorage.getItem(attemptedKey)) return;
      sessionStorage.setItem(attemptedKey, "true");

      try {
        const res = await fetch("/api/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refCode: savedRef }),
        });

        const data = await res.json();

        // Dans tous les cas, nettoyer le code temporaire après la tentative
        localStorage.removeItem("loreno_ref_code");
        document.cookie = "loreno_ref_code=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        if (data.success) {
          localStorage.setItem("loreno_pro", "true");
          document.cookie = "loreno_pro=true; path=/; max-age=2592000; SameSite=Lax";

          // Rechargement doux pour activer les 3 jours Pro immédiatement
          if (window.location.pathname !== "/dashboard") {
            window.location.href = "/dashboard";
          } else {
            window.location.reload();
          }
        }
      } catch (err) {
        console.warn("Auto-bind referral warning:", err);
        localStorage.removeItem("loreno_ref_code");
      }
    };

    // Tente immédiatement si une session utilisateur existe déjà
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        bindReferral(session.user.id);
      }
    });

    // Écoute également les connexions/inscriptions futures en temps réel
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        bindReferral(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
