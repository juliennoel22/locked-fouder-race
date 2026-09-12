import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Loreno",
  description: "Conditions d'utilisation du service Loreno.",
};

export default function TermsPage() {
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
            <span className="text-xs font-mono text-zinc-400">Mentions Légales</span>
          </div>

          <div className="space-y-1 mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-black" />
              <h1 className="text-xl font-bold tracking-tight text-black">
                Conditions d&apos;Utilisation
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
            <h2 className="text-sm font-semibold text-black">1. Objet du contrat</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation régissent l&apos;accès et l&apos;utilisation de l&apos;application <strong className="text-black">Loreno</strong> (loreno.app). En utilisant notre service, vous acceptez l&apos;ensemble de ces conditions.
            </p>
          </section>

          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">2. Description des services</h2>
            <p>
              Loreno propose aux étudiants des outils d&apos;aide à la mémorisation et à la révision :
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-600">
              <li>Scan et reconnaissance de cours manuscrits et dactylographiés.</li>
              <li>Génération automatisée de flashcards interactives et questions d&apos;examen.</li>
              <li>Synthèses structurées et accompagnement par intelligence artificielle.</li>
            </ul>
          </section>

          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">3. Propriété intellectuelle &amp; Contenus</h2>
            <p>
              Vous conservez l&apos;entière propriété des notes et cours que vous téléversez. En les soumettant, vous concédez à Loreno une licence strictement limitée au traitement technique nécessaire à la génération des fiches d&apos;étude.
            </p>
            <p className="text-zinc-600">
              L&apos;infrastructure, l&apos;algorithme, le design et la marque Loreno restent la propriété exclusive de ses créateurs.
            </p>
          </section>

          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">4. Tarifs &amp; Paiements</h2>
            <p>
              Loreno propose une découverte gratuite ainsi qu&apos;une formule &laquo; Pack Premium &raquo; (accès à vie en paiement unique) ou des options payantes gérées de manière sécurisée par Stripe.
            </p>
            <p className="text-zinc-600">
              Les prix sont indiqués en euros toutes taxes comprises. Aucun renouvellement automatique n&apos;est prélevé sans votre accord exprès.
            </p>
          </section>

          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">5. Responsabilités &amp; Disponibilité</h2>
            <p>
              Loreno met en œuvre tous les moyens raisonnables pour assurer un accès continu et performant au service. Les contenus générés par l&apos;intelligence artificielle sont fournis à titre d&apos;aide à l&apos;apprentissage et ne remplacent pas les enseignements officiels d&apos;un établissement scolaire ou universitaire.
            </p>
          </section>

          <section className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h2 className="text-sm font-semibold text-black">6. Contact</h2>
            <p>
              Pour toute question relative aux présentes conditions, contactez l&apos;équipe à : <span className="text-black font-mono font-medium">support@loreno.app</span>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center text-[11px] text-zinc-500 space-y-2">
          <p>© 2026 Loreno. Tous droits réservés.</p>
          <div className="flex justify-center gap-4 text-zinc-500">
            <Link href="/privacy" className="hover:text-black underline">
              Politique de Confidentialité
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
