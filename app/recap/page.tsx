"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Bot, 
  Play, 
  Smartphone,
  Camera
} from "lucide-react";
import { RecapTimeline } from "@/components/recap/recap-timeline";
import { ImageLightboxModal } from "@/components/recap/image-lightbox-modal";

const METRICS = [
  { label: "CA Encaissé", value: "59,94 €", sub: "6 transactions Stripe", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Clients Payants", value: "6", sub: "Pass 9,99 € validés", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Visites Uniques", value: "104", sub: "316 pages vues", icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Inscriptions", value: "19", sub: "Comptes Supabase", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
];

const FEATURES = [
  { 
    step: "1", 
    title: "Prends tes cours en photo", 
    desc: "Scan instantané de tes notes manuscrites, polycopiés ou schémas.", 
    icon: Camera,
    color: "bg-black text-white" 
  },
  { 
    step: "2", 
    title: "Génère Flashcards & Quiz d'examen", 
    desc: "Fiches mémos interactives et QCM optimisés notés sur /20.", 
    icon: Zap,
    color: "bg-black text-white" 
  },
  { 
    step: "3", 
    title: "Révise avec ton Assistant IA", 
    desc: "Pose tes questions sur ton cours et débloque les explications clés.", 
    icon: Bot,
    color: "bg-black text-white" 
  },
];

export default function RecapPage() {
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="min-h-[100dvh] bg-zinc-50 text-zinc-900 pb-16 selection:bg-black selection:text-white">
      {/* Sticky Header avec Logo officiel Loreno */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Image
            src="/logo.png"
            alt="loreno.app"
            width={120}
            height={30}
            className="h-7 w-auto object-contain"
            priority
          />

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>24H Hackathon</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-7">
        {/* Hero Title */}
        <section className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-bold shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Récapitulatif Officiel FounderRace</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
            L&apos;Aventure Loreno en 24H 🚀
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
            De la première ligne de code aux 6 premiers clients payants à Nancy.
          </p>
        </section>

        {/* Emplacement Vidéo de Pitch en Format VERTICAL (9:16) */}
        <section className="space-y-2">
          <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between px-1 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-black" />
                <span>Vidéo de Pitch du Projet (Vertical 9:16)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                Format Jury
              </span>
            </div>

            {/* Cadre vertical format smartphone */}
            <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] rounded-2xl bg-zinc-950 border-2 border-zinc-800 overflow-hidden flex flex-col items-center justify-center text-white group shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              <div className="w-14 h-14 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/30 flex items-center justify-center transition-transform group-hover:scale-110 z-10 shadow-lg cursor-pointer">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>

              <span className="text-xs font-bold text-zinc-200 mt-3 z-10">
                Vidéo de Pitch Verticale
              </span>
              <span className="text-[10px] text-zinc-400 z-10 px-4 text-center mt-1">
                Prêt pour l&apos;intégration (MP4 / Short / Reel)
              </span>
            </div>
          </div>
        </section>

        {/* Métriques Clés en Direct */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-700" />
            <span>Métriques Clés en Direct (Stripe & Vercel)</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {METRICS.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-medium">{m.label}</span>
                    <div className={`w-5 h-5 rounded-md ${m.bg} ${m.color} flex items-center justify-center`}>
                      <Icon className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-black tracking-tight">{m.value}</div>
                  <div className="text-[10px] text-zinc-400 font-medium">{m.sub}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Le Concept & Fonctionnalités Clés */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
            <span>Le Concept en 3 Étapes & Démo de l&apos;App</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      {f.step}
                    </div>
                    <Icon className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h4 className="text-xs font-bold text-black">{f.title}</h4>
                  <p className="text-[11px] text-zinc-500 leading-snug">{f.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Démo Vidéo Verticale de l'Application */}
          <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between px-1 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-black" />
                <span>Vidéo de Démo de l&apos;Application (Vertical 9:16)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                Démo Live
              </span>
            </div>

            <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] rounded-2xl bg-zinc-950 border-2 border-zinc-800 overflow-hidden flex flex-col items-center justify-center text-white group shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              <div className="w-14 h-14 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/30 flex items-center justify-center transition-transform group-hover:scale-110 z-10 shadow-lg cursor-pointer">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>

              <span className="text-xs font-bold text-zinc-200 mt-3 z-10">
                Démo de l&apos;Application
              </span>
              <span className="text-[10px] text-zinc-400 z-10 px-4 text-center mt-1">
                Prêt pour l&apos;intégration (MP4 / Short)
              </span>
            </div>
          </div>
        </section>

        {/* Timeline 24H avec Photos Chronologiques */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-700" />
            <span>Chronologie du Sprint 24H (Clique pour agrandir)</span>
          </h2>

          <RecapTimeline onPhotoClick={(src, alt) => setLightboxImg({ src, alt })} />
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-zinc-200 text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Julien Noel • FounderRace 2026</span>
          </div>
          <p className="text-[10px] text-zinc-400">
            Loreno est en ligne sur <a href="https://www.loreno.app" className="underline font-semibold text-zinc-600">loreno.app</a>
          </p>
        </footer>
      </main>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImg)}
        onClose={() => setLightboxImg(null)}
        src={lightboxImg?.src || null}
        alt={lightboxImg?.alt || ""}
      />
    </div>
  );
}
