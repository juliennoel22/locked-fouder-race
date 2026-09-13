"use client";

import { useEffect, useState } from "react";
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
  Camera,
  FileCheck,
  Compass,
  History
} from "lucide-react";
import { RecapTimeline } from "@/components/recap/recap-timeline";
import { ImageLightboxModal } from "@/components/recap/image-lightbox-modal";
import { JuryPassCard } from "@/components/recap/jury-pass-card";
import { RecapCharts } from "@/components/recap/recap-charts";

interface LiveStats {
  revenue: number;
  transactionsCount: number;
  visitors: number;
  pageviews: number;
  signupsCount: number;
}

const DEFAULT_STATS: LiveStats = {
  revenue: 59.94,
  transactionsCount: 6,
  visitors: 138,
  pageviews: 422,
  signupsCount: 30,
};

const FEATURES = [
  { 
    step: "1", 
    title: "Scan Intelligent < 2s", 
    desc: "Extraction instantanée des notes manuscrites et cours analysés par Google Gemini 1.5 Flash.", 
    icon: Camera,
  },
  { 
    step: "2", 
    title: "Quiz 3D & Note /20", 
    desc: "Mode Deuxième Chance (Round 2) ciblant les erreurs, note prédictive et explications pédagogiques.", 
    icon: Zap,
  },
  { 
    step: "3", 
    title: "Tuteur IA d'Examen", 
    desc: "Dialogue en temps réel avec ton cours pour poser des questions et déjouer les pièges d'examen.", 
    icon: Bot,
  },
];

export default function RecapPage() {
  const [stats, setStats] = useState<LiveStats>(DEFAULT_STATS);
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    fetch("/api/recap-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.revenue === "number") {
          setStats(data);
        }
      })
      .catch((err) => console.error("Erreur stats live :", err));
  }, []);

  const metrics = [
    { label: "CA Encaissé", value: `${stats.revenue.toFixed(2).replace(".", ",")} €`, sub: `${stats.transactionsCount} ventes Stripe`, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Clients Payants", value: `${stats.transactionsCount}`, sub: "Pass 9,99 € validés", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Visites Uniques", value: `${stats.visitors}`, sub: `${stats.pageviews} pages vues`, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Inscriptions", value: `${stats.signupsCount}`, sub: "Comptes Supabase", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 text-zinc-900 pb-16 selection:bg-black selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Accueil</span>
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

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-8">
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
            De la première ligne de code aux {stats.transactionsCount} premiers clients payants à Nancy.
          </p>
        </section>

        {/* 1. Vidéo de Pitch en Format VERTICAL (9:16) */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Vidéo de Pitch du Projet</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Format Vertical 9:16
            </span>
          </div>

          <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col items-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] rounded-2xl bg-zinc-950 border-2 border-zinc-800 overflow-hidden flex flex-col items-center justify-center text-white group shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              <div className="w-14 h-14 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/30 flex items-center justify-center transition-transform group-hover:scale-110 z-10 shadow-lg cursor-pointer">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>

              <span className="text-xs font-bold text-zinc-200 mt-3 z-10">
                Vidéo de Pitch Verticale
              </span>
              <span className="text-[10px] text-zinc-400 z-10 px-4 text-center mt-1">
                Prêt pour l&apos;intégration (MP4 / Reel)
              </span>
            </div>
          </div>
        </section>

        {/* 2. Métriques Clés en Direct (Stripe & Vercel) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Traction & Chiffres Clés en Direct</span>
            </h2>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stripe & Vercel Live
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {metrics.map((m, i) => {
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

        {/* 3. Le Concept & Fonctionnalités Clés */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Le Concept & Démo de l&apos;Application</span>
            </h2>
            <span className="text-[10px] font-semibold text-zinc-500">
              MVP 24H
            </span>
          </div>

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

          {/* Démo Vidéo de l'App */}
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

        {/* 4. Bloc Action : Accès Évaluateur Jury */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">4</span>
              <span>Tester Loreno en Conditions Réelles</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Accès Jury Illimité
            </span>
          </div>

          <JuryPassCard />
        </section>

        {/* 5. Timeline 24H avec Photos Chronologiques */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">5</span>
              <span>Chronologie du Sprint 24H</span>
            </h2>
            <span className="text-[10px] text-zinc-500 font-medium">
              Photos Terrain & Dev
            </span>
          </div>

          <RecapTimeline onPhotoClick={(src, alt) => setLightboxImg({ src, alt })} />
        </section>

        {/* 6. Section Preuves & Données Certifiées */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">6</span>
              <span>Preuves & Données Certifiées</span>
            </h2>
            <span className="text-[10px] font-bold text-zinc-600 bg-zinc-200/70 px-2 py-0.5 rounded-full">
              Annexes Officielles
            </span>
          </div>

          <RecapCharts onPhotoClick={(src, alt) => setLightboxImg({ src, alt })} />
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-zinc-200 text-center space-y-1.5">
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
