"use client";

interface OnboardingTourBubbleProps {
  show?: boolean;
  onDismiss?: () => void;
  stepNumber?: number;
  totalSteps?: number;
  badgeText?: string;
  title?: string;
  description?: string;
  arrowDirection?: "down" | "up" | "none";
  actionLabel?: string;
  onAction?: () => void;
  showDismiss?: boolean;
}

export function OnboardingTourBubble(_props: OnboardingTourBubbleProps) {
  return null;
}
