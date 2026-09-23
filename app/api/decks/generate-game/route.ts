import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { DEMO_DECK, DEMO_FLASHCARDS } from "@/lib/demo-deck";

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
    const { deckId } = body;

    if (!deckId) {
      return NextResponse.json(
        { success: false, error: "deckId requis" },
        { status: 400 }
      );
    }

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

    const prompt = `Tu es le concepteur pédagogique d'élite de Loreno (https://www.loreno.app).
Tu reçois la fiche de révision complète du cours suivant :
- Matière : ${deck.subject || "Général"}
- Titre : ${deck.title}
- Fiche de cours :
${contentToAnalyze}

RÈGLE D'ÉTANCHÉITÉ STRICTE (CRITIQUE) :
- Tout le contenu (questions, réponses, distracteurs, pièges) doit être EXCLUSIVEMENT tiré de cette fiche de cours.
- Ne mélange aucun autre domaine de connaissances.

Génère entre 5 et 7 cartes d'apprentissage et 1 question piège d'examen en JSON STRICT avec ce schéma exact :
{
  "initial_quiz_question": "La question piège d'examen la plus probable sur ce cours",
  "flashcards": [
    {
      "front": "Question ou concept clé ?",
      "back": "Réponse synthétique et exacte",
      "distractors": [
        "Fausse réponse 1 (crédible, subtile et proche du sujet)",
        "Fausse réponse 2 (crédible, subtile et proche du sujet)",
        "Fausse réponse 3 (crédible, subtile et proche du sujet)"
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
      flashcards: [] as Array<{ front: string; back: string; distractors?: string[] }>,
    };

    try {
      const cleanedJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);
      if (Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
        parsedResult = parsed;
      }
    } catch (parseErr) {
      console.warn("Erreur parsing JSON génération leçon, fallback:", parseErr);
    }

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
        await admin
          .from("decks")
          .update({ initial_quiz_question: parsedResult.initial_quiz_question })
          .eq("id", deck.id);
      }
    }

    return NextResponse.json({
      success: true,
      flashcards: parsedResult.flashcards,
      initial_quiz_question: parsedResult.initial_quiz_question,
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
