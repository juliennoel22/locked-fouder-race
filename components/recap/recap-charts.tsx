"use client";

import Image from "next/image";
import { CreditCard, Eye, Maximize2, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

interface RecapChartsProps {
  onPhotoClick: (src: string, alt: string) => void;
}

const STRIPE_TIMELINE = [
  { time: "14h20", amount: "9,99 €", total: "9,99 €", desc: "Vente #1 (Fac de Droit)", pct: 17 },
  { time: "15h15", amount: "9,99 €", total: "19,98 €", desc: "Vente #2 (Stanislas)", pct: 33 },
  { time: "16h05", amount: "9,99 €", total: "29,97 €", desc: "Vente #3 (PASS Médecine)", pct: 50 },
  { time: "17h30", amount: "9,99 €", total: "39,96 €", desc: "Vente #4 (TikTok)", pct: 67 },
  { time: "18h45", amount: "9,99 €", total: "49,95 €", desc: "Vente #5 (Discord)", pct: 83 },
  { time: "20h20", amount: "9,99 €", total: "59,94 €", desc: "Vente #6 (Instagram)", pct: 100 },
];

export function RecapCharts({ onPhotoClick }: RecapChartsProps) {
  return (
    <div className="space-y-5">
      {/* 1. Bloc Stripe & Preuve Intégrale Non Recadrée */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
        {/* En-tête Stripe */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-black flex items-center gap-1.5">
                <span>Courbe & Dashboard Stripe Live</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[11px] text-zinc-500">6 transactions • 59,94 € net encaissé</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg sm:text-xl font-black text-emerald-600">59,94 €</span>
            <span className="text-[10px] text-emerald-700 block font-semibold">100% payé</span>
          </div>
        </div>

        {/* Graphique de progression chronologique */}
        <div className="space-y-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              Progression des Ventes (Sprint 24H)
            </span>
            <span className="text-emerald-700 font-bold">Plafond : 59,94 €</span>
          </div>

          <div className="h-20 w-full flex items-end gap-2 pt-2 pb-1">
            {STRIPE_TIMELINE.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <span className="text-[8px] sm:text-[9px] font-bold text-emerald-700">
                  {item.total}
                </span>
                <div
                  style={{ height: `${item.pct}%` }}
                  className="w-full rounded-t-sm bg-linear-to-t from-emerald-600 to-emerald-400 group-hover:brightness-110 transition shadow-2xs"
                />
                <span className="text-[8px] text-zinc-400 font-mono mt-0.5">
                  {item.time}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-zinc-200/60 text-center">
            <div>
              <span className="text-[9px] text-zinc-400 block">Panier</span>
              <span className="text-[11px] font-bold text-black">9,99 €</span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 block">Conversion</span>
              <span className="text-[11px] font-bold text-emerald-600">5.7 %</span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 block">Litiges</span>
              <span className="text-[11px] font-bold text-black">0</span>
            </div>
          </div>
        </div>

        {/* Preuve Dashboard Stripe SANS AUCUN RECADRAGE */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-600 px-0.5">
            <span className="font-bold flex items-center gap-1.5 text-zinc-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Capture Complète du Dashboard Stripe
            </span>
            <span className="text-[10px] text-zinc-400">Clique pour agrandir</span>
          </div>

          <div
            onClick={() => onPhotoClick("/recap/IMG_0426.jpg", "Capture Certifiée Stripe Live Dashboard")}
            className="w-full rounded-xl overflow-hidden border border-zinc-200 bg-black group cursor-pointer shadow-sm relative"
          >
            <Image
              src="/recap/IMG_0426.jpg"
              alt="Dashboard Stripe Live 59,94 €"
              width={1200}
              height={800}
              className="w-full h-auto object-contain block group-hover:opacity-95 transition"
              priority
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-bold shadow-md">
              <Maximize2 className="w-3 h-3" />
              <span>Voir en plein écran</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bloc Trafic Web Analytics & Preuve Intégrale Non Recadrée */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
        {/* En-tête Trafic */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-black flex items-center gap-1.5">
                <span>Trafic Web & Visiteurs Uniques</span>
              </h3>
              <p className="text-[11px] text-zinc-500">104 visiteurs • 316 pages vues • 22 comptes</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg sm:text-xl font-black text-blue-600">104</span>
            <span className="text-[10px] text-zinc-500 block font-medium">uniques</span>
          </div>
        </div>

        {/* 3 Cartes de métriques */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
            <div className="text-sm font-black text-black">104</div>
            <div className="text-[10px] text-zinc-500">Visiteurs</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
            <div className="text-sm font-black text-black">316</div>
            <div className="text-[10px] text-zinc-500">Pages vues</div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <div className="text-sm font-black text-purple-900">22</div>
            <div className="text-[10px] text-purple-700">Inscrits</div>
          </div>
        </div>

        {/* Preuve Vercel Web Analytics SANS AUCUN RECADRAGE */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-600 px-0.5">
            <span className="font-bold flex items-center gap-1.5 text-zinc-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Capture Complète Vercel Web Analytics
            </span>
            <span className="text-[10px] text-zinc-400">Clique pour agrandir</span>
          </div>

          <div
            onClick={() => onPhotoClick("/recap/IMG_0427.jpg", "Capture Certifiée Vercel Web Analytics")}
            className="w-full rounded-xl overflow-hidden border border-zinc-200 bg-black group cursor-pointer shadow-sm relative"
          >
            <Image
              src="/recap/IMG_0427.jpg"
              alt="Vercel Web Analytics 104 visiteurs"
              width={1200}
              height={800}
              className="w-full h-auto object-contain block group-hover:opacity-95 transition"
              priority
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-bold shadow-md">
              <Maximize2 className="w-3 h-3" />
              <span>Voir en plein écran</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
