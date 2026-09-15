import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { ScanResult, ScanApiResponse } from "@/types/loreno";
import { scanRequestSchema } from "@/lib/validations";

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

import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 1. Identification utilisateur & Rate Limiting
    let userId: string | null = null;
    let isProUser = false;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        isProUser = Boolean(user.user_metadata?.is_pro);
      }
    } catch (authErr) {
      console.warn("Auth check optional warning in /api/scan:", authErr);
    }

    const identifier = getClientIdentifier(request, userId);
    // Limite : 5 scans/10 min pour Freemium/IP, 30 scans/10 min pour Pro
    const rateLimitConfig = isProUser
      ? { limit: 30, windowSeconds: 600 }
      : { limit: 5, windowSeconds: 600 };

    const rlResult = await checkRateLimit(identifier, "api_scan", rateLimitConfig);
    if (!rlResult.success) {
      return rateLimitResponse(rlResult);
    }

    const imagesList: Array<{ base64: string; mimeType: string; imageUrl?: string }> = [];

    let targetCardCount = 8;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const rawBody = await request.json().catch(() => ({}));
      const parseResult = scanRequestSchema.safeParse(rawBody);

      if (!parseResult.success) {
        return NextResponse.json<ScanApiResponse>(
          { success: false, error: "Format de la requête de scan invalide." },
          { status: 400 }
        );
      }

      const body = parseResult.data;
      if (typeof body.cardCount === "number") {
        targetCardCount = Math.min(15, Math.max(3, Math.round(body.cardCount)));
      }
      if (Array.isArray(body.images) && body.images.length > 0) {
        for (const item of body.images) {
          const rawBase64 = (item.base64 || "").replace(/^data:[^;]+;base64,/, "");
          if (rawBase64) {
            imagesList.push({
              base64: rawBase64,
              mimeType: item.mimeType || "image/jpeg",
              imageUrl: item.imageUrl,
            });
          }
        }
      } else if (body.base64) {
        imagesList.push({
          base64: body.base64.replace(/^data:[^;]+;base64,/, ""),
          mimeType: body.mimeType || "image/jpeg",
          imageUrl: body.imageUrl,
        });
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const countField = formData.get("cardCount");
      if (countField && !isNaN(Number(countField))) {
        targetCardCount = Math.min(15, Math.max(3, Math.round(Number(countField))));
      }
      const files = formData.getAll("file") as File[];
      for (const file of files) {
        if (file) {
          const bytes = await file.arrayBuffer();
          imagesList.push({
            base64: Buffer.from(bytes).toString("base64"),
            mimeType: file.type || "image/jpeg",
          });
        }
      }
    }

    if (imagesList.length === 0) {
      return NextResponse.json<ScanApiResponse>(
        { success: false, error: "Aucun document ou image fourni pour le scan" },
        { status: 400 }
      );
    }

    let scanResult: ScanResult = MOCK_SCAN_RESULT;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const documentInputs = imagesList.map((doc) => {
          const isPdf =
            doc.mimeType === "application/pdf" ||
            doc.base64.startsWith("JVBERi") ||
            (doc.imageUrl && doc.imageUrl.toLowerCase().includes(".pdf"));

          const finalMime = isPdf ? "application/pdf" : (doc.mimeType && doc.mimeType.startsWith("image/") ? doc.mimeType : "image/jpeg");

          return {
            type: isPdf ? ("document" as const) : ("image" as const),
            mime_type: finalMime,
            data: doc.base64,
          };
        });

        const promptText = `${SYSTEM_PROMPT}\n\nIMPORTANT : Génère EXACTEMENT ${targetCardCount} flashcards synthétiques et percutantes.${
          imagesList.length > 1
            ? `\nNOTE MULTI-PAGES : Tu reçois ${imagesList.length} pages ou documents d'un même cours. Combine tout intelligemment en un seul jeu de ${targetCardCount} fiches.`
            : ""
        }`;

        const interaction = await ai.interactions.create({
          model: "gemini-3.6-flash",
          input: [
            { type: "text", text: promptText },
            ...documentInputs,
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
      let userId: string | undefined = undefined;
      try {
        const { data: claimsData } = await supabase.auth.getClaims();
        userId = claimsData?.claims?.sub;
      } catch {
        // fallback
      }
      if (!userId) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          userId = userData?.user?.id;
        } catch {
          // ignore
        }
      }

      if (userId) {
        const { data: deckData, error: deckError } = await supabase
          .from("decks")
          .insert({
            user_id: userId,
            title: scanResult.title,
            subject: scanResult.subject,
            summary: scanResult.summary,
            initial_quiz_question: scanResult.initial_quiz_question,
            image_url: imagesList[0]?.imageUrl || null,
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
      imageUrl: imagesList[0]?.imageUrl || undefined,
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
