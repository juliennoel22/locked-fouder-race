"use client";

import { Camera, Zap, Bot, Smartphone, LucideIcon } from "lucide-react";

interface FeatureItem {
  step: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const FEATURES: FeatureItem[] = [
  {
    step: "1",
    title: "Scan Intelligent < 2s",
    desc: "Extraction instantanée des notes manuscrites et cours analysés par Google Gemini 1.5 Flash.",
    icon: Camera,
  },
  {
    step: "2",
    title: "Quiz 3D & Note /20",
    desc: "Mode Deuxième Chance ciblant les erreurs, note prédictive et explications pédagogiques.",
    icon: Zap,
  },
  {
    step: "3",
    title: "Tuteur IA d'Examen",
    desc: "Dialogue en temps réel avec ton cours pour poser des questions et déjouer les pièges d'examen.",
    icon: Bot,
  },
];

export function RecapFeaturesSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">
            3
          </span>
          <span>Le Concept & Démo de l&apos;Application</span>
        </h2>
        <span className="text-[10px] font-semibold text-zinc-500">MVP 24H</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.step}
              className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1.5"
            >
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
    </section>
  );
}
