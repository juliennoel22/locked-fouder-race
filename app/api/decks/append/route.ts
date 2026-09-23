import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const appendDeckSchema = z.object({
  deckId: z.string().uuid("ID de cours invalide"),
  base64: z.string().optional(),
  mimeType: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z
    .array(
      z.object({
        base64: z.string().optional(),
        mimeType: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Vous devez être connecté pour enrichir un cours." },
        { status: 401 }
      );
    }

    const isProUser = Boolean(user.user_metadata?.is_pro);
    const identifier = getClientIdentifier(request, user.id);
    const rateLimitConfig = isProUser
      ? { limit: 30, windowSeconds: 600 }
      : { limit: 5, windowSeconds: 600 };

    const rlResult = await checkRateLimit(identifier, "api_append_deck", rateLimitConfig);
    if (!rlResult.success) {
      return rateLimitResponse(rlResult);
    }

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = appendDeckSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Données de la requête invalides" },
        { status: 400 }
      );
    }

    const { deckId, base64, mimeType, imageUrl, images = [] } = parseResult.data;

    // Récupérer le deck existant
    const { data: existingDeck, error: deckErr } = await supabase
      .from("decks")
      .select("id, title, subject, summary, detailed_content, image_url")
      .eq("id", deckId)
      .eq("user_id", user.id)
      .single();

    if (deckErr || !existingDeck) {
      return NextResponse.json(
        { success: false, error: "Cours non trouvé ou accès non autorisé." },
        { status: 404 }
      );
    }

    const docList: Array<{ base64: string; mimeType: string; imageUrl?: string }> = [];

    if (images.length > 0) {
      for (const item of images) {
        if (item.base64) {
          docList.push({
            base64: item.base64.replace(/^data:[^;]+;base64,/, ""),
            mimeType: item.mimeType || "image/jpeg",
            imageUrl: item.imageUrl,
          });
        }
      }
    } else if (base64) {
      docList.push({
        base64: base64.replace(/^data:[^;]+;base64,/, ""),
        mimeType: mimeType || "image/jpeg",
        imageUrl,
      });
    }

    if (docList.length === 0) {
      return NextResponse.json(
        { success: false, error: "Aucun document fourni à analyser." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let enrichedContent = existingDeck.detailed_content || "";
    let enrichedSummary = existingDeck.summary || "";

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const documentInputs = docList.map((doc) => {
          const isPdf =
            doc.mimeType === "application/pdf" || doc.base64.startsWith("JVBERi");
          return {
            type: isPdf ? ("document" as const) : ("image" as const),
            mime_type: isPdf ? "application/pdf" : (doc.mimeType?.startsWith("image/") ? doc.mimeType : "image/jpeg"),
            data: doc.base64,
          };
        });

        const promptText = `Tu es l'assistant pédagogique d'élite de Loreno (https://www.loreno.app).
Tu reçois de nouvelles pages/notes de cours à ajouter au cours existant suivant :
- Matière : ${existingDeck.subject || "Général"}
- Titre : ${existingDeck.title}
- Fiche de cours actuelle :
${existingDeck.detailed_content || existingDeck.summary || ""}

Mission :
Enrichis et mets à jour la FICHE DE COURS COMPLÈTE en Markdown en y intégrant harmonieusement les nouvelles notions, définitions et points clés des documents fournis, sans supprimer les acquis précédents.
Réponds STRICTEMENT en JSON :
{
  "summary": "Synthèse globale actualisée du cours complet",
  "detailed_content": "Fiche de cours complète en Markdown, structurée avec sous-titres ##, puces et définitions en gras"
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
          if (parsed.detailed_content) {
            enrichedContent = parsed.detailed_content;
          }
          if (parsed.summary) {
            enrichedSummary = parsed.summary;
          }
        }
      } catch (geminiErr) {
        console.error("Erreur Gemini append deck :", geminiErr);
      }
    }

    // Mise à jour de la fiche de cours dans Supabase
    await supabase
      .from("decks")
      .update({
        detailed_content: enrichedContent,
        summary: enrichedSummary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deckId);

    // Réinitialiser les flashcards pour régénération Just-in-Time au prochain jeu
    await supabase.from("flashcards").delete().eq("deck_id", deckId);

    return NextResponse.json({
      success: true,
      message: "Fiche de cours enrichie avec succès !",
      detailed_content: enrichedContent,
      summary: enrichedSummary,
    });
  } catch (error) {
    console.error("Erreur globale /api/decks/append :", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enrichissement du cours." },
      { status: 500 }
    );
  }
}
