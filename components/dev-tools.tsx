"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Wrench, X, Zap, Crown, RotateCcw, Compass, BookOpen, CheckCircle2, FastForward, CheckSquare, Sparkles } from "lucide-react";
import { useProStatus } from "@/lib/use-pro-status";
import { Button } from "@/components/ui/button";

function DevToolsContent() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { isPro, togglePro } = useProStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [isDevVisible, setIsDevVisible] = useState(false);
  const [reviewMode, setReviewMode] = useState<string>("balanced");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isEnvDev = process.env.NODE_ENV === "development";
    const urlParams = new URLSearchParams(window.location.search);
    const hasDevParam = urlParams.get("dev") === "true", hasLocalDev = localStorage.getItem("loreno_dev_mode") === "true";
    if (hasDevParam) localStorage.setItem("loreno_dev_mode", "true");
    if (isEnvDev || hasDevParam || hasLocalDev) setIsDevVisible(true);
    setReviewMode(localStorage.getItem("loreno_review_mode") || "balanced");
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const handleSetReviewMode = (mode: "flash" | "balanced" | "deep") => {
    setReviewMode(mode);
    try { localStorage.setItem("loreno_review_mode", mode); window.dispatchEvent(new Event("storage")); showToast(`Mode : ${mode.toUpperCase()}`); } catch {}
  };

  const handleDevCompleteStep = () => { window.dispatchEvent(new Event("loreno_dev_complete_step")); showToast("⚡ Étape validée à 100% !"); };
  const handleDevNextItem = () => { window.dispatchEvent(new Event("loreno_dev_next_item")); showToast("⏭️ Item suivant"); };

  const handleBypassOnboarding = () => {
    try {
      localStorage.setItem("loreno_onboarding_completed", "true");
      localStorage.setItem("loreno_tour_seen", "true");
      showToast("Onboarding validé !");
      router.push("/dashboard");
    } catch {}
  };

  const handleSetDeckFullProgress = () => {
    try {
      const match = pathname.match(/\/deck\/([^/?]+)/);
      if (match && match[1]) {
        localStorage.setItem(`loreno_progress_${match[1]}`, "100");
        showToast("Cours marqué à 100% !");
        window.location.reload();
      }
    } catch {}
  };

  const handleResetAll = () => {
    try {
      localStorage.removeItem("loreno_onboarding_completed");
      localStorage.removeItem("loreno_tour_step");
      localStorage.removeItem("loreno_tour_seen");
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("loreno_progress_") || k.startsWith("loreno_weak_cards_")) localStorage.removeItem(k);
      });
      showToast("Tour & Progression réinitialisés !");
      setTimeout(() => window.location.reload(), 400);
    } catch {}
  };

  const handleInjectHistoryDeck = () => {
    try {
      const mock = {
        id: "demo-histoire-1929", title: "Histoire : La Crise de 1929 & Régimes Autoritaires", subject: "Histoire",
        summary: "Propagation de la crise de Wall Street et réponses démocratiques vs autoritaires.",
        detailed_content: "# Histoire : La Grande Dépression (1929)\n\n## 1. Origines & Krach\n- **Jeudi Noir** : 24 octobre 1929 à Wall Street.\n- **Faillites bancaires** : Contagion immédiate en Europe.\n\n## 2. Réponses Politiques\n- **Démocraties** : New Deal de Roosevelt, Front Populaire (1936) en France.\n- **Dictatures** : Autarcie agressive et réarmement massif.\n\n## 3. Piège d'Examen\n> ⚠️ **Piège** : Ne pas confondre la date du krach (1929) avec la politique économique de réponse.",
        progress_percent: 0,
        flashcards: [
          { front: "Date du Jeudi Noir marquant le krach de Wall Street ?", back: "Le 24 octobre 1929.", distractors: ["Le 11 novembre 1918.", "Le 6 juin 1944."] },
          { front: "Réponse spécifique des régimes totalitaires à la crise de 1929 ?", back: "L'autarcie et le réarmement forcé de leur économie.", distractors: ["Le libre-échange mondial.", "La baisse des droits de douane."] },
          { front: "Gouvernement français élu en 1936 pour répondre à la crise sociale ?", back: "Le Front Populaire dirigé par Léon Blum.", distractors: ["Le régime de Vichy.", "Le directoire Poincaré."] }
        ],
        initial_quiz_question: "Quelle a été la réponse des régimes autoritaires à la crise de 1929 ?",
        initial_quiz_answer: "L'autarcie économique et le réarmement militaire intensif.",
      };
      localStorage.setItem("loreno_mock_history_deck", JSON.stringify(mock));
      showToast("Deck Histoire 1929 injecté !");
      router.push("/deck/demo-histoire-1929");
    } catch {}
  };

  if (!isDevVisible) return null;

  const isReviewPage = pathname.includes("/review");
  const isQuizPage = pathname.includes("/quiz");
  const isDeckPage = pathname.includes("/deck");

  return (
    <>
      {/* Bouton Pilule Flottant (Toujours en premier plan, sans masquer l'écran) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950 text-white hover:bg-zinc-900 border border-zinc-700 shadow-xl text-xs font-bold transition active:scale-95 cursor-pointer backdrop-blur-xs"
        title="Ouvrir le panneau Développeur Loreno"
      >
        <Wrench className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[11px] font-black tracking-wide text-zinc-100">DEV</span>
        {isPro && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
      </button>

      {/* Panneau Flottant Développeur SANS AUCUN FLOU NI BACKDROP GÊNANT */}
      {isOpen && (
        <div className="fixed bottom-14 right-3 z-50 w-80 sm:w-88 max-w-[calc(100vw-24px)] max-h-[78dvh] overflow-y-auto rounded-2xl bg-zinc-950/95 text-white border border-zinc-700/80 shadow-[0_8px_30px_rgba(0,0,0,0.45)] p-3.5 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-150">
          {/* Header Panel */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-xs font-black text-zinc-100">Dev Studio (Vue Réelle)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="mt-2 p-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in duration-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* 1. SECTION CONTEXTUELLE DYNAMIQUE SELON LA PAGE */}
          <div className="mt-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Actions Page Active
              </span>
              <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[120px]">{pathname}</span>
            </div>

            {/* Si on est dans le lecteur de révision / quiz */}
            {isReviewPage ? (
              <div className="space-y-1.5 pt-1">
                <Button
                  size="xs"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] justify-start gap-1.5 shadow-xs"
                  onClick={handleDevCompleteStep}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  ⚡ Compléter l&apos;étape d&apos;un coup (100%)
                </Button>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    size="xs"
                    variant="outline"
                    className="h-7 text-[10px] border-zinc-700 text-zinc-200 hover:bg-zinc-800 justify-start gap-1"
                    onClick={handleDevNextItem}
                  >
                    <FastForward className="w-3 h-3 text-amber-400" />
                    Item suivant
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    className="h-7 text-[10px] border-zinc-700 text-zinc-200 hover:bg-zinc-800 justify-start gap-1"
                    onClick={() => router.push(`${pathname}?step=6&dev=true`)}
                  >
                    🏆 Sauter Étape 6
                  </Button>
                </div>
              </div>
            ) : isQuizPage ? (
              <div className="pt-1">
                <Button
                  size="xs"
                  className="w-full bg-brand hover:bg-brand-hover text-white font-bold text-[11px] justify-start gap-1.5"
                  onClick={handleBypassOnboarding}
                >
                  ⚡ Valider Onboarding & Go Dashboard
                </Button>
              </div>
            ) : isDeckPage ? (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <Button
                  size="xs"
                  variant="outline"
                  className="h-7 text-[10px] border-zinc-700 text-zinc-200 hover:bg-zinc-800 justify-start gap-1"
                  onClick={handleSetDeckFullProgress}
                >
                  ⚡ Progrès à 100%
                </Button>
                <Button
                  size="xs"
                  className="h-7 text-[10px] bg-brand hover:bg-brand-hover text-white justify-start gap-1"
                  onClick={() => router.push(`/review/${pathname.split("/").pop()}?step=1&dev=true`)}
                >
                  🎮 Lancer Quiz
                </Button>
              </div>
            ) : (
              <div className="pt-1">
                <Button
                  size="xs"
                  variant="outline"
                  className="w-full h-7 text-[10px] border-zinc-700 text-zinc-300 hover:bg-zinc-800 justify-start gap-1.5"
                  onClick={handleInjectHistoryDeck}
                >
                  📜 Injecter Deck Histoire (Baptiste 1929)
                </Button>
              </div>
            )}
          </div>

          {/* 2. STATUT PRO & MODE RÉVISION */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className={`w-3.5 h-3.5 ${isPro ? "text-amber-400 fill-amber-400" : "text-zinc-500"}`} />
                <span className="text-[11px] font-bold text-zinc-200">Statut : {isPro ? "PRO Actif" : "Free"}</span>
              </div>
              <Button
                size="xs"
                variant={isPro ? "outline" : "default"}
                className={`h-6 text-[10px] px-2 ${isPro ? "border-amber-400/50 text-amber-300" : "bg-amber-500 hover:bg-amber-400 text-black font-black"}`}
                onClick={() => {
                  togglePro();
                  showToast(isPro ? "Passé en Free" : "Passé en PRO !");
                }}
              >
                {isPro ? "Désactiver" : "Passer PRO"}
              </Button>
            </div>

            {/* Mode d'interleaving */}
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-zinc-800/80">
              {(["flash", "balanced", "deep"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSetReviewMode(m)}
                  className={`py-1 rounded-md text-[9px] font-bold transition cursor-pointer ${
                    reviewMode === m ? "bg-amber-500 text-black font-black" : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {m === "flash" ? "⚡ Flash" : m === "balanced" ? "⚖️ Normal" : "🧠 Deep"}
                </button>
              ))}
            </div>
          </div>

          {/* 3. RACCOURCIS & RESETS */}
          <div className="mt-2.5 grid grid-cols-3 gap-1 text-[10px]">
            <Button size="xs" variant="outline" className="h-7 text-[10px] border-zinc-800 text-zinc-300 hover:bg-zinc-800 justify-start gap-1" onClick={() => { router.push("/dashboard"); setIsOpen(false); }}>
              <Compass className="w-3 h-3 text-zinc-400" /> Dash
            </Button>
            <Button size="xs" variant="outline" className="h-7 text-[10px] border-zinc-800 text-zinc-300 hover:bg-zinc-800 justify-start gap-1" onClick={() => { router.push("/deck/demo-droit-constitutionnel"); setIsOpen(false); }}>
              <BookOpen className="w-3 h-3 text-zinc-400" /> Démo
            </Button>
            <Button size="xs" variant="outline" className="h-7 text-[10px] border-zinc-800 text-rose-300 hover:bg-rose-950/40 justify-start gap-1" onClick={handleResetAll}>
              <RotateCcw className="w-3 h-3 text-rose-400" /> Reset
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function DevTools() {
  return (
    <Suspense fallback={null}>
      <DevToolsContent />
    </Suspense>
  );
}
