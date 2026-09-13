"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { User, Play, Sparkles, Trash2, Layers, CheckCircle2, Plus } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { UserProfileModal } from "./user-profile-modal";
import { OnboardingTourBubble } from "./onboarding-tour-bubble";
import { getTourStep, setTourStep, completeOnboardingTour, isOnboardingCompleted } from "@/lib/onboarding-tour-state";

import { NotebookListItem } from "./notebook-list-item";

interface NotebookListViewProps {
  notebooks: NotebookItem[];
  onSelectNotebook: (nb: NotebookItem) => void;
  onOpenPaywall: () => void;
  isPro?: boolean;
  userEmail?: string | null;
  onDeleteNotebook?: (id: string) => void;
  onActionClick?: (mode: "flashcards" | "quiz" | "tutor") => void;
  onOpenScanModal?: () => void;
}

export function NotebookListView({
  notebooks,
  onSelectNotebook,
  onOpenPaywall,
  isPro = false,
  userEmail,
  onDeleteNotebook,
  onActionClick,
  onOpenScanModal,
}: NotebookListViewProps) {
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const currentTourStep = getTourStep();
  const [tourStep, setLocalTourStep] = useState(currentTourStep);
  const isTourActive = !isOnboardingCompleted() && tourStep !== "completed";

  const handleCompleteFinalTour = () => {
    completeOnboardingTour();
    setLocalTourStep("completed");
    try {
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
      setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 200);
    } catch {}
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 select-none pb-28">
      {/* Overlay sombre léger lorsque le tour d'onboarding est actif */}
      {isTourActive && (
        <div
          onClick={handleCompleteFinalTour}
          className="fixed inset-0 bg-black/75 backdrop-blur-[2px] z-40 animate-in fade-in duration-300 cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Header avec logo loreno.app horizontal */}
      <header className="w-full pt-1 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="loreno.app"
            width={124}
            height={30}
            className="h-6 sm:h-7 w-auto object-contain"
            priority
          />
        </div>

        <div className="flex items-center gap-2.5">
          {isPro ? (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 border border-zinc-300 text-black flex items-center gap-1">
              <span>⭐</span> PREMIUM
            </span>
          ) : (
            <button
              onClick={onOpenPaywall}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              PRO
            </button>
          )}

          <button
            onClick={() => setShowProfileModal(true)}
            className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center text-zinc-600 hover:text-black transition cursor-pointer"
            aria-label="Profil"
            title="Mon profil et compte"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* SECTION : CRÉER & RÉVISER */}
      <div className="space-y-1.5 pt-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
          Créer &amp; Réviser
        </span>
        <div className="space-y-2">
          {isTourActive && tourStep === "choose_mode" && (
            <div className="relative z-50">
              <OnboardingTourBubble show={true} onDismiss={handleCompleteFinalTour} />
            </div>
          )}
          <div className={`grid grid-cols-2 gap-2.5 ${isTourActive && tourStep === "choose_mode" ? "relative z-50" : ""}`}>
            {/* TUILE 1 : FLASHCARDS */}
            <button
              onClick={() => onActionClick?.("flashcards")}
              className="p-3.5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50/80 text-black transition-all active:scale-[0.98] text-left flex items-center gap-3 shadow-2xs hover:border-zinc-300 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50/90 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-zinc-900 truncate block">Flashcards</span>
                <span className="text-[11px] text-zinc-500 truncate block font-medium">Mémorisation 3D</span>
              </div>
            </button>

            {/* TUILE 2 : QUIZ EXAMEN */}
            <button
              onClick={() => onActionClick?.("quiz")}
              className="p-3.5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50/80 text-black transition-all active:scale-[0.98] text-left flex items-center gap-3 shadow-2xs hover:border-zinc-300 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50/90 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-zinc-900 truncate block">Quiz examen</span>
                <span className="text-[11px] text-zinc-500 truncate block font-medium">Note sur /20</span>
              </div>
            </button>
          </div>

          {/* TUILE 3 : ASSISTANT IA (SMART TECH LORENO) */}
          <button
            onClick={() => onActionClick?.("tutor")}
            className="w-full p-3.5 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-white text-black hover:border-indigo-300 hover:shadow-xs transition-all active:scale-[0.98] text-left flex items-center justify-between shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-zinc-900 truncate flex items-center gap-1.5">
                  Assistant IA Personnel
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-600 text-white tracking-wide">
                    IA
                  </span>
                </div>
                <div className="text-[11px] text-zinc-600 truncate font-normal">Pose toutes tes questions sur tes cours 24/7</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-100/90 text-indigo-700 font-bold text-[11px] shrink-0 ml-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {isPro ? "Ouvrir" : "PRO"}
            </span>
          </button>
        </div>
      </div>

      {/* SECTION : MES COURS SCANNÉS */}
      <div className="space-y-2 pt-2">
        {/* Bulle d'instruction Étape 4 : Cliquer sur son cours pour le voir */}
        {isTourActive && tourStep === "click_course" && (
          <div className="relative z-50">
            <OnboardingTourBubble
              show={true}
              badgeText="Ton cours est prêt 📖"
              title="Ouvre ton premier cours"
              description="Clique sur ton cours ci-dessous pour découvrir ta synthèse détaillée et tes options !"
              arrowDirection="down"
              showDismiss={false}
            />
          </div>
        )}

        {/* Bulle d'instruction Étape 5 : Découverte d'un nouveau cours */}
        {isTourActive && tourStep === "import_new" && (
          <div className="relative z-50">
            <OnboardingTourBubble
              show={true}
              badgeText="Tout est prêt 🚀"
              title="Ajoute d'autres cours à tout moment"
              description="Appuie sur Nouveau cours (+) en bas pour scanner tes prochains cours manuscrits ou PDF !"
              arrowDirection="down"
              actionLabel="J'ai compris 🚀"
              onAction={handleCompleteFinalTour}
              showDismiss={false}
            />
          </div>
        )}

        {/* Bandeau d'état Quota & Conversion (affiché uniquement une fois l'onboarding terminé) */}
        {!isTourActive && !isPro && (
          <div
            onClick={onOpenPaywall}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-900/10 bg-zinc-950 text-white hover:bg-black transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-center gap-2.5 text-xs truncate">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="font-medium text-zinc-200 truncate">
                {notebooks.length >= 2 ? (
                  <>🔒 <strong className="text-white font-semibold">Limite 2/2 atteinte</strong> • Accès illimité</>
                ) : notebooks.length === 1 ? (
                  <>⚡ <strong className="text-white font-semibold">1/2 cours gratuit utilisé</strong> • Pack à vie</>
                ) : (
                  <>✨ <strong className="text-white font-semibold">2 cours gratuits offerts</strong> • Pack à vie</>
                )}
              </span>
            </div>
            <span className="text-[11px] font-bold text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-3 py-1 rounded-xl shrink-0 ml-2 transition">
              {notebooks.length >= 2 ? "Débloquer 9,99€ →" : "Passer en Pro →"}
            </span>
          </div>
        )}

        {!isTourActive && isPro && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-600 font-medium">
              Mes cours : <strong className="text-black font-bold">{notebooks.length}</strong> (Accès illimité)
            </span>
            <span className="text-[10px] font-bold text-black bg-zinc-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
              ⭐ Membre Premium
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Mes cours ({notebooks.length})
          </span>
        </div>

        <div className="space-y-2.5">
          {notebooks.length === 0 ? (
            <div
              onClick={() => {
                if (onOpenScanModal) onOpenScanModal();
                else router.push("/dashboard/new");
              }}
              className="p-7 text-center text-zinc-500 text-xs border border-dashed border-zinc-300 rounded-2xl space-y-2.5 bg-zinc-50/60 hover:bg-zinc-100/70 hover:border-indigo-300 transition-all cursor-pointer active:scale-[0.99] group shadow-2xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-800 mx-auto group-hover:scale-110 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <p className="font-bold text-zinc-900 text-sm">Prendre une photo de cours</p>
              <p className="text-zinc-500 text-xs max-w-xs mx-auto">
                Appuie ici pour scanner ton premier cours manuscrit ou PDF.
              </p>
            </div>
          ) : (
            notebooks.map((nb, idx) => (
              <div
                key={nb.id}
                className={isTourActive && tourStep === "click_course" && idx === 0 ? "relative z-50 ring-2 ring-violet-500 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200" : ""}
              >
                <NotebookListItem
                  notebook={nb}
                  onSelect={(item) => {
                    if (isTourActive && tourStep === "click_course") {
                      setTourStep("inspect_course");
                      setLocalTourStep("inspect_course");
                    }
                    onSelectNotebook(item);
                  }}
                  onDelete={onDeleteNotebook}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userEmail={userEmail}
        isPro={isPro}
        notebooksCount={notebooks.length}
        onOpenPaywall={onOpenPaywall}
      />
    </div>
  );
}

