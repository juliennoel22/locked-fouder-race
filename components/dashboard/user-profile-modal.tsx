"use client";

import { X, LogOut, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  isPro?: boolean;
  notebooksCount: number;
  onOpenPaywall: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  userEmail,
  isPro = false,
  notebooksCount,
  onOpenPaywall,
}: UserProfileModalProps) {
  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.removeItem("loreno_user_email");
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("Erreur déconnexion :", err);
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-5 text-black">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black text-xs font-bold">
              👤
            </div>
            <h2 className="text-base font-bold text-black">Mon compte</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 transition flex items-center justify-center text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email & Statut */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Adresse email
            </span>
            <p className="text-sm font-semibold text-black truncate">
              {userEmail || "Connecté avec succès"}
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Statut de compte</span>
            {isPro ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black text-white">
                <Sparkles className="w-3 h-3 text-amber-400" /> Premium à vie
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-200 text-zinc-800">
                Compte Gratuit
              </span>
            )}
          </div>
        </div>

        {/* Statistiques sauvegardées */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-lg font-bold text-black">{notebooksCount}</div>
            <div className="text-[11px] text-zinc-500 flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3" /> Cours
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-lg font-bold text-black">{isPro ? "∞" : "2"}</div>
            <div className="text-[11px] text-zinc-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Limite scans
            </div>
          </div>
        </div>

        {!isPro && (
          <button
            onClick={() => {
              onClose();
              onOpenPaywall();
            }}
            className="w-full h-11 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Passer Premium (9,99 € à vie)</span>
          </button>
        )}

        {/* Bouton de test / bascule Free vs PRO */}
        <button
          type="button"
          onClick={() => {
            const nextProState = !isPro;
            localStorage.setItem("loreno_pro", nextProState ? "true" : "false");
            window.location.href = nextProState ? "/dashboard?pro=true" : "/dashboard?free=true";
          }}
          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50 text-[11px] font-semibold text-zinc-600 hover:text-black transition flex items-center justify-between cursor-pointer"
        >
          <span>🧪 Mode de test :</span>
          <span className="font-bold underline text-black">
            {isPro ? "Bascule en Gratuit (2 cours max)" : "Bascule en PRO (Illimité)"}
          </span>
        </button>

        {/* Bouton déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full h-10 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-red-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
