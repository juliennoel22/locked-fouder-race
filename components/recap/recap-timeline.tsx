"use client";

import Image from "next/image";
import { ZoomIn } from "lucide-react";

export interface TimelineStep {
  time: string;
  title: string;
  description: string;
  highlight?: boolean;
  layout?: "vertical-grid" | "vertical-single" | "default";
  images?: Array<{ src: string; alt: string }>;
}

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    time: "09:00",
    title: "Setup Dev & Code Commando",
    description: "Démarrage du dev du MVP mobile-first : Next.js 15, compression Canvas côté client et intégration Gemini Vision.",
    images: [{ src: "/recap/IMG_0416.png", alt: "Poste de dev" }],
  },
  {
    time: "12:00",
    title: "Story Instagram & Diffusion Discord",
    description: "Publication de la story @baptiste__fry et partage dans plusieurs groupes Discord étudiants.",
    images: [
      { src: "/recap/IMG_0424.png", alt: "Story Instagram" },
      { src: "/recap/discord-share.png", alt: "Partage dans les groupes Discord" },
    ],
  },
  {
    time: "12:00 - 18:00",
    title: "Acquisition Terrain à Nancy & TikTok",
    description: "Micro-trottoirs avec les étudiants dans la ville pour tester le scan en direct et publication des vidéos.",
    layout: "vertical-grid",
    images: [
      { src: "/recap/IMG_0417.png", alt: "Interview étudiant 1" },
      { src: "/recap/IMG_0418.png", alt: "Interview étudiant 2" },
      { src: "/recap/IMG_0419.png", alt: "Interview étudiant 3" },
      { src: "/recap/IMG_0420.png", alt: "Interview groupe étudiants" },
    ],
  },
  {
    time: "16:00",
    title: "Point en Direct avec le Jury FounderRace",
    description: "Live paddock avec les organisateurs pour présenter l'avancée du produit et les premières réactions étudiants.",
    images: [{ src: "/recap/founder-live.png", alt: "Live Paddock FounderRace" }],
  },
  {
    time: "18:00 - 21:00",
    title: "Montage, Dev Continu & Encaissement Stripe",
    description: "Montage des Reels d'acquisition, déploiement des fonctionnalités et 59,94 € encaissés en direct.",
    highlight: true,
    images: [
      { src: "/recap/IMG_0425.jpg", alt: "Montage vidéo Premiere Pro" },
      { src: "/recap/IMG_0426.jpg", alt: "Dashboard Stripe Live 59,94 €" },
      { src: "/recap/IMG_0427.jpg", alt: "Vercel Analytics" },
    ],
  },
  {
    time: "21:00 - 02:00",
    title: "Guerilla Marketing Nocturne, Tournage Pitch & QR Codes",
    description: "Session code, affichage de QR codes dans les rues de Nancy et dans les bus, tournage du pitch avec les étudiants.",
    highlight: true,
    layout: "vertical-grid",
    images: [
      { src: "/recap/IMG_0436.jpg", alt: "Session code" },
      { src: "/recap/IMG_0445.png", alt: "Photo nocturne" },
      { src: "/recap/IMG_0446.png", alt: "Affichage des QR codes" },
      { src: "/recap/IMG_0447.png", alt: "Rencontre étudiants dans la rue" },
      { src: "/recap/IMG_0448.png", alt: "Tournage & échanges terrain" },
    ],
  },
  {
    time: "02:00 - 05:00",
    title: "Sprint Final : Dev au Sol, Montage du Pitch & Récap (4h47)",
    description: "Retour après le tournage : session de dev intense, finalisation des dernières fonctionnalités, montage de la vidéo de pitch et packaging de la page récapitulatif jury au sol à 4h47.",
    highlight: true,
    layout: "vertical-single",
    images: [
      { src: "/recap/IMG_0450.jpg", alt: "Julien à 4h47 au sol sur son PC" },
    ],
  },
];

interface RecapTimelineProps {
  onPhotoClick?: (src: string, alt: string) => void;
}

export function RecapTimeline({ onPhotoClick }: RecapTimelineProps) {
  return (
    <div className="space-y-4">
      {TIMELINE_STEPS.map((step, idx) => {
        const isVerticalGrid = step.layout === "vertical-grid";
        const isVerticalSingle = step.layout === "vertical-single";

        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all ${
              step.highlight
                ? "bg-zinc-950 text-white border-zinc-800 shadow-md"
                : "bg-white text-zinc-900 border-zinc-200 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold opacity-75">{step.time}</span>
              <h4 className="text-xs font-bold leading-snug">{step.title}</h4>
            </div>

            <p
              className={`text-[11px] leading-relaxed mt-2 ${
                step.highlight ? "text-zinc-300" : "text-zinc-600"
              }`}
            >
              {step.description}
            </p>

            {/* Photos associées : Grille verticale, photo portrait ou photo landscape pleine largeur */}
            {step.images && step.images.length > 0 && (
              <div
                className={`mt-3 ${
                  isVerticalGrid
                    ? "grid grid-cols-2 gap-2"
                    : "flex flex-col gap-3"
                }`}
              >
                {step.images.map((img, iIdx) => (
                  <div
                    key={iIdx}
                    onClick={() => onPhotoClick?.(img.src, img.alt)}
                    className={`relative w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200/20 group shadow-xs cursor-pointer ${
                      isVerticalGrid
                        ? "aspect-[3/4]"
                        : isVerticalSingle
                        ? "aspect-[3/4] max-w-xs mx-auto"
                        : "aspect-video w-full"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs shadow-md">
                        <ZoomIn className="w-3 h-3" />
                        <span>Agrandir</span>
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-white font-medium truncate backdrop-blur-xs text-center">
                      {img.alt}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
