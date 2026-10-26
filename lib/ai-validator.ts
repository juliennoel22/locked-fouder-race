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

  // 1. Programmatic Sanity Clean-up & Anti-Duplicate Guardrail
  const seenFronts = new Set<string>();
  const seenBacks = new Set<string>();
  audited.flashcards = (audited.flashcards || []).filter((card) => {
    if (!card.front?.trim() || !card.back?.trim()) return false;
    if (card.front.trim().toLowerCase() === card.back.trim().toLowerCase()) return false;

    const frontKey = card.front.trim().toLowerCase().replace(/[^a-z0-9à-ÿ]/g, "");
    const backKey = card.back.trim().toLowerCase().replace(/[^a-z0-9à-ÿ]/g, "");
    if (seenFronts.has(frontKey) || seenBacks.has(backKey)) return false;
    seenFronts.add(frontKey);
    seenBacks.add(backKey);

    return true;
  });

  audited.flashcards = audited.flashcards.map((card) => ({
    ...card,
    distractors: (card.distractors || []).filter(
      (d) => d.trim().toLowerCase() !== card.back.trim().toLowerCase()
    ),
  }));

  // 2. High-speed LLM Critic Pass with structured responseSchema
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
   - Formate obligatoirement "initial_quiz_answer" selon une structure argumentative en 3 parties :
     1) Analyse du 1er volet / Thèse A.
     2) Contrepoint / Thèse B ("À l'inverse, ...") avec des exemples précis du cours.
     3) Synthèse ("En somme, là où ..., ...").
2. VÉRIFIE chaque flashcard :
   - Assure-toi que la réponse ("back") répond DIRECTEMENT à la question ("front").
   - Nettoie les distracteurs pour qu'ils soient 3 fausses réponses pertinentes et distinctes de la réponse exacte.
3. VÉRIFIE l'orthogonalité et la diversité (ZÉRO RÉPÉTITION) :
   - Assure-toi qu'aucune carte ne répète la même notion ou réponse qu'une autre. Chaque carte doit être unique.

Renvoie le JSON AUDITÉ ET CORRIGÉ STRICTEMENT sous le même format JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: criticPrompt,
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

      const rawJson = (response.text || "").trim();
      if (rawJson) {
        const verifiedParsed = JSON.parse(rawJson);
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
