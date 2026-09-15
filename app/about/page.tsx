import Link from "next/link";
import { ArrowLeft, Sparkles, BookOpen, ShieldCheck, HeartHandshake, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos & Mission Pédagogique — Loreno",
  description: "Découvre la mission EdTech de Loreno : aider les étudiants à réussir leurs partiels grâce à la mémorisation active et l'IA.",
};

export default function AboutPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 sm:p-6 bg-white text-black pb-16">
        {/* Header */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between h-8 mb-4">
            <Link
              href="/"
              className="p-2 -ml-2 text-zinc-500 hover:text-black transition flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Accueil</span>
            </Link>
            <span className="text-xs font-mono text-zinc-400">À Propos</span>
          </div>

          <div className="space-y-1 mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-black">
                À propos de Loreno
              </h1>
            </div>
            <p className="text-xs text-zinc-500">
              La technologie au service de la réussite universitaire.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 text-left text-xs text-zinc-700 leading-relaxed">
          {/* Mission */}
          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center gap-2 text-black font-bold text-sm">
              <BookOpen className="w-4 h-4 text-black" />
              <h2>Notre Mission Pédagogique</h2>
            </div>
            <p>
              Loreno a été conçu avec une ambition claire : éliminer le stress des semaines de partiels en transformant la prise de note brute en un outil de mémorisation active et efficace.
            </p>
            <p className="text-zinc-600">
              En envoyant la photo d&apos;un cours (manuscrit ou imprimé), l&apos;étudiant obtient instantanément une fiche synthétique, des flashcards de révision et un tuteur IA capable de l&apos;interroger sur les pièges fréquents d&apos;examen.
            </p>
          </section>

          {/* Principes de mémorisation */}
          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center gap-2 text-black font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h2>Mémorisation Active &amp; Spaced Repetition</h2>
            </div>
            <p>
              Plutôt que d&apos;effectuer de la relecture passive, Loreno s&apos;appuie sur l&apos;algorithme de répétition espacée (SuperMemo SM-2) et l&apos;auto-évaluation continue.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-600">
              <li><strong>Rappel Actif (Active Recall) :</strong> Forcer le cerveau à restituer l&apos;information.</li>
              <li><strong>Algorithme SM-2 :</strong> Calculer le moment idéal pour réviser avant l&apos;oubli.</li>
              <li><strong>Tuteur IA d&apos;Examen :</strong> Simuler les vraies questions pièges du professeur.</li>
            </ul>
          </section>

          {/* Engagements & TrustScore */}
          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center gap-2 text-black font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-black" />
              <h2>Engagements &amp; Confidentialité</h2>
            </div>
            <p>
              Chaque cours scanné reste la propriété exclusive de l&apos;étudiant. Vos données sont chiffrées et ne sont jamais réutilisées pour du ciblage publicitaire.
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Hébergement : Vercel / SSL</span>
              <span>Base : Supabase / RLS</span>
            </div>
          </section>

          {/* Contact Support */}
          <section className="p-4 rounded-2xl bg-zinc-900 text-white space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <h2>Contact &amp; Équipe</h2>
            </div>
            <p className="text-zinc-300 text-xs">
              Une suggestion ou une question ? Notre équipe répond aux étudiants en moins de 24h.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <a
                href="mailto:contact@loreno.app"
                className="inline-block px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition"
              >
                contact@loreno.app
              </a>
              <Link
                href="/dashboard"
                className="inline-block px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 font-medium text-xs hover:bg-zinc-700 transition"
              >
                Support in-app
              </Link>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center text-[11px] text-zinc-500 space-y-2">
          <p>© 2026 Loreno. Tous droits réservés.</p>
          <div className="flex justify-center gap-4 text-zinc-500">
            <Link href="/privacy" className="hover:text-black underline">
              Confidentialité (RGPD)
            </Link>
            <Link href="/terms" className="hover:text-black underline">
              Conditions générales
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
