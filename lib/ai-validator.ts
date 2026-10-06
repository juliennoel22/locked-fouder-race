import { GoogleGenAI } from "@google/genai";

export interface VerifiedQuizPayload {
  initial_quiz_question: string;
  initial_quiz_answer: string;
  flashcards: Array<{
    front: string;
    back: string;
    distractors?: string[];
  }>;
}

/**
 * Audit & Auto-Correction Critic Layer for Loreno AI
 * Prevents hallucinations, causal incoherence, and mismatch between questions and answers.
 */
export async function verifyAndAuditQuizContent(
  candidate: VerifiedQuizPayload,
  sourceText: string,
  apiKey?: string
): Promise<VerifiedQuizPayload> {
  let audited = { ...candidate };

  // 1. Programmatic Sanity Clean-up
  audited.flashcards = (audited.flashcards || []).filter((card) => {
    if (!card.front?.trim() || !card.back?.trim()) return false;
    // Discard identical Q&A
    if (card.front.trim().toLowerCase() === card.back.trim().toLowerCase()) return false;
    return true;
  });

  // Ensure distractors don't contain the correct answer
  audited.flashcards = audited.flashcards.map((card) => ({
    ...card,
    distractors: (card.distractors || []).filter(
      (d) => d.trim().toLowerCase() !== card.back.trim().toLowerCase()
    ),
  }));

  // 2. High-speed LLM Critic Pass (Temperature 0 for Fact-Checking & Causal Verification)
  if (apiKey && sourceText?.trim() && audited.flashcards.length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const criticPrompt = `Tu es l'Inspecteur Qualité & Fact-Checker IA de Loreno.
Ton rôle unique est de VÉRIFIER ET CORRIGER la cohérence causale des quiz générés par rapport au cours source.

SOURCE DU COURS :
${sourceText.slice(0, 4000)}

CANDIDAT À AUDITER :
${JSON.stringify(audited, null, 2)}

CONSIGNES DE VALIDATION STRICTES :
1. VÉRIFIE la question piège ("initial_quiz_question") et sa réponse ("initial_quiz_answer") :
   - Si la question demande la RÉACTION, la POLITIQUE ou les CONSÉQUENCES d'un événement, la réponse DOIT être cette réaction ou politique, et NON PAS la date ou le fait déclencheur !
   - Si la réponse est incohérente, CORRIGE la réponse pour qu'elle réponde exactement à la question.
2. VÉRIFIE chaque flashcard :
   - Assure-toi que la réponse ("back") répond DIRECTEMENT à la question ("front").
   - Nettoie les distracteurs pour qu'ils soient tous pertinents et distincts de la réponse exacte.

Renvoie le JSON AUDITÉ ET CORRIGÉ STRICTEMENT sous le même format JSON sans aucun texte supplémentaire.`;

      const interaction = await ai.interactions.create({
        model: "gemini-3.6-flash",
        input: criticPrompt,
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

      if (rawJson) {
        const cleanJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
        const verifiedParsed = JSON.parse(cleanJson);
        if (Array.isArray(verifiedParsed.flashcards) && verifiedParsed.flashcards.length > 0) {
          audited = {
            initial_quiz_question: verifiedParsed.initial_quiz_question || audited.initial_quiz_question,
            initial_quiz_answer: verifiedParsed.initial_quiz_answer || audited.initial_quiz_answer,
            flashcards: verifiedParsed.flashcards,
          };
        }
      }
    } catch (criticErr) {
      console.warn("Audit Critic non-bloquant (fallback sur vérification programmatique):", criticErr);
    }
  }

  return audited;
}
