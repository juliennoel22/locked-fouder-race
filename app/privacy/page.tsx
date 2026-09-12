import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — Loreno",
  description: "Règles de confidentialité et protection des données de l'application Loreno.",
};

export default function PrivacyPage() {
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
            <span className="text-xs font-mono text-zinc-400">RGPD &amp; Données</span>
          </div>

          <div className="space-y-1 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-black" />
              <h1 className="text-xl font-bold tracking-tight text-black">
                Politique de Confidentialité
              </h1>
            </div>
            <p className="text-xs text-zinc-500">
              Dernière mise à jour : 12 septembre 2026
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 text-left text-xs text-zinc-700 leading-relaxed">
          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">1. Présentation du service</h2>
            <p>
              Loreno (accessible via <strong className="text-black">loreno.app</strong>) est une application d&apos;assistance aux révisions étudiantes permettant de transformer des notes de cours manuscrites ou imprimées en fiches de révision et synthèses mémorielles grâce à l&apos;intelligence artificielle.
            </p>
          </section>

          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">2. Données collectées</h2>
            <p>
              Dans le cadre de l&apos;utilisation de Loreno, nous pouvons collecter les données strictement nécessaires :
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-600">
              <li><strong className="text-zinc-900">Compte utilisateur :</strong> Adresse email, identifiant unique de compte (authentification Supabase / Google OAuth).</li>
              <li><strong className="text-zinc-900">Documents de cours :</strong> Photographies ou scans de notes transmis pour analyse et génération de flashcards.</li>
              <li><strong className="text-zinc-900">Données d&apos;apprentissage :</strong> Statistiques de mémorisation (score de rétention, séries de cartes).</li>
            </ul>
          </section>

          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">3. Finalité du traitement</h2>
            <p>
              Vos données sont traitées uniquement dans le but de :
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-600">
              <li>Fournir le service de scan, d&apos;extraction et de révision par flashcards.</li>
              <li>Sauvegarder vos carnets d&apos;études dans votre espace personnel sécurisé.</li>
              <li>Gérer vos accès et paiements éventuels via Stripe (sans stockage de vos coordonnées bancaires sur nos serveurs).</li>
            </ul>
            <p className="text-zinc-600">
              <strong>Nous ne vendons, ne louons et ne cédons aucune donnée personnelle</strong> à des tiers à des fins publicitaires.
            </p>
          </section>

          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">4. Sous-traitants &amp; Sécurité</h2>
            <p>
              Nous nous appuyons sur des infrastructures de premier plan respectant les standards de sécurité et le RGPD :
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-600">
              <li><strong className="text-zinc-900">Supabase :</strong> Base de données chiffrée et stockage sécurisé des scans.</li>
              <li><strong className="text-zinc-900">Vercel :</strong> Hébergement et distribution globale chiffrée SSL/TLS.</li>
              <li><strong className="text-zinc-900">Google Cloud / Gemini API :</strong> Analyse vision et génération pédagogique.</li>
              <li><strong className="text-zinc-900">Stripe :</strong> Gestion des transactions conforme PCI-DSS.</li>
            </ul>
          </section>

          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">5. Vos droits (RGPD)</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification, de portabilité et de suppression intégrale de vos données.
            </p>
            <p className="text-zinc-600">
              Pour exercer vos droits ou demander la suppression de votre compte, contactez-nous à : <span className="text-black font-mono font-medium">support@loreno.app</span>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center text-[11px] text-zinc-500 space-y-2">
          <p>© 2026 Loreno. Tous droits réservés.</p>
          <div className="flex justify-center gap-4 text-zinc-500">
            <Link href="/terms" className="hover:text-black underline">
              Conditions d&apos;Utilisation
            </Link>
            <Link href="/" className="hover:text-black underline">
              Retour à l&apos;application
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
