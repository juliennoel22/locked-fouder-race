"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { QuizStepsForm } from "@/components/quiz-steps-form";
import { useQuizOnboarding } from "@/components/quiz/use-quiz-onboarding";

export default function QuizPage() {
  const {
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
    isGoogleLoading,
    errorMessage,
    showGoogleLogin,
    otpSent,
    otpCode,
    setOtpCode,
    isVerifyingOtp,
    handleBack,
    selectOptionAndAdvance,
    handleAdvanceToStep4,
    handleGoogleLogin,
    handleSubmitEmail,
    handleVerifyOtp,
    resetOtp,
  } = useQuizOnboarding();

  return (
    <main className="min-h-[100dvh] w-full bg-[#F8F9FA] text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-[#F8F9FA] text-black selection:bg-black selection:text-white">
        {/* Top Header */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between h-9 mb-3">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 text-zinc-400 hover:text-black transition cursor-pointer"
                aria-label="Étape précédente"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}
            <Image
              src="/logo.png"
              alt="loreno.app"
              width={160}
              height={40}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
            <span className="text-xs font-mono text-zinc-400">
              {step} / 5
            </span>
          </div>

          <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden border border-zinc-200">
            <div
              className="bg-black h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content Area */}
        <QuizStepsForm
          step={step}
          level={level}
          setLevel={setLevel}
          goal={goal}
          setGoal={setGoal}
          userName={userName}
          setUserName={setUserName}
          painPoint={painPoint}
          setPainPoint={setPainPoint}
          email={email}
          setEmail={setEmail}
          isSubmittingEmail={isSubmittingEmail}
          isGoogleLoading={isGoogleLoading}
          errorMessage={errorMessage}
          selectOptionAndAdvance={selectOptionAndAdvance}
          onAdvanceToStep4={handleAdvanceToStep4}
          onSubmitEmail={handleSubmitEmail}
          showGoogleLogin={showGoogleLogin}
          onGoogleLogin={handleGoogleLogin}
          otpSent={otpSent}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          isVerifyingOtp={isVerifyingOtp}
          onVerifyOtp={handleVerifyOtp}
          onResetOtp={resetOtp}
        />
      </div>
    </main>
  );
}
