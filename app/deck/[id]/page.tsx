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
import { unpackDeck } from "@/lib/db-compat";

import { CoursePathMap, PathNode } from "@/components/review/course-path-map";
import { PathNodeModal } from "@/components/review/path-node-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
  const [showDevMode, setShowDevMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("dev") === "true" || localStorage.getItem("loreno_dev_mode") === "true") {
        setShowDevMode(true);
      }
    }
  }, []);

  const loadDeck = useCallback(async () => {
    if (deckId === "demo-droit-constitutionnel" || deckId === "demo") {
      setDeck(DEMO_DECK);
      setLoading(false);
      return;
    }

    if (deckId.startsWith("demo-histoire")) {
      try {
        const stored = localStorage.getItem("loreno_mock_history_deck");
        if (stored) {
          setDeck(unpackDeck(JSON.parse(stored) as Deck));
          setLoading(false);
          return;
        }
      } catch {}
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
        setDeck(unpackDeck(data as Deck));
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

  const handleUpdateProgress = useCallback(
    async (newPercent: number) => {
      const target = Math.max(0, Math.min(100, Math.round(newPercent)));
      if (!deckId) return;
      try {
        localStorage.setItem(`loreno_progress_${deckId}`, String(target));
      } catch {}
      setDeck((prev) => (prev ? { ...prev, progress_percent: target } : null));
      if (!deckId.startsWith("demo-")) {
        try {
          await fetch("/api/decks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deckId, progress_percent: target }),
          });
        } catch (err) {
          console.error("Erreur maj progression dev test :", err);
        }
      }
    },
    [deckId]
  );

  const handleCompleteNode = useCallback(
    (node: PathNode) => {
      const calculatedPercent = Math.min(100, Math.round((node.stepNumber / 6) * 100));
      handleUpdateProgress(calculatedPercent);
    },
    [handleUpdateProgress]
  );

  if (loading) {
    return (
      <main className="min-h-[100dvh] w-full bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
        <p className="text-xs text-zinc-500 font-medium">Chargement du cours...</p>
      </main>
    );
  }

  if (!deck) return null;

  const sortedCards = [...(deck.flashcards || [])].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );
  const validImageUrl =
    deck.image_url && !deck.image_url.startsWith("blob:") ? deck.image_url : null;

  const markdownContent = deck.detailed_content?.trim() || (
    `# Fiche de Révision : ${deck.title}\n\n## 1. Synthèse du Cours\n${deck.summary || "Synthèse des notions essentielles du cours."}\n\n## 2. Notions Essentielles\n${
      sortedCards.length > 0
        ? sortedCards.map((f) => `- **${f.front}** : ${f.back}`).join("\n")
        : `- **Concept Principal** : Définition et mécanismes de base de **${deck.title}**.\n- **Méthodologie** : Méthode d'analyse et points d'attention aux partiels.`
    }\n\n## 3. Synthèse des Connaissances\nCette fiche est prête pour ton entraînement adaptatif.`
  );

  const notebookItem: NotebookItem = {
    id: deck.id,
    title: deck.title,
    subject: deck.subject || "Général",
    emoji: "📝",
    date: "Aujourd'hui",
    sourceCount: sortedCards.length,
    imageUrl: validImageUrl,
    detailed_content: deck.detailed_content,
    deck: {
      title: deck.title,
      subject: deck.subject || "Général",
      summary: deck.summary || "",
      detailed_content: deck.detailed_content || "",
      initial_quiz_question: deck.initial_quiz_question || "",
      initial_quiz_answer: deck.initial_quiz_answer || undefined,
      flashcards: sortedCards.map((f) => ({
        front: f.front,
        back: f.back,
        distractors: f.distractors,
      })),
    },
  };

  return (
    <main className="min-h-[100dvh] w-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between p-4 bg-background text-foreground">
        <Header
          backHref={showPathMap ? undefined : "/dashboard"}
          onBack={showPathMap ? () => setShowPathMap(false) : undefined}
          title={showPathMap ? "Parcours de révision" : "Fiche de Cours"}
          onOpenPaywall={() => setShowPaywall(true)}
        />

        <div className="flex-1 flex flex-col space-y-4 pb-28 pt-1 text-left">
          {showPathMap ? (
            <CoursePathMap
              deckId={deck.id}
              deckTitle={deck.title}
              subject={deck.subject}
              progressPercent={deck.progress_percent || 0}
              onSelectNode={(node) => setSelectedPathNode(node)}
              onStartNextNode={(stepNum) => router.push(`/review/${deck.id}?step=${stepNum || 1}`)}
              onUpdateProgress={showDevMode ? handleUpdateProgress : undefined}
              onOpenCourseSheet={() => setShowPathMap(false)}
            />
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 border-b border-zinc-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm">
                    {deck.subject || "Général"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-muted-foreground" />
                    Fiche complète
                  </span>
                  {typeof deck.progress_percent === "number" && deck.progress_percent > 0 && (
                    <Badge variant="success" size="sm">
                      {deck.progress_percent}% maîtrisé
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl font-black tracking-tight text-foreground leading-snug">
                  {deck.title}
                </h1>
              </div>

              <div
                onClick={() => setShowMirrorModal(true)}
                className="w-full p-3.5 sm:p-4 rounded-2xl bg-white border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.07)] hover:border-border transition-all duration-150 flex items-center justify-between cursor-pointer select-none active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand">
                    <Eye className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="text-left truncate">
                    <div className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate">
                      Notes manuscrites originales
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {validImageUrl
                        ? "Consulter la photo scannée & enrichir le cours"
                        : "Ajouter une photo ou un PDF pour enrichir ce cours"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-brand shrink-0 ml-2 bg-brand/10 hover:bg-brand/15 px-3 py-1.5 rounded-xl border border-brand/20">
                  <span>{validImageUrl ? "Voir" : "Ajouter"}</span>
                  <span className="text-[10px]">→</span>
                </div>
              </div>

              <Card className="p-4 sm:p-5 rounded-2xl">
                <MarkdownView content={markdownContent} />
              </Card>
            </div>
          )}
        </div>

        {!showPathMap && (
          <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] left-0 right-0 max-w-md mx-auto px-4 z-30 pointer-events-auto">
            <Button
              type="button"
              size="xl"
              onClick={() => setShowPathMap(true)}
              className="w-full h-14 rounded-full font-black text-sm sm:text-base gap-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] bg-neutral-900 border-t-2 border-white/30 border-b-4 border-b-black text-white hover:bg-neutral-800 active:border-b-0 active:translate-y-1 transition-all duration-100"
            >
              <Play className="w-4 h-4 fill-white text-white stroke-[3]" />
              <span className="tracking-wide">Démarrer l&apos;entraînement</span>
            </Button>
          </div>
        )}

        <PathNodeModal
          isOpen={Boolean(selectedPathNode)}
          node={selectedPathNode}
          onClose={() => setSelectedPathNode(null)}
          onStartSession={(node) => router.push(`/review/${deck.id}?step=${node?.stepNumber || 1}`)}
          onCompleteNode={showDevMode ? handleCompleteNode : undefined}
        />

        <MirrorModal
          isOpen={showMirrorModal}
          onClose={() => setShowMirrorModal(false)}
          imageUrl={validImageUrl}
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
        <main className="min-h-[100dvh] w-full bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-500 font-medium">Chargement du cours...</p>
        </main>
      }
    >
      <DeckPageInner params={params} />
    </Suspense>
  );
}
