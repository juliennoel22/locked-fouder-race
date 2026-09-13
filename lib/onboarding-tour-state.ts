/**
 * Gestion centralisée de l'onboarding interactif :
 * 1. choose_mode    : Choix du mode sur le Dashboard (Flashcards / Quiz)
 * 2. scan_course    : Scan / Upload du cours dans la ScanModal
 * 3. test_training  : Premier entraînement (Flashcards ou Quiz)
 * 4. inspect_course : Vue détaillée du cours généré
 * 5. import_new     : Découverte de l'import d'un nouveau cours sur le Dashboard
 * 6. completed      : Onboarding finalisé
 */

export type TourStep =
  | "choose_mode"
  | "scan_course"
  | "test_training"
  | "click_course"
  | "inspect_course"
  | "import_new"
  | "completed";

export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("loreno_tour_completed") === "true";
}

export function getTourStep(): TourStep {
  if (typeof window === "undefined") return "completed";
  if (isOnboardingCompleted()) return "completed";
  const step = localStorage.getItem("loreno_tour_step") as TourStep | null;
  return step || "choose_mode";
}

export function setTourStep(step: TourStep): void {
  if (typeof window === "undefined") return;
  if (step === "completed") {
    localStorage.setItem("loreno_tour_completed", "true");
  }
  localStorage.setItem("loreno_tour_step", step);
}

export function completeOnboardingTour(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("loreno_tour_completed", "true");
  localStorage.setItem("loreno_tour_step", "completed");
}

export function resetOnboardingTour(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("loreno_tour_completed");
  localStorage.removeItem("loreno_tour_step");
}

