"use client";

import { X, LogOut, ShieldCheck, Zap, BookOpen, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DeleteAccountModal } from "@/components/delete-account-modal";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  isPro?: boolean;
  isReferralTrial?: boolean;
  proUntil?: string | null;
  notebooksCount: number;
  onOpenPaywall: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  userEmail,
  isPro = false,
  isReferralTrial = false,
  proUntil,
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
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 transition flex items-center justify-center text-zinc-600 cursor-pointer"
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
            <span className="text-xs text-zinc-500">Statut du compte</span>
            {isReferralTrial ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                🎁 3 jours Pro offerts
              </span>
            ) : isPro ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4457f4] text-white shadow-2xs">
                <Crown className="w-3 h-3 text-amber-300" /> Premium Illimité
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-200 text-zinc-800">
                Compte Gratuit
              </span>
            )}
          </div>
        </div>

        {/* Banner 3 Jours Pro Parrainage */}
        {isReferralTrial && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              <span>3 jours Pro offerts par ton parrain !</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-tight">
              Scans et flashcards illimités actifs. Débloque Loreno Pro à tout moment.
            </p>
          </div>
        )}

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

        {/* Bouton de conversion pour compte Gratuit OU Essai Parrainage */}
        {(!isPro || isReferralTrial) && (
          <button
            onClick={() => {
              onClose();
              onOpenPaywall();
            }}
            className="w-full h-11 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Passer à Loreno Pro (9,99 €/mois)</span>
          </button>
        )}

        {/* Bouton déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full h-10 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-red-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Se déconnecter</span>
        </button>

        {/* Option RGPD Suppression du compte */}
        <div className="pt-2 border-t border-zinc-100">
          <DeleteAccountModal />
        </div>
      </div>
    </div>
  );
}
