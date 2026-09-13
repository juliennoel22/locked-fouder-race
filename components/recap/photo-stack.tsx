"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

interface PhotoItem {
  id: number;
  src: string;
  title: string;
  tag: string;
}

const REAL_PHOTOS: PhotoItem[] = [
  { id: 1, src: "/recap/founder-live.png", title: "Live Paddock avec le Jury", tag: "Sprint 24H" },
  { id: 2, src: "/recap/IMG_0416.png", title: "Setup Dev & Code Commando", tag: "Julien" },
  { id: 3, src: "/recap/IMG_0420.png", title: "Acquisition Terrain à Nancy", tag: "Micro-Trottoir" },
  { id: 4, src: "/recap/IMG_0426.jpg", title: "59,94 € Encaissés sur Stripe", tag: "Traction" },
];

export function PhotoStack() {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % REAL_PHOTOS.length);
  };

  return (
    <div className="w-full flex flex-col items-center py-2">
      <div 
        onClick={handleNext}
        className="relative w-full max-w-sm h-64 sm:h-72 flex items-center justify-center cursor-pointer select-none group"
      >
        {REAL_PHOTOS.map((photo, idx) => {
          const isTop = idx === activeIdx;
          const zIndex = isTop ? 30 : 20 - ((idx - activeIdx + REAL_PHOTOS.length) % REAL_PHOTOS.length);
          const rotation = idx % 2 === 0 ? "rotate-[-3deg]" : "rotate-[2.5deg]";
          const offset = idx === activeIdx ? "scale-100" : "scale-95 translate-y-1";

          return (
            <div
              key={photo.id}
              style={{ zIndex }}
              className={`absolute inset-x-2 top-1 bottom-1 rounded-2xl border border-zinc-300 bg-white p-2.5 shadow-xl transition-all duration-300 flex flex-col justify-between ${rotation} ${offset} group-hover:rotate-0`}
            >
              <div className="relative w-full flex-1 rounded-xl bg-zinc-950 overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="flex items-center justify-between pt-2 px-1">
                <span className="text-xs font-bold text-black truncate max-w-[200px]">{photo.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800">
                  {photo.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-zinc-500 mt-2 font-medium flex items-center gap-1.5">
        <span>Paquet photo interactif • Tape pour faire défiler ({activeIdx + 1}/{REAL_PHOTOS.length})</span>
        <ArrowRight className="w-3 h-3 text-zinc-400" />
      </p>
    </div>
  );
}
