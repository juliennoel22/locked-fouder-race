"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Crown, User } from "lucide-react";
import { useProStatus } from "@/lib/use-pro-status";

interface HeaderProps {
  title?: string;
  backHref?: string;
  onBack?: () => void;
  showProfile?: boolean;
  onOpenProfile?: () => void;
  onOpenPaywall?: () => void;
  onOpenReferral?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({
  title,
  backHref,
  onBack,
  showProfile = false,
  onOpenProfile,
  onOpenPaywall,
  onOpenReferral,
  rightElement,
}: HeaderProps) {
  const { isPro } = useProStatus();

  return (
    <header className="w-full pt-2 pb-2 flex items-center justify-between min-h-12 select-none border-b border-zinc-100 mb-2">
      {/* Côté Gauche : Retour ou Logo */}
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition p-1 -ml-1 cursor-pointer"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{title ? "Retour" : "Mes cours"}</span>
          </button>
        ) : backHref ? (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition p-1 -ml-1 cursor-pointer"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{title ? "Retour" : "Mes cours"}</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="loreno.app"
              width={140}
              height={34}
              className="h-7 sm:h-8 w-auto object-contain"
              priority
            />
          </Link>
        )}

        {title && !onBack && !backHref && (
          <span className="text-xs font-bold text-black uppercase tracking-wider ml-1">
            {title}
          </span>
        )}
      </div>

      {/* Côté Droit : Pastille PRO, Éléments personnalisés & Profil */}
      <div className="flex items-center gap-2">
        {rightElement}

        {onOpenReferral && (
          <button
            type="button"
            onClick={onOpenReferral}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
            title="Affiliation & Parrainage : Gagne des jours Pro et du Cash"
          >
            <span>🎁</span>
            <span className="hidden sm:inline">Affiliation</span>
          </button>
        )}

        {/* Pastille PRO dorée permanente si abonné, sinon bouton PRO */}
        {isPro ? (
          <div
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 shadow-xs border border-amber-400/60 animate-in fade-in"
            title="Membre Loreno PRO à vie"
          >
            <Crown className="w-3 h-3 fill-amber-950 text-amber-950" />
            <span>PRO</span>
          </div>
        ) : (
          onOpenPaywall && (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black text-white hover:bg-zinc-800 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              PRO
            </button>
          )
        )}

        {showProfile && onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:text-black hover:border-zinc-300 transition cursor-pointer shadow-2xs"
            aria-label="Mon profil"
            title="Mon profil et compte"
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
