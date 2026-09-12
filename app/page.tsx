import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black selection:bg-black selection:text-white">
        {/* Header vide pour l'espacement */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between h-8 mb-3">
            <div className="w-5" />
            <span className="text-xs font-mono text-zinc-400">1 / 6</span>
          </div>
          <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden border border-zinc-200">
            <div className="bg-black h-full transition-all duration-300" style={{ width: "16.66%" }} />
          </div>
        </div>

        {/* Écran 1 : Welcome ultra-simple */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-2xl border border-zinc-200 bg-zinc-100 flex items-center justify-center mx-auto text-xl">
              ⚡
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                Révise 2x plus vite avec ton tuteur IA
              </h1>
              <p className="text-sm text-zinc-600 max-w-xs mx-auto">
                Prends en photo n&apos;importe quel cours. Obtiens tes fiches mémo interactives et ton entraînement d&apos;examen en 3 secondes.
              </p>
            </div>
            <Link
              href="/quiz"
              className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl active:scale-[0.98] transition flex items-center justify-center mt-8"
            >
              Commencer
            </Link>
          </div>
        </div>

        {/* Footer Minimalist */}
        <div className="py-2 text-center text-[11px] text-zinc-400">
          Loreno
        </div>
      </div>
    </main>
  );
}
