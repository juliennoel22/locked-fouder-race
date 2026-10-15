import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { DEMO_DECK, DEMO_FLASHCARDS } from "@/lib/demo-deck";
import { deckGenerateGameSchema } from "@/lib/validations";
import { verifyAndAuditQuizContent } from "@/lib/ai-validator";
import { getAiVolumeTarget } from "@/lib/review-config";

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

    // Cas Démo Deck
    if (deckId === "demo-droit-constitutionnel" || deckId === "demo") {
      return NextResponse.json({
        success: true,
        flashcards: DEMO_FLASHCARDS,
        initial_quiz_question: DEMO_DECK.initial_quiz_question,
      });
    }

    const admin = getAdminClient();

    // 1. Récupération du deck et de ses flashcards existantes
    const { data: deck, error: deckError } = await admin
      .from("decks")
      .select("*, flashcards(*)")
      .eq("id", deckId)
      .single();

    if (deckError || !deck) {
      return NextResponse.json(
        { success: false, error: "Cours introuvable" },
        { status: 404 }
      );
    }

    // Si les flashcards existent déjà en base, on les retourne directement (zéro latence)
    if (Array.isArray(deck.flashcards) && deck.flashcards.length > 0) {
      return NextResponse.json({
        success: true,
        flashcards: deck.flashcards,
        initial_quiz_question: deck.initial_quiz_question,
      });
    }

    // 2. Génération Just-in-Time par Gemini (Première fois que l'étudiant joue)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        flashcards: DEMO_FLASHCARDS,
        initial_quiz_question: deck.initial_quiz_question || "Quel est le point central de ce cours ?",
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
3. INTERDICTION DES ANACHRONISMES OU CONFUSIONS : Ne confonds jamais un fait déclencheur (ex: date d'un krach boursier) avec une réponse d'examen sur les politiques publiques ou conséquences. Si la question porte sur une politique ou un principe, la réponse doit être ce principe précis et non une date ou un lieu.
4. DISTRACTEURS CRÉDIBLES ET INDÉPENDANTS : Les "distractors" doivent être des fausses réponses très crédibles et spécifiques à la question, JAMAIS de simples permutations d'autres questions sans rapport.
5. PROGRESSION CHRONOLOGIQUE STRICTE : Ordonne impérativement les flashcards selon le déroulé chronologique de la fiche de cours :
   - Début du tableau (1er tiers) : Définitions et concepts fondateurs de départ.
   - Milieu du tableau (2e tiers) : Mécanismes d'articulation, processus et cas types.
   - Fin du tableau (3e tiers) : Synthèse avancée, applications et pièges d'examen.

VOLUMÉTRIE CIBLE ADAPTATIVE :
Génère entre ${volumeTarget.minCards} et ${volumeTarget.maxCards} cartes d'apprentissage (cible : ${volumeTarget.targetCount} cartes) et 1 question piège d'examen avec sa réponse exacte en JSON STRICT avec ce schéma :
{
  "initial_quiz_question": "La question piège d'examen la plus probable sur ce cours",
  "initial_quiz_answer": "La réponse exacte, directe et précise correspondant exactement à cette question piège",
  "flashcards": [
    {
      "front": "Question ou concept clé ?",
      "back": "Réponse synthétique et exacte répondant directement à la question",
      "distractors": [
        "Fausse réponse 1 crédible et spécifique",
        "Fausse réponse 2 crédible et spécifique",
        "Fausse réponse 3 crédible et spécifique"
      ]
    }
  ]
}`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
    });

    let rawJson = "";
    for (const step of interaction.steps || []) {
      if ("content" in step && Array.isArray(step.content)) {
        for (const c of step.content) {
          if (c && typeof c === "object" && "text" in c && typeof c.text === "string") {
            rawJson += c.text;
          }
        }
      }
    }

    let parsedResult = {
      initial_quiz_question: deck.initial_quiz_question || "Quel est le principe fondamental du cours ?",
      initial_quiz_answer: (deck as { initial_quiz_answer?: string }).initial_quiz_answer || "Consulte les notions clés de ta fiche de révision.",
      flashcards: [] as Array<{ front: string; back: string; distractors?: string[] }>,
    };

    try {
      const cleanedJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);
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

    // 2.5 Passe de validation & contrôle causale IA (Critic Guardrail)
    parsedResult = await verifyAndAuditQuizContent(parsedResult, contentToAnalyze, apiKey);

    // 3. Sauvegarde en BDD des flashcards générées
    if (parsedResult.flashcards.length > 0) {
      const cardsToInsert = parsedResult.flashcards.map((c, idx) => ({
        deck_id: deck.id,
        front: c.front,
        back: c.back,
        order_index: idx,
      }));

      await admin.from("flashcards").insert(cardsToInsert);

      if (parsedResult.initial_quiz_question) {
        try {
          await admin
            .from("decks")
            .update({
              initial_quiz_question: parsedResult.initial_quiz_question,
              initial_quiz_answer: parsedResult.initial_quiz_answer,
            })
            .eq("id", deck.id);
        } catch {
          await admin
            .from("decks")
            .update({ initial_quiz_question: parsedResult.initial_quiz_question })
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
