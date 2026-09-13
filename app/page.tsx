import Link from "next/link";
import Image from "next/image";
import { Camera, Layers, Bot, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black">
        {/* Top Header : Logo & Étape */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between h-9 mb-3">
            <Image
              src="/logo.png"
              alt="loreno.app"
              width={160}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
            <span className="text-xs font-mono font-semibold text-zinc-400">1 / 6</span>
          </div>
          <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden border border-zinc-200">
            <div className="bg-black h-full transition-all duration-300" style={{ width: "16.66%" }} />
          </div>
        </div>

        {/* Écran 1 : Hero structuré et épuré */}
        <div className="flex-1 flex flex-col justify-center py-5 space-y-6">
          <div className="space-y-4 text-center">

            {/* Titre percutant */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black leading-tight">
              Révise 2x plus vite avec tes notes de cours
            </h1>

            {/* Sous-titre clair */}
            <p className="text-xs sm:text-sm text-zinc-600 max-w-xs mx-auto leading-relaxed">
              Prends en photo n&apos;importe quel cours. Obtiens tes fiches mémo et ton entraînement d&apos;examen en 2 secondes.
            </p>
          </div>

          {/* 3 piliers structurés */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-center space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-[#4457f4]/10 text-[#4457f4] flex items-center justify-center mx-auto">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-zinc-900 block leading-tight">Scan &lt; 2s</span>
              <span className="text-[10px] text-zinc-500 block">Notes &amp; PDF</span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-center space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-[#4457f4]/10 text-[#4457f4] flex items-center justify-center mx-auto">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-zinc-900 block leading-tight">Flashcards</span>
              <span className="text-[10px] text-zinc-500 block">Mémorisation</span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-center space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-[#4457f4]/10 text-[#4457f4] flex items-center justify-center mx-auto">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-zinc-900 block leading-tight">Tuteur IA</span>
              <span className="text-[10px] text-zinc-500 block">Entraînement</span>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="pt-2 space-y-2">
            <Link
              href="/quiz"
              className="w-full h-13.5 py-3.5 px-6 bg-gradient-to-r from-[#3446eb] via-[#4457f4] to-indigo-600 hover:brightness-105 text-white font-bold text-sm rounded-2xl active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-lg shadow-[#4457f4]/25"
            >
              <span>Commencer mon entraînement</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gratuit • Immédiat • Sans carte bancaire</span>
            </div>
          </div>
        </div>

        {/* Footer Minimalist Powered by FounderRace + Link to /recap */}
        <div className="py-3 flex items-center justify-between gap-2 text-xs border-t border-zinc-100 mt-2">
          <a
            href="https://founderrace.com/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-black transition group opacity-90"
          >
            <span className="font-medium text-zinc-400">Powered by</span>
            <div className="flex items-center gap-1 font-bold text-black">
              <Image src="/founderrace-logo.svg" alt="FounderRace" width={16} height={16} className="w-4 h-4 rounded-[4px]" />
              <span className="font-mono text-[11px] uppercase tracking-wider group-hover:underline">FounderRace</span>
            </div>
          </a>

          <Link
            href="/recap"
            className="text-[11px] font-bold text-[#4457f4] hover:underline transition"
          >
            Page Récap Jury →
          </Link>
        </div>
      </div>
    </main>
  );
}
