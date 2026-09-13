"use client";

import { useToast } from "@/lib/toast";
import { X, CheckCircle2, Info, AlertCircle } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 max-w-md mx-auto px-4 pointer-events-none flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto w-full p-3.5 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-white shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-center gap-3 truncate">
            {toast.icon ? (
              <span className="text-lg shrink-0">{toast.icon}</span>
            ) : toast.type === "error" ? (
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#4457f4]/20 text-[#4457f4] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            <div className="truncate text-left">
              <div className="text-xs font-bold text-white truncate">{toast.title}</div>
              {toast.description && (
                <div className="text-[11px] text-zinc-400 truncate mt-0.5">{toast.description}</div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
