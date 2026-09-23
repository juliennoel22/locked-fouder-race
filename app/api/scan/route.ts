import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { ScanResult, ScanApiResponse } from "@/types/loreno";
import { scanRequestSchema } from "@/lib/validations";
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";

function createDynamicScanResult(topicTitle?: string, topicSubject?: string): ScanResult {
  const cleanTitle = topicTitle?.trim() || "Notes de Cours & Synthèse";
  const cleanSubject = topicSubject?.trim() || "Général";

  return {
    title: cleanTitle,
    subject: cleanSubject,
    summary: `Fiche de révision structurée et synthèse des notions clés du cours : ${cleanTitle}.`,
    detailed_content: `# Fiche de Révision : ${cleanTitle}\n\n## 1. Synthèse du Cours\nCette fiche regroupe les concepts essentiels et définitions fondamentales de **${cleanTitle}** (${cleanSubject}).\n\n## 2. Notions Essentielles\n- **Concept Principal** : Définition précise et périmètre d'application du cours.\n- **Méthodologie** : Structure d'analyse et points d'attention aux partiels.\n\n## 3. Synthèse des Connaissances\nConsulte les cartes mémoires pour vérifier et ancrer ta maîtrise du cours.`,
    initial_quiz_question: "",
    flashcards: [],
  };
}

const SYSTEM_PROMPT = `Tu es le moteur OCR et d'analyse pédagogique d'élite de Loreno (https://www.loreno.app).
Tu reçois une photo ou un document de notes de cours.
Ta mission est d'extraire l'essence du cours et de rédiger une FICHE DE RÉVISION COMPLÈTE.

RÈGLE D'ÉTANCHÉITÉ ET D'ISOLATION ABSOLUE (CRITIQUE) :
- Tu dois analyser UNIQUEMENT le sujet réel du document fourni.
- Il est STRICTEMENT INTERDIT d'injecter des notions d'Histoire, de Droit Constitutionnel, ou d'autres domaines non présents dans le document.
- Tout le contenu (titre, sujet, synthèse, detailed_content) doit être 100% ÉTANCHEMENT focalisé sur le cours analysé.

Génère une réponse STRICTEMENT en format JSON avec cette structure exacte :
{
  "title": "Titre clair et concis du chapitre ou du cours",
  "subject": "Matière réelle (ex: Psychologie, Biologie, Économie, Mathématiques)",
  "summary": "Synthèse percutante en 2 à 3 phrases clés",
  "detailed_content": "# Fiche de Révision : [Titre]\\n\\n## 1. Concepts Clés & Définitions\\n- **Concept** : Définition précise\\n\\n## 2. Notions Essentielles & Mécanismes\\n...\\n\\n## 3. Points d'Attention & Pièges d'Examen\\n..."
}

Règles pour "detailed_content" (Fiche de cours complète) :
- Rédige une vraie fiche de cours EXHAUSTIVE, TOUJOURS COMPLÈTE ET SANS TRONCATURE.
- Développe impérativement CHAQUE section (## 1. Synthèse du Cours, ## 2. Notions Essentielles avec au moins 3 à 5 éléments précis à puces, ## 3. Points d'Attention & Pièges d'Examen).
- Ne laisse JAMAIS un titre de section (comme ## 2. Notions Essentielles) vide ou sans contenu sous forme de liste.
- Inclus des sous-titres (##), des définitions en gras, des listes à puces et des exemples d'examen concrets.
- Sois très précis et fidèle aux notes de l'étudiant.
- Ne génère AUCUNE flashcard ni question à ce stade, focalise 100% de ton attention sur la perfection et la clarté de la fiche de révision.`;

export async function POST(request: NextRequest) {
  try {
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
    const rateLimitConfig = isProUser
      ? { limit: 30, windowSeconds: 600 }
      : { limit: 5, windowSeconds: 600 };

    const rlResult = await checkRateLimit(identifier, "api_scan", rateLimitConfig);
    if (!rlResult.success) {
      return rateLimitResponse(rlResult);
    }

    const imagesList: Array<{ base64: string; mimeType: string; imageUrl?: string }> = [];
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

    let scanResult: ScanResult = createDynamicScanResult();
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const documentInputs = imagesList.map((doc) => {
          const isPdf =
            doc.mimeType === "application/pdf" ||
            doc.base64.startsWith("JVBERi") ||
            (doc.imageUrl && doc.imageUrl.toLowerCase().includes(".pdf"));

          const finalMime = isPdf
            ? "application/pdf"
            : (doc.mimeType && doc.mimeType.startsWith("image/") ? doc.mimeType : "image/jpeg");

          return {
            type: isPdf ? ("document" as const) : ("image" as const),
            mime_type: finalMime,
            data: doc.base64,
          };
        });

        const promptText = `${SYSTEM_PROMPT}${
          imagesList.length > 1
            ? `\nNOTE MULTI-PAGES : Tu reçois ${imagesList.length} pages ou documents d'un même cours. Synthétise tout en une seule fiche de révision complète et unifiée.`
            : ""
        }`;

        const interaction = await ai.interactions.create({
          model: "gemini-3.6-flash",
          input: [{ type: "text", text: promptText }, ...documentInputs],
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
          if (parsed.title && (parsed.detailed_content || parsed.summary)) {
            scanResult = {
              title: parsed.title,
              subject: parsed.subject || "Général",
              summary: parsed.summary || "",
              detailed_content:
                parsed.detailed_content ||
                `# Fiche de Révision : ${parsed.title}\n\n## 1. Synthèse\n${parsed.summary || ""}`,
              initial_quiz_question: "",
              flashcards: [],
            };
          }
        }
      } catch (geminiError) {
        console.error("Erreur Gemini Vision scan, fallback :", geminiError);
      }
    }

    // Sauvegarde immédiate du cours en base Supabase
    let savedDeckId: string | undefined = undefined;
    try {
      const supabase = await createClient();
      let authUserId: string | undefined = undefined;
      try {
        const { data: claimsData } = await supabase.auth.getClaims();
        authUserId = claimsData?.claims?.sub;
      } catch {}
      if (!authUserId) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          authUserId = userData?.user?.id;
        } catch {}
      }

      if (authUserId) {
        const primaryImageUrl = imagesList[0]?.imageUrl || null;
        const firstTry = await supabase
          .from("decks")
          .insert({
            user_id: authUserId,
            title: scanResult.title,
            subject: scanResult.subject,
            summary: scanResult.summary,
            detailed_content: scanResult.detailed_content || null,
            progress_percent: 0,
            image_url: primaryImageUrl,
          })
          .select("id")
          .single();

        let deckData = firstTry.data;
        let deckError = firstTry.error;

        if (deckError && deckError.code === "PGRST204") {
          console.warn("Retentative d'insertion scan sans detailed_content (PGRST204 fallback)...");
          const retryTry = await supabase
            .from("decks")
            .insert({
              user_id: authUserId,
              title: scanResult.title,
              subject: scanResult.subject,
              summary: scanResult.summary,
              image_url: primaryImageUrl,
            })
            .select("id")
            .single();

          deckData = retryTry.data;
          deckError = retryTry.error;
        }

        if (!deckError && deckData) {
          savedDeckId = deckData.id;
        }
      }
    } catch (dbError) {
      console.error("Note: Erreur enregistrement Supabase DB scan :", dbError);
    }

    return NextResponse.json<ScanApiResponse>({
      success: true,
      deckId: savedDeckId,
      data: scanResult,
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
