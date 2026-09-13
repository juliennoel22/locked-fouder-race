"use client";

import Image from "next/image";
import { CheckCircle2, Maximize2 } from "lucide-react";

interface RecapChartsProps {
  onPhotoClick: (src: string, alt: string) => void;
}

export function RecapCharts({ onPhotoClick }: RecapChartsProps) {
  return (
    <div className="space-y-4">
      {/* 1. Preuve Dashboard Stripe */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-600 px-0.5">
          <span className="font-bold flex items-center gap-1.5 text-zinc-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Capture Certifiée Dashboard Stripe (59,94 €)
          </span>
          <span className="text-[10px] text-zinc-400">Clique pour agrandir</span>
        </div>

        <div
          onClick={() => onPhotoClick("/recap/IMG_0426.jpg", "Capture Certifiée Stripe Live Dashboard (59,94 €)")}
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
            <span>Plein écran</span>
          </div>
        </div>
      </div>

      {/* 2. Preuve Vercel Web Analytics */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-600 px-0.5">
          <span className="font-bold flex items-center gap-1.5 text-zinc-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Capture Certifiée Vercel Web Analytics
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
            <span>Plein écran</span>
          </div>
        </div>
      </div>
    </div>
  );
}
