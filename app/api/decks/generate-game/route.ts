import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { DEMO_DECK, DEMO_FLASHCARDS } from "@/lib/demo-deck";
import { deckGenerateGameSchema } from "@/lib/validations";
import { verifyAndAuditQuizContent } from "@/lib/ai-validator";
import { getAiVolumeTarget } from "@/lib/review-config";
import {
  CompatDeckLike,
  packFlashcardBack,
  packQuizFields,
  unpackDeck,
} from "@/lib/db-compat";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = deckGenerateGameSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "deckId requis ou invalide" },
        { status: 400 }
      );
    }

    const { deckId } = parseResult.data;

    if (deckId === "demo-droit-constitutionnel" || deckId === "demo") {
      return NextResponse.json({
        success: true,
        flashcards: DEMO_FLASHCARDS,
        initial_quiz_question: DEMO_DECK.initial_quiz_question,
        initial_quiz_answer: DEMO_DECK.initial_quiz_answer,
      });
    }

    const admin = getAdminClient();

    const { data: rawDeck, error: deckError } = await admin
      .from("decks")
      .select("*, flashcards(*)")
      .eq("id", deckId)
      .single();

    if (deckError || !rawDeck) {
      return NextResponse.json(
        { success: false, error: "Cours introuvable" },
        { status: 404 }
      );
    }

    const deck = unpackDeck(rawDeck as CompatDeckLike);

    if (deck.user_id) {
      try {
        const userClient = await createSupabaseServerClient();
        const { data: { user } } = await userClient.auth.getUser();
        if (!user || user.id !== deck.user_id) {
          return NextResponse.json(
            { success: false, error: "Accès refusé à ce cours" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Authentification requise" },
          { status: 401 }
        );
      }
    }

    if (Array.isArray(deck.flashcards) && deck.flashcards.length > 0 && deck.initial_quiz_answer) {
      return NextResponse.json({
        success: true,
        flashcards: deck.flashcards,
        initial_quiz_question: deck.initial_quiz_question,
        initial_quiz_answer: deck.initial_quiz_answer,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        flashcards: deck.flashcards?.length ? deck.flashcards : DEMO_FLASHCARDS,
        initial_quiz_question: deck.initial_quiz_question || DEMO_DECK.initial_quiz_question,
        initial_quiz_answer: deck.initial_quiz_answer || DEMO_DECK.initial_quiz_answer,
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const contentToAnalyze = deck.detailed_content || deck.summary || deck.title;
    const volumeTarget = getAiVolumeTarget(contentToAnalyze);

    const prompt = `Tu es le concepteur pédagogique d'élite de Loreno (https://www.loreno.app).
Tu reçois la fiche de révision complète du cours suivant :
- Matière : ${deck.subject || "Général"}
- Titre : ${deck.title}
- Fiche de cours :
${contentToAnalyze}

RÈGLES IMPÉRATIVES DE COHÉRENCE ET CAUSALITÉ STRICTE (CRITIQUE) :
1. ÉTANCHÉITÉ TOTALE : Tout le contenu doit être EXCLUSIVEMENT tiré de cette fiche de cours.
2. VALIDATION CAUSALE : Chaque réponse ("back", "initial_quiz_answer") doit répondre DIRECTEMENT, EXACTEMENT ET DE FAÇON PERTINENTE à la question posée ("front", "initial_quiz_question").
3. INTERDICTION DES ANACHRONISMES OU CONFUSIONS : Ne confonds jamais un fait déclencheur avec une réponse d'examen sur les politiques publiques ou conséquences.
4. DISTRACTEURS CRÉDIBLES ET INDÉPENDANTS : Les "distractors" doivent être 3 fausses réponses très crédibles et spécifiques à la question, JAMAIS de simples permutations d'autres questions sans rapport.
5. PROGRESSION CHRONOLOGIQUE STRICTE : Ordonne impérativement les flashcards selon le déroulé chronologique de la fiche de cours (1er tiers: bases, 2e tiers: mécanismes, 3e tiers: synthèse & pièges).
6. ORTHOGONALITÉ CONCEPTUELLE ABSOLUE (ZÉRO RÉPÉTITION) :
   - Chaque carte d'apprentissage DOIT couvrir un point du cours, un concept, une date ou un mécanisme PÉDAGOGIQUEMENT DISTINCT.
   - INTERDICTION FORMELLE de générer plusieurs cartes ayant la même réponse ("back") ou testant la même notion sous des formulations proches.
7. STRUCTURE EN 3 PARTIES DU CORRIGÉ D'EXAMEN ("initial_quiz_answer") :
   - Rédige impérativement "initial_quiz_answer" en 3 parties articulées :
     1) Analyse du 1er volet / Thèse A avec les concepts exacts du cours.
     2) Contrepoint / Thèse B introduit par "À l'inverse, ..." avec des exemples précis du cours.
     3) Synthèse finale introduite par "En somme, là où ..., ...".

VOLUMÉTRIE CIBLE ADAPTATIVE :
Génère entre ${volumeTarget.minCards} et ${volumeTarget.maxCards} cartes d'apprentissage (cible : ${volumeTarget.targetCount} cartes) et 1 question piège d'examen avec son corrigé structuré en 3 parties.`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            initial_quiz_question: { type: "STRING" },
            initial_quiz_answer: { type: "STRING" },
            flashcards: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  front: { type: "STRING" },
                  back: { type: "STRING" },
                  distractors: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                  },
                },
                required: ["front", "back", "distractors"],
              },
            },
          },
          required: ["initial_quiz_question", "initial_quiz_answer", "flashcards"],
        },
      },
    });

    let parsedResult = {
      initial_quiz_question: deck.initial_quiz_question || "Quel est le principe fondamental du cours ?",
      initial_quiz_answer: deck.initial_quiz_answer || "Consulte les notions clés de ta fiche de révision.",
      flashcards: (deck.flashcards || []) as Array<{ front: string; back: string; distractors?: string[] }>,
    };

    try {
      const rawText = (aiResponse.text || "").trim();
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
        parsedResult = {
          initial_quiz_question: parsed.initial_quiz_question || parsedResult.initial_quiz_question,
          initial_quiz_answer: parsed.initial_quiz_answer || parsedResult.initial_quiz_answer,
          flashcards: parsed.flashcards,
        };
      }
    } catch (parseErr) {
      console.warn("Erreur parsing JSON génération leçon, fallback:", parseErr);
    }

    parsedResult = await verifyAndAuditQuizContent(parsedResult, contentToAnalyze, apiKey);

    if (parsedResult.flashcards.length > 0) {
      await admin.from("flashcards").delete().eq("deck_id", deck.id);

      const fullCards = parsedResult.flashcards.map((c, idx) => ({
        deck_id: deck.id,
        front: c.front,
        back: c.back,
        distractors: c.distractors || [],
        order_index: idx,
      }));

      const insertTry = await admin.from("flashcards").insert(fullCards);
      if (insertTry.error && insertTry.error.code === "PGRST204") {
        const compatCards = parsedResult.flashcards.map((c, idx) => ({
          deck_id: deck.id,
          front: c.front,
          back: packFlashcardBack(c.back, c.distractors),
          order_index: idx,
        }));
        await admin.from("flashcards").insert(compatCards);
      }

      if (parsedResult.initial_quiz_question) {
        const { error: updateErr } = await admin
          .from("decks")
          .update({
            initial_quiz_question: parsedResult.initial_quiz_question,
            initial_quiz_answer: parsedResult.initial_quiz_answer,
          })
          .eq("id", deck.id);

        if (updateErr && updateErr.code === "PGRST204") {
          await admin
            .from("decks")
            .update({
              initial_quiz_question: packQuizFields(
                parsedResult.initial_quiz_question,
                parsedResult.initial_quiz_answer
              ),
            })
            .eq("id", deck.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      flashcards: parsedResult.flashcards,
      initial_quiz_question: parsedResult.initial_quiz_question,
      initial_quiz_answer: parsedResult.initial_quiz_answer,
    });
  } catch (error) {
    console.error("Erreur /api/decks/generate-game :", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne",
      },
      { status: 500 }
    );
  }
}
