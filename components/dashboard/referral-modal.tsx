"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2, Wallet, Users, Gift, ArrowRight, ShieldCheck, X, Loader2 } from "lucide-react";
import { ReferralData } from "@/types/loreno";
import { showToast } from "@/lib/toast";

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [iban, setIban] = useState<string>("");
  const [submittingPayout, setSubmittingPayout] = useState<boolean>(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadReferralData() {
      try {
        setLoading(true);
        const res = await fetch("/api/referral");
        const json = await res.json();
        if (json.success && json.data) {
          setReferralData(json.data);
          if (json.data.iban) {
            setIban(json.data.iban);
          }
        }
      } catch (err) {
        console.error("Erreur chargement affiliation :", err);
      } finally {
        setLoading(false);
      }
    }

    loadReferralData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!referralData?.referral_link) return;
    navigator.clipboard.writeText(referralData.referral_link);
    setCopied(true);
    showToast({
      title: "Lien copié ! 📋",
      description: "Envoie ce lien à tes potes pour débloquer le Pack Pro.",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!referralData?.referral_link) return;
    const text = encodeURIComponent(
      `Rejoins-moi sur Loreno ! Révise tes cours en 2 minutes avec des fiches et des quiz personnalisés : ${referralData.referral_link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iban || iban.trim().length < 10) {
      showToast({
        title: "IBAN invalide",
        description: "Veuillez entrer un numéro IBAN valide pour le virement.",
        type: "error",
      });
      return;
    }

    setSubmittingPayout(true);
    try {
      const res = await fetch("/api/referral/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iban }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de la demande de virement");
      }

      setPayoutSuccessMsg(json.message);
      setReferralData((prev) => prev ? { ...prev, balance_cents: 0 } : null);
      showToast({
        title: "Virement demandé !",
        description: json.message,
        type: "success",
      });
    } catch (err) {
      showToast({
        title: "Erreur de virement",
        description: err instanceof Error ? err.message : "Impossible de soumettre la demande.",
        type: "error",
      });
    } finally {
      setSubmittingPayout(false);
    }
  };

  const balanceEuro = referralData ? (referralData.balance_cents / 100).toFixed(2) : "0,00";
  const invitedCount = referralData?.invited_count || 0;
  const progressToNextReward = (invitedCount % 5) * 20; // % pour 5 potes
  const isPayoutEligible = (referralData?.balance_cents || 0) >= 7000;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white border border-zinc-200 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modale */}
        <div className="text-left mb-5 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Gift className="w-3.5 h-3.5 text-emerald-600" />
            <span>Give &amp; Get + Cash Affiliation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight pt-1">
            Invite tes potes &amp; Gagne du Cash
          </h2>
          <p className="text-xs text-zinc-600">
            Offre 3 jours Pro à tes potes et accumule des commissions cash retirables par virement.
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            <p className="text-xs text-zinc-500 font-medium">Chargement de ton espace affiliation...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Carte 1: Progression Give & Get (3 Jours Pro) */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-black" />
                  <span className="text-xs font-bold text-black">Progression Parrainage</span>
                </div>
                <span className="text-xs font-bold text-zinc-700">{invitedCount % 5} / 5 potes</span>
              </div>

              <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-300"
                  style={{ width: `${progressToNextReward}%` }}
                />
              </div>

              <p className="text-[11px] text-zinc-500">
                {5 - (invitedCount % 5)} ami(s) de plus pour débloquer <strong className="font-bold text-black">3 jours Pro offerts</strong>.
              </p>
            </div>

            {/* Carte 2: Solde Cash Commisssion & Virement 70€ */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-300">Solde Cash Accumulé</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  20% de commission / vente
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {balanceEuro} €
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Seuil minimum pour virement : <strong className="font-semibold text-zinc-300">70,00 €</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">Total gagné</div>
                  <div className="text-sm font-bold text-emerald-400">
                    {((referralData?.total_earned_cents || 0) / 100).toFixed(2)} €
                  </div>
                </div>
              </div>

              {/* Formulaire Virement Bancaire si éligible (Solde >= 70€) */}
              {isPayoutEligible ? (
                <form onSubmit={handlePayoutSubmit} className="pt-2 border-t border-zinc-800 space-y-2">
                  <label className="block text-[11px] text-zinc-300 font-medium">
                    Saisis ton IBAN pour recevoir le virement :
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="FR76 1234 5678 9012 3456 7890 123"
                      className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingPayout}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition active:scale-95 shrink-0 cursor-pointer"
                    >
                      {submittingPayout ? "..." : "Virer"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Demande de virement bancaire</span>
                  <span className="font-semibold text-zinc-400">Disponible dès 70,00 €</span>
                </div>
              )}

              {payoutSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                  {payoutSuccessMsg}
                </div>
              )}
            </div>

            {/* Carte 3: Partage du Lien Personnalisé */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-black text-left">
                Ton lien d&apos;affiliation personnel :
              </label>

              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-100 border border-zinc-200">
                <input
                  type="text"
                  readOnly
                  value={referralData?.referral_link || ""}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-black font-mono select-all focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copié" : "Copier"}</span>
                </button>
              </div>

              {/* Boutons Réseaux / Partage Direct */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Partager sur WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-900 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Envoyer un message</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
              <span>Loreno Affiliation • Paiements &amp; Virements sécurisés</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
