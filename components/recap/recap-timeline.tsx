"use client";

import Image from "next/image";
import { DollarSign, Rocket, Zap, MessageSquare, Video, Radio, ZoomIn } from "lucide-react";

export interface TimelineStep {
  time: string;
  title: string;
  description: string;
  tag: string;
  icon: typeof Rocket;
  highlight?: boolean;
  images?: Array<{ src: string; alt: string }>;
}

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    time: "09:00",
    title: "Setup Dev & Code Commando",
    description: "Démarrage du dev du MVP mobile-first : Next.js 15, compression Canvas côté client et intégration Gemini Vision.",
    tag: "Build",
    icon: Zap,
    images: [{ src: "/recap/IMG_0416.png", alt: "Julien au poste de dev" }],
  },
  {
    time: "12:00",
    title: "Story Instagram & Diffusion Discord",
    description: "Publication de la story @baptiste__fry avec sticker loreno.app et partage dans plusieurs groupes Discord étudiants.",
    tag: "Social",
    icon: Rocket,
    images: [
      { src: "/recap/IMG_0424.png", alt: "Story Instagram @baptiste__fry" },
      { src: "/recap/discord-share.png", alt: "Partage dans les groupes Discord" },
    ],
  },
  {
    time: "12:00 - 18:00",
    title: "Acquisition Terrain à Nancy & Posts TikTok",
    description: "Micro-trottoirs avec les étudiants dans la ville pour tester le scan en direct et publication des vidéos sur TikTok.",
    tag: "Terrain & TikTok",
    icon: MessageSquare,
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
    tag: "Live Jury",
    icon: Radio,
    images: [{ src: "/recap/founder-live.png", alt: "Live Paddock FounderRace" }],
  },
  {
    time: "18:00 - 21:00",
    title: "Montage, Dev Continu & Encaissement Stripe",
    description: "Montage des Reels d'acquisition, déploiement des super-features de rétention et 59,94 € encaissés en direct.",
    tag: "Traction",
    icon: DollarSign,
    highlight: true,
    images: [
      { src: "/recap/IMG_0425.jpg", alt: "Montage vidéo Premiere Pro" },
      { src: "/recap/IMG_0426.jpg", alt: "Dashboard Stripe Live 59,94 €" },
      { src: "/recap/IMG_0427.jpg", alt: "Vercel Analytics 104 visiteurs" },
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
        const Icon = step.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all ${
              step.highlight
                ? "bg-zinc-950 text-white border-zinc-800 shadow-md"
                : "bg-white text-zinc-900 border-zinc-200 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    step.highlight ? "bg-amber-400 text-black" : "bg-zinc-100 text-zinc-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-xs font-bold opacity-75">{step.time}</span>
                <h4 className="text-xs font-bold leading-snug">{step.title}</h4>
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                  step.highlight
                    ? "bg-zinc-800 text-amber-300 border border-amber-400/30"
                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                }`}
              >
                {step.tag}
              </span>
            </div>

            <p
              className={`text-[11px] leading-relaxed mt-2 pl-8 ${
                step.highlight ? "text-zinc-300" : "text-zinc-600"
              }`}
            >
              {step.description}
            </p>

            {/* Photos associées à l'étape en colonne avec zoom au clic */}
            {step.images && step.images.length > 0 && (
              <div className="mt-3 pl-8 flex flex-col gap-3">
                {step.images.map((img, iIdx) => (
                  <div
                    key={iIdx}
                    onClick={() => onPhotoClick?.(img.src, img.alt)}
                    className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200/20 group shadow-xs cursor-pointer"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
                        <ZoomIn className="w-3 h-3" />
                        <span>Agrandir</span>
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-1 rounded-md bg-black/75 text-[10px] text-white font-medium truncate backdrop-blur-xs">
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
