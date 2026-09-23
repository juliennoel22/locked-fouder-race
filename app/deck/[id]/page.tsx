"use client";

import { useEffect, useState, use, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, Play, BookOpen, Loader2 } from "lucide-react";
import { Deck, NotebookItem } from "@/types/loreno";
import { DEMO_DECK } from "@/lib/demo-deck";
import { Header } from "@/components/Header";
import { MarkdownView } from "@/components/markdown-view";
import { MirrorModal } from "@/components/mirror-modal";
import { PaywallModal } from "@/components/paywall-modal";
import { createClient } from "@/lib/supabase/client";

import { CoursePathMap, PathNode } from "@/components/review/course-path-map";
import { PathNodeModal } from "@/components/review/path-node-modal";

interface DeckPageProps {
  params: Promise<{ id: string }>;
}

export function DeckDetailView({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPathMap, setShowPathMap] = useState<boolean>(false);
  const [selectedPathNode, setSelectedPathNode] = useState<PathNode | null>(null);
  const [showMirrorModal, setShowMirrorModal] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  const loadDeck = useCallback(async () => {
    if (deckId === "demo-droit-constitutionnel" || deckId === "demo") {
      setDeck(DEMO_DECK);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("decks")
        .select("*, flashcards(*)")
        .eq("id", deckId)
        .single();

      if (error || !data) {
        setDeck(DEMO_DECK);
      } else {
        setDeck(data);
      }
    } catch (err) {
      console.error("Erreur chargement deck :", err);
      setDeck(DEMO_DECK);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  if (loading) {
    return (
      <main className="min-h-[100dvh] w-full bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
        <p className="text-xs text-zinc-500 font-medium">Chargement du cours...</p>
      </main>
    );
  }

  if (!deck) return null;

  const markdownContent = deck.detailed_content?.trim() || (
    `# Fiche de Révision : ${deck.title}\n\n## 1. Synthèse du Cours\n${deck.summary || "Synthèse des notions essentielles du cours."}\n\n## 2. Notions Essentielles\n${
      Array.isArray(deck.flashcards) && deck.flashcards.length > 0
        ? deck.flashcards.map((f) => `- **${f.front}** : ${f.back}`).join("\n")
        : `- **Concept Principal** : Définition et mécanismes de base de **${deck.title}**.\n- **Méthodologie** : Méthode d'analyse et points d'attention aux partiels.`
    }\n\n## 3. Synthèse des Connaissances\nCette fiche est prête pour ton entraînement adaptatif.`
  );

  const notebookItem: NotebookItem = {
    id: deck.id,
    title: deck.title,
    subject: deck.subject || "Général",
    emoji: "📝",
    date: "Aujourd'hui",
    sourceCount: deck.flashcards?.length || 0,
    imageUrl: deck.image_url,
    detailed_content: deck.detailed_content,
    deck: {
      title: deck.title,
      subject: deck.subject || "Général",
      summary: deck.summary || "",
      detailed_content: deck.detailed_content || "",
      initial_quiz_question: deck.initial_quiz_question || "",
      flashcards: (deck.flashcards || []).map((f) => ({
        front: f.front,
        back: f.back,
        distractors: f.distractors,
      })),
    },
  };

  return (
    <main className="min-h-[100dvh] w-full bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-white text-black">
        {/* Header avec bouton retour & pastille PRO */}
        <Header
          backHref={showPathMap ? undefined : "/dashboard"}
          onBack={showPathMap ? () => setShowPathMap(false) : undefined}
          title={showPathMap ? "Parcours de révision" : "Fiche de Cours"}
          onOpenPaywall={() => setShowPaywall(true)}
        />

        {/* CONTENU PRINCIPAL */}
        <div className="flex-1 flex flex-col space-y-4 pb-28 pt-1 text-left">
          {showPathMap ? (
            <CoursePathMap
              deckTitle={deck.title}
              subject={deck.subject}
              progressPercent={deck.progress_percent || 0}
              onSelectNode={(node) => setSelectedPathNode(node)}
              onStartNextNode={() => router.push(`/review/${deck.id}`)}
            />
          ) : (
            <div className="space-y-4">
              {/* Titre & Badges */}
              <div className="space-y-2 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-700">
                    {deck.subject || "Général"}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-zinc-400" />
                    Fiche complète
                  </span>
                  {typeof deck.progress_percent === "number" && deck.progress_percent > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {deck.progress_percent}% maîtrisé
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-black tracking-tight text-black leading-snug">
                  {deck.title}
                </h1>
              </div>

              {/* Bouton unique pour consulter les photos et enrichir le cours */}
              {deck.image_url && (
                <button
                  type="button"
                  onClick={() => setShowMirrorModal(true)}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-800 hover:bg-zinc-100 transition active:scale-[0.99] flex items-center justify-between text-xs font-bold cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-zinc-600 shrink-0" />
                    <span>Consulter la photo & enrichir le cours</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">Ouvrir →</span>
                </button>
              )}

              {/* Rendu Markdown de la Fiche Complète */}
              <div className="p-4 sm:p-5 rounded-3xl bg-zinc-50/70 border border-zinc-200 shadow-2xs">
                <MarkdownView content={markdownContent} />
              </div>
            </div>
          )}
        </div>

        {/* CTA UNIQUE STICKY BOTTOM : DÉMARRER L'ENTRAÎNEMENT -> OUVRE LA CARTE DU PARCOURS */}
        {!showPathMap && (
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/95 backdrop-blur-md border-t border-zinc-100/80 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowPathMap(true)}
              className="w-full h-14 rounded-2xl bg-black text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-xl cursor-pointer hover:bg-zinc-800"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Démarrer l'entraînement</span>
            </button>
          </div>
        )}

        {/* Modal Nœud du Parcours */}
        <PathNodeModal
          isOpen={Boolean(selectedPathNode)}
          node={selectedPathNode}
          onClose={() => setSelectedPathNode(null)}
          onStartSession={() => router.push(`/review/${deck.id}`)}
        />

        {/* Modal Photo Miroir & Enrichissement */}
        <MirrorModal
          isOpen={showMirrorModal}
          onClose={() => setShowMirrorModal(false)}
          imageUrl={deck.image_url}
          deckTitle={deck.title}
          currentNotebook={notebookItem}
          onDeckUpdated={() => loadDeck()}
        />

        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    </main>
  );
}

function DeckPageInner({ params }: DeckPageProps) {
  const resolvedParams = use(params);
  return <DeckDetailView deckId={resolvedParams.id} />;
}

export default function DeckPage({ params }: DeckPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100dvh] w-full bg-white flex flex-col items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-500 font-medium">Chargement du cours...</p>
        </main>
      }
    >
      <DeckPageInner params={params} />
    </Suspense>
  );
}
