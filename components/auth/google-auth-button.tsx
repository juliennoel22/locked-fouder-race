"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";

interface GoogleAuthButtonProps {
  isLoading: boolean;
  onClick: () => void;
  text?: string;
}

export function GoogleAuthButton({
  isLoading,
  onClick,
  text = "Continuer avec Google",
}: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full h-12 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold text-sm flex items-center justify-center gap-3 transition active:scale-[0.98] shadow-xs cursor-pointer disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      ) : (
        <>
          <Image
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={18}
            height={18}
            className="w-[18px] h-[18px]"
          />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
