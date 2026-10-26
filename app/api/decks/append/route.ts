import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";
import { deckAppendSchema } from "@/lib/validations";
import { packSummaryFields, unpackDeck, CompatDeckLike } from "@/lib/db-compat";

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

    const proUntilStr = user.user_metadata?.pro_until;
    const hasActiveTrial = typeof proUntilStr === "string" && new Date(proUntilStr).getTime() > Date.now();
    const isProUser = Boolean(user.user_metadata?.is_pro) || hasActiveTrial;
    const identifier = getClientIdentifier(request, user.id);
    const rateLimitConfig = isProUser
      ? { limit: 30, windowSeconds: 600 }
      : { limit: 5, windowSeconds: 600 };

    const rlResult = await checkRateLimit(identifier, "api_append_deck", rateLimitConfig);
    if (!rlResult.success) {
      return rateLimitResponse(rlResult);
    }

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = deckAppendSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Données de la requête invalides" },
        { status: 400 }
      );
    }

    const { deckId, base64, mimeType, imageUrl, images = [] } = parseResult.data;

    // Utiliser select("*") et unpackDeck pour éviter l'erreur 42703/PGRST204 si detailed_content n'existe pas encore
    const { data: rawExistingDeck, error: deckErr } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .eq("user_id", user.id)
      .single();

    if (deckErr || !rawExistingDeck) {
      return NextResponse.json(
        { success: false, error: "Cours non trouvé ou accès non autorisé." },
        { status: 404 }
      );
    }

    const existingDeck = unpackDeck(rawExistingDeck as CompatDeckLike);

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
        const inlineParts = docList.map((doc) => {
          const isPdf =
            doc.mimeType === "application/pdf" || doc.base64.startsWith("JVBERi");
          const finalMime = isPdf
            ? "application/pdf"
            : (doc.mimeType?.startsWith("image/") ? doc.mimeType : "image/jpeg");
          return {
            inlineData: {
              mimeType: finalMime,
              data: doc.base64,
            },
          };
        });

        const promptText = `Tu es l'assistant pédagogique d'élite de Loreno (https://www.loreno.app).
Tu reçois de nouvelles pages/notes de cours à ajouter au cours existant suivant :
- Matière : ${existingDeck.subject || "Général"}
- Titre : ${existingDeck.title}
- Fiche de cours actuelle :
${existingDeck.detailed_content || existingDeck.summary || ""}

Mission :
Enrichis et mets à jour la FICHE DE COURS COMPLÈTE en Markdown en y intégrant harmonieusement les nouvelles notions, définitions et points clés des documents fournis, sans supprimer les acquis précédents.`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [{ text: promptText }, ...inlineParts],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                summary: { type: "STRING" },
                detailed_content: { type: "STRING" },
              },
              required: ["summary", "detailed_content"],
            },
          },
        });

        const rawJson = (aiResponse.text || "").trim();
        if (rawJson) {
          try {
            const parsed = JSON.parse(rawJson);
            if (parsed.detailed_content) {
              enrichedContent = parsed.detailed_content;
            }
            if (parsed.summary) {
              enrichedSummary = parsed.summary;
            }
          } catch (jsonErr) {
            console.warn("JSON extraction fallback in /api/decks/append :", jsonErr);
          }
        }
      } catch (geminiErr) {
        console.error("Erreur Gemini append deck :", geminiErr);
      }
    }

    let finalImageUrl =
      existingDeck.image_url && !existingDeck.image_url.startsWith("blob:")
        ? existingDeck.image_url
        : null;

    if (!finalImageUrl && docList[0]) {
      try {
        const admin = createSupabaseAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const firstDoc = docList[0];
        const isPdf = firstDoc.mimeType === "application/pdf" || firstDoc.base64.startsWith("JVBERi");
        const ext = isPdf ? "pdf" : "jpg";
        const contentType = isPdf ? "application/pdf" : "image/jpeg";
        const storagePath = `${user.id}/${deckId}-append-${Date.now()}.${ext}`;
        const { error: upErr } = await admin.storage
          .from("course-scans")
          .upload(storagePath, Buffer.from(firstDoc.base64, "base64"), { contentType, upsert: true });
        if (!upErr) {
          const { data: pub } = admin.storage.from("course-scans").getPublicUrl(storagePath);
          if (pub?.publicUrl) finalImageUrl = pub.publicUrl;
        }
      } catch {}
    }

    // Mise à jour de la fiche de cours dans Supabase avec fallback PGRST204
    const updateTry = await supabase
      .from("decks")
      .update({
        detailed_content: enrichedContent,
        summary: enrichedSummary,
        ...(finalImageUrl ? { image_url: finalImageUrl } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", deckId);

    if (updateTry.error && updateTry.error.code === "PGRST204") {
      const packedSummary = packSummaryFields(
        enrichedSummary,
        enrichedContent,
        existingDeck.progress_percent
      );
      await supabase
        .from("decks")
        .update({
          summary: packedSummary,
          ...(finalImageUrl ? { image_url: finalImageUrl } : {}),
        })
        .eq("id", deckId);
    }

    // Réinitialiser les flashcards pour régénération Just-in-Time au prochain jeu
    await supabase.from("flashcards").delete().eq("deck_id", deckId);

    return NextResponse.json({
      success: true,
      message: "Fiche de cours enrichie avec succès !",
      detailed_content: enrichedContent,
      summary: enrichedSummary,
      imageUrl: finalImageUrl,
    });
  } catch (error) {
    console.error("Erreur globale /api/decks/append :", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enrichissement du cours." },
      { status: 500 }
    );
  }
}
