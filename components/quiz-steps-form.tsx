"use client";

import { LEVEL_OPTIONS, GOAL_OPTIONS, PAIN_OPTIONS } from "@/lib/quiz-data";
import { Info } from "lucide-react";
import { QuizChoiceStep } from "./quiz/quiz-choice-step";
import { QuizNameStep } from "./quiz/quiz-name-step";
import { QuizEmailStep } from "./quiz/quiz-email-step";

interface QuizStepsFormProps {
  step: number;
  level: string;
  setLevel: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  userName: string;
  setUserName: (v: string) => void;
  painPoint: string;
  setPainPoint: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  isSubmittingEmail: boolean;
  isGoogleLoading?: boolean;
  errorMessage: string | null;
  selectOptionAndAdvance: (setter: (v: string) => void, val: string) => void;
  onAdvanceToStep4: () => void;
  onSubmitEmail: (e: React.FormEvent) => void;
  showGoogleLogin?: boolean;
  onGoogleLogin?: () => void;
  otpSent?: boolean;
  otpCode?: string;
  setOtpCode?: (v: string) => void;
  isVerifyingOtp?: boolean;
  onVerifyOtp?: (e: React.FormEvent) => void;
  onResetOtp?: () => void;
}

export function QuizStepsForm({
  step,
  level,
  setLevel,
  goal,
  setGoal,
  userName,
  setUserName,
  painPoint,
  setPainPoint,
  email,
  setEmail,
  isSubmittingEmail,
  isGoogleLoading = false,
  errorMessage,
  selectOptionAndAdvance,
  onAdvanceToStep4,
  onSubmitEmail,
  showGoogleLogin = false,
  onGoogleLogin,
  otpSent = false,
  otpCode = "",
  setOtpCode,
  isVerifyingOtp = false,
  onVerifyOtp,
  onResetOtp,
}: QuizStepsFormProps) {
  return (
    <div className="flex-1 flex flex-col justify-center py-6">
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
          <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === 1 && (
        <QuizChoiceStep
          title="Quel est ton niveau d'études ?"
          options={LEVEL_OPTIONS}
          selectedValue={level}
          onSelect={(val) => selectOptionAndAdvance(setLevel, val)}
        />
      )}

      {step === 2 && (
        <QuizChoiceStep
          title="Quel est ton objectif principal ?"
          options={GOAL_OPTIONS}
          selectedValue={goal}
          onSelect={(val) => selectOptionAndAdvance(setGoal, val)}
        />
      )}

      {step === 3 && (
        <QuizChoiceStep
          title="Quelle est ta plus grande difficulté ?"
          options={PAIN_OPTIONS}
          selectedValue={painPoint}
          onSelect={(val) => selectOptionAndAdvance(setPainPoint, val)}
        />
      )}

      {step === 4 && (
        <QuizNameStep
          userName={userName}
          setUserName={setUserName}
          onAdvance={onAdvanceToStep4}
        />
      )}

      {step === 5 && (
        <QuizEmailStep
          email={email}
          setEmail={setEmail}
          isSubmittingEmail={isSubmittingEmail}
          onSubmitEmail={onSubmitEmail}
          showGoogleLogin={showGoogleLogin}
          isGoogleLoading={isGoogleLoading}
          onGoogleLogin={onGoogleLogin}
          otpSent={otpSent}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          isVerifyingOtp={isVerifyingOtp}
          onVerifyOtp={onVerifyOtp}
          onResetOtp={onResetOtp}
        />
      )}
    </div>
  );
}
