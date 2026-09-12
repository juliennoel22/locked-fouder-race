"use client";

import { Sparkles, Zap, Check, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  retentionScore?: number;
}

export function PaywallModal({
  isOpen,
  onClose,
  retentionScore = 85,
}: PaywallModalProps) {
  if (!isOpen) return null;

  const stripeUrl =
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
    "https://buy.stripe.com/test_aFa9AS0wr0J53iJfdR3VC00";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Glowing badge */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-orange-500/20 blur-3xl pointer-events-none rounded-full" />

        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Offre Fondateur Spéciale Partiels
          </div>
        </div>

        {/* Dynamic Retention Score Header */}
        <div className="text-center mb-5">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Score : <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{retentionScore}%</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Tu viens de mémoriser 5 concepts clés en moins de 2 minutes !
          </p>
        </div>

        {/* Offer Box */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex justify-between items-baseline border-b border-zinc-800/80 pb-3">
            <div>
              <div className="font-bold text-white text-base">Pass Fondateur à Vie</div>
              <div className="text-xs text-amber-400 font-medium">50 premières places uniquement</div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-white">9,99 €</span>
              <span className="text-xs text-zinc-400 line-through ml-1.5">29,99 €</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span><strong>Scans illimités</strong> de cours et polycopiés manuscrits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span><strong>Tuteur d&apos;Examen IA</strong> en mode partiel blanc interactif</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Export instantané Anki &amp; Quizlet</span>
            </div>
          </div>
        </div>

        {/* CTA Button in Thumb Zone */}
        <div className="space-y-3">
          <a
            href={stripeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-zinc-950 font-extrabold text-base shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Zap className="w-5 h-5 fill-current" />
            Débloquer tout mon cours (9,99 €)
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Paiement sécurisé par Stripe • Accès immédiat</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-zinc-500 hover:text-zinc-400 pt-1"
          >
            Continuer avec la version gratuite
          </button>
        </div>
      </div>
    </div>
  );
}
