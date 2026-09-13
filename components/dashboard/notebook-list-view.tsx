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
      setTimeout(() => {
        confetti({ particleCount: 100, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
        confetti({ particleCount: 100, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
      }, 250);
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

      {/* Bandeau d'état compact : Quota & Accès Premium */}
      {!isPro ? (
        <div
          onClick={onOpenPaywall}
          className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-900 text-white hover:bg-black transition flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-xs"
        >
          <div className="flex items-center gap-2 text-xs truncate">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
            <span className="font-medium text-zinc-200 truncate">
              {notebooks.length >= 2 ? (
                <>Limite 2/2 atteinte • <strong className="text-white font-semibold">Accès illimité (9,99€)</strong></>
              ) : (
                <>{notebooks.length}/2 cours gratuits • <strong className="text-white font-semibold">Pack Premium à vie</strong></>
              )}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-white bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-xl shrink-0 ml-2">
            Débloquer →
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
          <span className="text-zinc-600 font-medium">
            Mes cours : <strong className="text-black font-bold">{notebooks.length}</strong> (Accès illimité)
          </span>
          <span className="text-[10px] font-bold text-black bg-zinc-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
            ⭐ Membre Premium
          </span>
        </div>
      )}

      {/* SECTION : CRÉER & RÉVISER */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Créer &amp; Réviser
          </span>
        </div>

        <div className="space-y-2">
          {/* Bulle d'instruction Étape 1 */}
          {isTourActive && tourStep === "choose_mode" && (
            <div className="relative z-50">
              <OnboardingTourBubble show={true} onDismiss={handleCompleteFinalTour} />
            </div>
          )}

          {/* Grille Flashcards & Quiz surélevée si étape 1 */}
          <div className={`grid grid-cols-2 gap-2 ${isTourActive && tourStep === "choose_mode" ? "relative z-50" : ""}`}>
            {/* TUILE 1 : FLASHCARDS */}
            <button
              onClick={() => onActionClick?.("flashcards")}
              className="p-3 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-black transition active:scale-[0.98] text-left flex items-center gap-2.5 shadow-sm group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black shrink-0 shadow-2xs">
                <Layers className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-black truncate block">Flashcards</span>
                <span className="text-[10px] text-zinc-500 truncate block">Mémorisation 3D</span>
              </div>
            </button>

            {/* TUILE 2 : QUIZ EXAMEN */}
            <button
              onClick={() => onActionClick?.("quiz")}
              className="p-3 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-black transition active:scale-[0.98] text-left flex items-center gap-2.5 shadow-sm group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black shrink-0 shadow-2xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-black truncate block">Quiz examen</span>
                <span className="text-[10px] text-zinc-500 truncate block">Note sur /20</span>
              </div>
            </button>
          </div>

          {/* TUILE 3 : ASSISTANT IA */}
          <button
            onClick={() => onActionClick?.("tutor")}
            className="w-full p-3 rounded-2xl border border-black bg-black text-white hover:bg-zinc-800 transition active:scale-[0.98] text-left flex items-center justify-between shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">Assistant IA Personnel</div>
                <div className="text-[10px] text-zinc-400">Pose toutes tes questions sur tes cours 24/7</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white text-black font-bold text-[10px] shrink-0 ml-2">
              {isPro ? "IA" : "PRO"}
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
              className="p-6 text-center text-zinc-500 text-xs border border-dashed border-zinc-300 rounded-2xl space-y-2 bg-zinc-50/70 hover:bg-zinc-100/80 hover:border-zinc-400 transition cursor-pointer active:scale-[0.99] group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-black mx-auto group-hover:scale-110 transition shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <p className="font-semibold text-black text-sm">Prendre une photo de cours</p>
              <p className="text-zinc-500 max-w-xs mx-auto">
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

      {/* Modal Profil & Déconnexion */}
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

