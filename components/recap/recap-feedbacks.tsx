"use client";

import Image from "next/image";
import { Maximize2 } from "lucide-react";

interface RecapFeedbacksProps {
  onPhotoClick: (src: string, alt: string) => void;
}

const PROOF_CARDS = [
  {
    src: "/recap/temoignage-3-achat.jpg",
    alt: "Preuve d'achat direct - J'ai acheté ton appli",
    title: "Achat Confirmé",
    subtitle: "« J'ai acheté ton appli 😘 »",
  },
  {
    src: "/recap/temoignage-2.jpg",
    alt: "Retour vocal et message - Trop stylé l'application",
    title: "Retour Vocal Étudiant",
    subtitle: "« Premier degré trop stylé »",
  },
  {
    src: "/recap/temoignage-4.jpg",
    alt: "Retour utilisateur - Ptn ça tue ton truc",
    title: "Validation Produit",
    subtitle: "« Ptn ça tue ton truc »",
  },
  {
    src: "/recap/temoignage-1.jpg",
    alt: "Retour communauté - Les boss",
    title: "Réaction Story",
    subtitle: "« Les boss ❤️ »",
  },
];

export function RecapFeedbacks({ onPhotoClick }: RecapFeedbacksProps) {
  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-bold text-zinc-900">
          Retours &amp; Messages des Utilisateurs
        </span>
        <span className="text-[10px] text-zinc-400 font-medium">Clique pour agrandir</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PROOF_CARDS.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onPhotoClick(card.src, card.alt)}
            className="rounded-2xl border border-zinc-200 bg-zinc-950 p-2 group cursor-pointer shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-[#4457f4] transition-all duration-200"
          >
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <Image
                src={card.src}
                alt={card.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/80 text-white text-[8px] font-bold flex items-center gap-0.5">
                <Maximize2 className="w-2.5 h-2.5" />
                <span>Zoom</span>
              </div>
            </div>

            <div className="pt-2 px-1">
              <span className="text-[11px] font-bold text-zinc-100 block truncate">
                {card.title}
              </span>
              <span className="text-[10px] text-zinc-400 block truncate">
                {card.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
