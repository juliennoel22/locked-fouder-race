import { GoogleGenAI } from "@google/genai";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { getAiVolumeTarget } from "./review-config";
import { verifyAndAuditQuizContent } from "./ai-validator";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface EagerGenerationParams {
  deckId: string;
  title: string;
  subject?: string;
  content: string;
  apiKey: string;
}

/**
 * Génération anticipée en tâche de fond (FEAT-017)
 * Permet d'alimenter les flashcards dès la fin du scan pour une latence perçue de 0ms sur la roadmap.
 */
export async function generateDeckGameAsync({
  deckId,
  title,
  subject,
  content,
  apiKey,
}: EagerGenerationParams): Promise<void> {
  if (!deckId || !apiKey || !content?.trim()) return;

  const admin = getAdminClient();

  // Vérifier si des flashcards existent déjà
  const { data: existing } = await admin
    .from("flashcards")
    .select("id")
    .eq("deck_id", deckId)
    .limit(1);

  if (Array.isArray(existing) && existing.length > 0) return;

  const volumeTarget = getAiVolumeTarget(content);
  const prompt = `Tu es le concepteur pédagogique d'élite de Loreno (https://www.loreno.app).
Tu reçois la fiche de révision complète du cours suivant :
- Matière : ${subject || "Général"}
- Titre : ${title}
- Fiche de cours :
${content}

RÈGLES IMPÉRATIVES DE COHÉRENCE ET CAUSALITÉ STRICTE (CRITIQUE) :
1. ÉTANCHÉITÉ TOTALE : Tout le contenu doit être EXCLUSIVEMENT tiré de cette fiche de cours.
2. VALIDATION CAUSALE : Chaque réponse ("back", "initial_quiz_answer") doit répondre DIRECTEMENT, EXACTEMENT ET DE FAÇON PERTINENTE à la question posée ("front", "initial_quiz_question").
3. INTERDICTION DES ANACHRONISMES OU CONFUSIONS : Ne confonds jamais un fait déclencheur avec une réponse d'examen sur les politiques publiques ou conséquences.
4. DISTRACTEURS CRÉDIBLES ET INDÉPENDANTS : Les distracteurs doivent être des fausses réponses crédibles et spécifiques.
5. PROGRESSION CHRONOLOGIQUE STRICTE : Ordonne les flashcards du début à la fin de la fiche (1er tiers: bases, 2e tiers: mécanismes, 3e tiers: synthèse & pièges).

VOLUMÉTRIE CIBLE ADAPTATIVE :
Génère entre ${volumeTarget.minCards} et ${volumeTarget.maxCards} cartes d'apprentissage (cible : ${volumeTarget.targetCount} cartes) et 1 question piège d'examen avec sa réponse exacte.`;

  const ai = new GoogleGenAI({ apiKey });
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

  const rawText = (aiResponse.text || "").trim();
  if (!rawText) return;

  const parsed = JSON.parse(rawText);
  let finalResult = {
    initial_quiz_question: parsed.initial_quiz_question || "Quel est le point central du cours ?",
    initial_quiz_answer: parsed.initial_quiz_answer || "Consulte ta fiche de cours.",
    flashcards: parsed.flashcards || [],
  };

  // Critic Guardrail
  finalResult = await verifyAndAuditQuizContent(finalResult, content, apiKey);

  if (Array.isArray(finalResult.flashcards) && finalResult.flashcards.length > 0) {
    const cardsToInsert = finalResult.flashcards.map((c, idx) => ({
      deck_id: deckId,
      front: c.front,
      back: c.back,
      order_index: idx,
    }));

    await admin.from("flashcards").insert(cardsToInsert);

    if (finalResult.initial_quiz_question) {
      try {
        await admin
          .from("decks")
          .update({
            initial_quiz_question: finalResult.initial_quiz_question,
            initial_quiz_answer: finalResult.initial_quiz_answer,
          })
          .eq("id", deckId);
      } catch {
        await admin
          .from("decks")
          .update({ initial_quiz_question: finalResult.initial_quiz_question })
          .eq("id", deckId);
      }
    }
  }
}
