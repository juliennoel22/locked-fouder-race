"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Crown, User } from "lucide-react";
import { useProStatus } from "@/lib/use-pro-status";
import { Button } from "@/components/ui/button";

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
    <header className="w-full pt-1 pb-2 flex items-center justify-between min-h-12 select-none border-b border-border/60 mb-2">
      {/* Côté Gauche : Retour ou Logo */}
      <div className="flex items-center gap-2">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground font-semibold"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{title ? "Retour" : "Mes cours"}</span>
          </Button>
        ) : backHref ? (
          <Button
            variant="ghost"
            size="sm"
            render={<Link href={backHref} />}
            className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground font-semibold"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{title ? "Retour" : "Mes cours"}</span>
          </Button>
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
          <span className="text-xs font-bold text-foreground uppercase tracking-wider ml-1">
            {title}
          </span>
        )}
      </div>

      {/* Côté Droit : Pastille PRO, Éléments personnalisés & Profil */}
      <div className="flex items-center gap-1.5">
        {rightElement}

        {onOpenReferral && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onOpenReferral}
            className="gap-1 font-bold bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            title="Affiliation & Parrainage : Gagne des jours Pro et du Cash"
          >
            <span>🎁</span>
            <span className="hidden sm:inline">Affiliation</span>
          </Button>
        )}

        {/* Pastille PRO dorée élégante */}
        {isPro ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 via-amber-500/15 to-yellow-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold text-xs shadow-[0_1px_6px_rgba(245,158,11,0.15)] select-none"
            title="Membre Loreno PRO"
          >
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="tracking-wide">PRO</span>
          </div>
        ) : (
          onOpenPaywall && (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-[0_2px_8px_rgba(245,158,11,0.35)] active:scale-95 transition-all cursor-pointer"
            >
              <Crown className="w-3 h-3 fill-white text-white" />
              <span>PRO</span>
            </button>
          )
        )}

        {showProfile && onOpenProfile && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onOpenProfile}
            className="rounded-full"
            aria-label="Mon profil"
            title="Mon profil et compte"
          >
            <User className="w-4 h-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
