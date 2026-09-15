"use client";

import { useState, useEffect } from "react";
import { Check, ArrowRight, ShieldCheck, X, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  retentionScore?: number;
}

export function PaywallModal({
  isOpen,
  onClose,
  retentionScore,
}: PaywallModalProps) {
  const [stripeUrl, setStripeUrl] = useState<string>(
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
      "https://buy.stripe.com/aFa00idmx0iL8aV4gyds401"
  );

  useEffect(() => {
    if (!isOpen) return;

    const buildStripeLink = async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
        "https://buy.stripe.com/aFa00idmx0iL8aV4gyds401";

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const urlObj = new URL(baseUrl);
          urlObj.searchParams.set("client_reference_id", user.id);
          if (user.email) {
            urlObj.searchParams.set("prefilled_email", user.email);
          }
          setStripeUrl(urlObj.toString());
        }
      } catch (e) {
        console.warn("Could not build personalized Stripe payment link", e);
      }
    };

    buildStripeLink();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge optionnel (affiché uniquement après une session d'entraînement réelle) */}
        {typeof retentionScore === "number" && (
          <div className="flex justify-start mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Score de rétention : {retentionScore}%</span>
            </div>
          </div>
        )}

        {/* Header épuré */}
        <div className="text-left mb-5 space-y-1.5">
          <h2 className="text-2xl font-bold text-black tracking-tight">
            Débloque l&apos;intégralité de tes cours
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600">
            Accède à toutes les fiches, aux questions pièges des partiels et au tuteur IA.
          </p>
        </div>

        {/* Offer Box */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex justify-between items-baseline border-b border-zinc-200 pb-3">
            <div>
              <div className="font-bold text-black text-base">Pack Premium</div>
              <div className="text-xs text-zinc-500">Accès à vie • Réservé aux 50 premiers</div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-black">9,99 €</span>
              <span className="text-xs text-zinc-400 line-through ml-1.5">39,99 €</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span><strong>Scans &amp; Flashcards illimités</strong> sur tous tes cours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span><strong>Détection des questions pièges</strong> d&apos;examen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span><strong>Tuteur IA d&apos;examen</strong> sur tes notes</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-3">
          <a
            href={stripeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 h-13 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#4457f4] via-violet-600 to-indigo-700 hover:brightness-105 text-white font-bold text-sm transition active:scale-[0.99] shadow-lg shadow-[#4457f4]/25"
          >
            <span>Obtenir le Pack Premium (9,99 €)</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </a>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
            <span>Paiement unique sécurisé Stripe • Sans abonnement</span>
          </div>
        </div>
      </div>
    </div>
  );
}
