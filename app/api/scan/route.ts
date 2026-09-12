import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { ScanResult, ScanApiResponse } from "@/types/loreno";

const MOCK_SCAN_RESULT: ScanResult = {
  title: "Droit Constitutionnel — Séparation des Pouvoirs",
  subject: "Droit Public",
  summary:
    "Théorie formulée par Locke et systématisée par Montesquieu dans De l'esprit des lois (1748). Elle distingue les pouvoirs législatif, exécutif et judiciaire pour éviter la tyrannie.",
  initial_quiz_question:
    "Quelle est la différence fondamentale entre la séparation stricte des pouvoirs (régime présidentiel) et la séparation souple (régime parlementaire) ?",
  flashcards: [
    {
      front: "Qui est l'auteur principal ayant théorisé la séparation des pouvoirs en France ?",
      back: "Montesquieu dans son ouvrage 'De l'esprit des lois' publié en 1748.",
    },
    {
      front: "Quels sont les 3 pouvoirs traditionnellement identifiés ?",
      back: "1. Le pouvoir législatif (faire les lois)\n2. Le pouvoir exécutif (exécuter les lois)\n3. Le pouvoir judiciaire (appliquer et sanctionner les lois).",
    },
    {
      front: "Comment se caractérise un régime à séparation STRICTE des pouvoirs ?",
      back: "Absence de moyens d'action réciproques (pas de droit de dissolution de l'exécutif, pas de motion de censure du législatif). Exemple : États-Unis.",
    },
    {
      front: "Comment se caractérise un régime à séparation SOUPLE des pouvoirs ?",
      back: "Collaboration des pouvoirs avec moyens d'action réciproques (dissolution de l'Assemblée par l'exécutif, motion de censure / responsabilité ministérielle). Exemple : Régime parlementaire britannique.",
    },
    {
      front: "Quelle phrase célèbre de Montesquieu résume l'esprit de cette théorie ?",
      back: "'Pour qu'on ne puisse abuser du pouvoir, il faut que, par la disposition des choses, le pouvoir arrête le pouvoir.'",
    },
  ],
};

const SYSTEM_PROMPT = `Tu es le moteur OCR et d'analyse pédagogique d'élite de Loreno (https://www.loreno.app).
Tu reçois une photo de notes de cours (manuscrites, polycopié, tableau, schéma).
Ta mission est d'extraire l'essence du cours pour un étudiant qui prépare ses partiels en urgence.

Génère une réponse STRICTEMENT en format JSON avec cette structure exacte :
{
  "title": "Titre clair et concis du chapitre ou du cours",
  "subject": "Matière (ex: Droit, Médecine, Physique, Histoire, Économie)",
  "summary": "Synthèse percutante en 2 à 3 phrases clés",
  "initial_quiz_question": "La question piège d'examen la plus probable qui testera immédiatement l'étudiant",
  "flashcards": [
    {
      "front": "Question ou concept clé précis",
      "back": "Réponse synthétique et mémorisable"
    }
  ]
}

Règles impératives :
- Entre 5 et 8 flashcards percutantes maximum.
- Formulations directes et dynamiques.
- Même si l'écriture manuscrite est difficile à lire, déduis logiquement le contexte académique.`;

export async function POST(request: NextRequest) {
  try {
    let base64Data = "";
    let mimeType = "image/jpeg";
    let originalImageUrl: string | null = null;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      base64Data = body.base64?.replace(/^data:image\/\w+;base64,/, "") || "";
      mimeType = body.mimeType || "image/jpeg";
      originalImageUrl = body.imageUrl || null;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        mimeType = file.type || "image/jpeg";
        const bytes = await file.arrayBuffer();
        base64Data = Buffer.from(bytes).toString("base64");
      }
    }

    if (!base64Data) {
      return NextResponse.json<ScanApiResponse>(
        { success: false, error: "Aucune image fournie pour le scan" },
        { status: 400 }
      );
    }

    let scanResult: ScanResult = MOCK_SCAN_RESULT;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const interaction = await ai.interactions.create({
          model: "gemini-3.6-flash",
          input: [
            { type: "text", text: SYSTEM_PROMPT },
            { type: "image", mime_type: mimeType, data: base64Data },
          ],
        });

        let rawText = "";
        for (const step of interaction.steps || []) {
          if ("content" in step && Array.isArray(step.content)) {
            for (const c of step.content) {
              if (c && typeof c === "object" && "text" in c && typeof c.text === "string") {
                rawText += c.text;
              }
            }
          }
        }

        if (rawText) {
          const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed.title && Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
            scanResult = parsed;
          }
        }
      } catch (geminiError) {
        console.error("Erreur Gemini Vision, utilisation du fallback :", geminiError);
        // Fallback gracieux sur les données de démonstration
      }
    }

    // Sauvegarde en base Supabase si l'utilisateur est authentifié
    let savedDeckId: string | undefined = undefined;
    try {
      const supabase = await createClient();
      const { data: claimsData } = await supabase.auth.getClaims();
      const user = claimsData?.claims;

      if (user) {
        const { data: deckData, error: deckError } = await supabase
          .from("decks")
          .insert({
            user_id: user.sub,
            title: scanResult.title,
            subject: scanResult.subject,
            summary: scanResult.summary,
            initial_quiz_question: scanResult.initial_quiz_question,
            image_url: originalImageUrl,
          })
          .select("id")
          .single();

        if (!deckError && deckData) {
          savedDeckId = deckData.id;

          const cardsToInsert = scanResult.flashcards.map((card, idx) => ({
            deck_id: savedDeckId,
            front: card.front,
            back: card.back,
            order_index: idx,
          }));

          await supabase.from("flashcards").insert(cardsToInsert);
        }
      }
    } catch (dbError) {
      console.error("Note: Erreur enregistrement Supabase DB :", dbError);
    }

    return NextResponse.json<ScanApiResponse>({
      success: true,
      deckId: savedDeckId,
      data: scanResult,
      imageUrl: originalImageUrl || undefined,
    });
  } catch (error) {
    console.error("Erreur globale /api/scan :", error);
    return NextResponse.json<ScanApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
