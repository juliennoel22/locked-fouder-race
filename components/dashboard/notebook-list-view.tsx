"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { User, Bot, Layers, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { UserProfileModal } from "./user-profile-modal";
import { OnboardingTourBubble } from "./onboarding-tour-bubble";
import { getTourStep, setTourStep, completeOnboardingTour, isOnboardingCompleted } from "@/lib/onboarding-tour-state";
import { showToast } from "@/lib/toast";
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
    showToast({
      title: "Bravo, votre espace est configuré ! 🎉",
      description: "Tes cours et outils de révision sont prêts.",
      type: "success",
    });
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

      {/* Header avec logo loreno.app horizontal & bouton profil */}
      <header className="w-full pt-1 pb-1 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="loreno.app"
            width={160}
            height={38}
            className="h-8 sm:h-9 w-auto object-contain"
            priority
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-9 h-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:text-black transition cursor-pointer shadow-2xs"
            aria-label="Profil"
            title="Mon profil et compte"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* SECTION 1 : CRÉER & RÉVISER (ENCADRÉ DANS UNE CARTE COHÉRENTE) */}
      <section className="relative rounded-3xl border border-[#4457f4]/25 bg-gradient-to-b from-[#4457f4]/[0.08] via-[#4457f4]/[0.03] to-transparent p-4 sm:p-5 shadow-xs space-y-3">
        {/* En-tête épuré Créer & Réviser */}
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900">
            Créer &amp; Réviser
          </h2>
        </div>

        {/* Bulle Onboarding if active */}
        {isTourActive && tourStep === "choose_mode" && (
          <div className="relative z-50">
            <OnboardingTourBubble show={true} onDismiss={handleCompleteFinalTour} />
          </div>
        )}

        {/* Grille Flashcards & Quiz examen */}
        <div className={`grid grid-cols-2 gap-2.5 ${isTourActive && tourStep === "choose_mode" ? "relative z-50" : ""}`}>
          {/* TUILE 1 : FLASHCARDS */}
          <button
            onClick={() => onActionClick?.("flashcards")}
            className="p-4 rounded-2xl border border-zinc-200/90 bg-white hover:border-[#4457f4] hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] text-left flex flex-col justify-between gap-3 group cursor-pointer shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4457f4]/10 border border-[#4457f4]/20 flex items-center justify-center text-[#4457f4] shrink-0 group-hover:scale-105 group-hover:bg-[#4457f4] group-hover:text-white transition-all">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-zinc-900 group-hover:text-[#4457f4] transition-colors block">Flashcards</span>
              <span className="text-xs text-zinc-500 block font-medium mt-0.5">Mémorisation 3D</span>
            </div>
          </button>

          {/* TUILE 2 : QUIZ EXAMEN */}
          <button
            onClick={() => onActionClick?.("quiz")}
            className="p-4 rounded-2xl border border-zinc-200/90 bg-white hover:border-[#4457f4] hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] text-left flex flex-col justify-between gap-3 group cursor-pointer shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4457f4]/10 border border-[#4457f4]/20 flex items-center justify-center text-[#4457f4] shrink-0 group-hover:scale-105 group-hover:bg-[#4457f4] group-hover:text-white transition-all">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-zinc-900 group-hover:text-[#4457f4] transition-colors block">Quiz examen</span>
              <span className="text-xs text-zinc-500 block font-medium mt-0.5">Note sur /20</span>
            </div>
          </button>
        </div>

        {/* TUILE 3 : ASSISTANT IA PERSONNEL (FOND VIOLET PLUS FONCÉ HARMONIEUX) */}
        <button
          onClick={() => onActionClick?.("tutor")}
          className="w-full p-4 rounded-2xl border border-[#4457f4] bg-gradient-to-r from-[#2433bb] via-[#3243cc] to-[#4457f4] text-white hover:brightness-105 hover:shadow-md transition-all active:scale-[0.98] text-left flex items-center justify-between shadow-xs group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 truncate">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-white truncate">
                Assistant IA Personnel
              </div>
              <div className="text-xs text-indigo-100/90 truncate mt-0.5 font-medium">Pose toutes tes questions sur tes cours</div>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-white text-[#2433bb] hover:bg-zinc-100 font-bold text-xs shrink-0 ml-2 transition flex items-center gap-1 shadow-xs">
            {isPro ? "Ouvrir" : "PRO"}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </section>

      {/* SECTION 2 : MES COURS (TITRE EN NOIR) */}
      <section className="space-y-2 pt-2 flex-1 flex flex-col min-h-0">
        {/* Bulle d'instruction Étape 4 */}
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

        {/* Bulle d'instruction Étape 5 */}
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

        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
            Mes cours ({notebooks.length})
          </span>
          {isPro && (
            <span className="text-[10px] font-bold text-[#4457f4] bg-[#4457f4]/10 border border-[#4457f4]/30 px-2 py-0.5 rounded-lg">
              ⭐ Illimité
            </span>
          )}
        </div>

        <div className="space-y-2.5 pb-20">
          {notebooks.length === 0 ? (
            <div
              onClick={() => {
                if (onOpenScanModal) onOpenScanModal();
                else router.push("/dashboard/new");
              }}
              className="p-7 text-center text-zinc-500 text-xs border border-dashed border-zinc-300 rounded-2xl space-y-2.5 bg-zinc-50/60 hover:bg-zinc-100/70 hover:border-[#4457f4]/50 transition-all cursor-pointer active:scale-[0.99] group shadow-2xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-800 mx-auto group-hover:scale-110 group-hover:text-[#4457f4] group-hover:border-[#4457f4]/30 transition-all shadow-xs">
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
                className={isTourActive && tourStep === "click_course" && idx === 0 ? "relative z-50 ring-2 ring-[#4457f4] rounded-2xl shadow-xl animate-in zoom-in-95 duration-200" : ""}
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
      </section>

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
