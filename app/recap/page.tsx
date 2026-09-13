"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Trophy, 
  Users, 
  CreditCard, 
  Eye, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { RecapTimeline } from "@/components/recap/recap-timeline";
import { ImageLightboxModal } from "@/components/recap/image-lightbox-modal";
import { RecapCharts } from "@/components/recap/recap-charts";
import { PitchVideoCard } from "@/components/recap/pitch-video-card";
import { RecapFeaturesSection } from "@/components/recap/recap-features-section";
import { RecapFeedbacks } from "@/components/recap/recap-feedbacks";

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
    { label: "Inscriptions", value: `${stats.signupsCount}`, sub: "Comptes Supabase", icon: Users, color: "text-[#4457f4]", bg: "bg-indigo-50" },
  ];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 text-zinc-900 pb-16 selection:bg-black selection:text-white">
      {/* Sticky Header épuré */}
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
            width={160}
            height={40}
            className="h-8 sm:h-9 w-auto object-contain"
            priority
          />

          <div className="w-14" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-8">
        {/* Hero Title épuré */}
        <section className="text-center space-y-2 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
            L&apos;Aventure Loreno en 24H
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
            De la première ligne de code aux {stats.transactionsCount} premiers clients payants à Nancy.
          </p>
        </section>

        {/* 1. Vidéo de Pitch */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Vidéo de Pitch du Projet</span>
            </h2>
          </div>

          <PitchVideoCard src="/recap/pitch-stream.mp4" />
        </section>

        {/* 2. Métriques Clés & Retours Utilisateurs */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Traction &amp; Retours Utilisateurs en Direct</span>
            </h2>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stripe &amp; Vercel Live
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

          {/* Retours & Preuves Utilisateurs */}
          <RecapFeedbacks onPhotoClick={(src, alt) => setLightboxImg({ src, alt })} />
        </section>

        {/* 3. Le Concept & Fonctionnalités Clés */}
        <RecapFeaturesSection />

        {/* 4. Timeline 24H avec Photos Chronologiques */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">4</span>
              <span>Chronologie du Sprint 24H</span>
            </h2>
          </div>

          <RecapTimeline onPhotoClick={(src, alt) => setLightboxImg({ src, alt })} />
        </section>

        {/* 5. Section Preuves & Données Certifiées */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">5</span>
              <span>Preuves &amp; Données Certifiées</span>
            </h2>
            <span className="text-[10px] font-bold text-zinc-600 bg-zinc-200/70 px-2 py-0.5 rounded-full">
              Annexes Officielles
            </span>
          </div>

          <RecapCharts onPhotoClick={(src, alt) => setLightboxImg({ src, alt })} />
        </section>

        {/* 6. Grand CTA vers l'Application (Racine /) */}
        <section className="pt-2">
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-white text-center space-y-4 shadow-xl">
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Tester Loreno en Live
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
                Scanne un cours ou teste les flashcards 3D et le tuteur IA directement sur l&apos;application.
              </p>
            </div>

            <Link
              href="/"
              className="w-full h-13.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#3446eb] via-[#4457f4] to-indigo-600 hover:brightness-105 text-white font-bold text-sm transition active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-[#4457f4]/30"
            >
              <span>Accéder à Loreno.app</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
              <span>Code promo démo :</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono font-bold text-white border border-white/20">
                FOUNDERRACE
              </span>
              <span>(100% offert)</span>
            </div>
          </div>
        </section>

        {/* Footer avec Julien Noel & Baptiste Ferry */}
        <footer className="pt-6 border-t border-zinc-200 text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Julien Noel &amp; Baptiste Ferry • FounderRace 2026</span>
          </div>
          <p className="text-[10px] text-zinc-400">
            Loreno est en ligne sur{" "}
            <a href="https://www.loreno.app" className="underline font-semibold text-zinc-600">
              loreno.app
            </a>
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
