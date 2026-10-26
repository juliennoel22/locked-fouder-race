import { NextRequest, NextResponse, after } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ScanResult, ScanApiResponse } from "@/types/loreno";
import { scanRequestSchema } from "@/lib/validations";
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";
import { generateDeckGameAsync } from "@/lib/eager-game-generator";
import { packSummaryFields } from "@/lib/db-compat";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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
Ta mission est de rédiger une FICHE DE RÉVISION HAUTE DENSITÉ AU STANDARD CLAUDE ARTIFACTS / OPENAI CANVAS.
RÈGLE D'ÉTANCHÉITÉ ET D'ISOLATION ABSOLUE : Analyse UNIQUEMENT le sujet réel du document fourni.
STANDARDS OBLIGATOIRES DE LA FICHE DANS "detailed_content" :
1. Big Picture & Définitions : Définitions exhaustives avec mots-clés en gras (**terme**).
2. Schéma Conceptuel ou Flux Logique : Inclus obligatoirement un schéma textuel/ASCII dans un bloc \`\`\`diagram ou \`\`\`text.
3. Tableau Comparatif Markdown : Inclus obligatoirement au moins un tableau comparatif (| Critère | Option A | Option B |).
4. Callouts Stratégiques Typés : Inclus obligatoirement au moins 2 callouts ('> ⚠️ **Point critique du barème** : ...', '> 💡 **Mémoire & mnémotechnique** : ...', '> 🎯 **Application directe** : ...').
5. Exhaustivité : Préserve formules, dates, auteurs et pièges.`;

async function uploadScansToStorage(
  userId: string,
  imagesList: Array<{ base64: string; mimeType: string; imageUrl?: string }>
): Promise<string[]> {
  const admin = getAdminClient();
  const resolvedUrls: string[] = [];

  for (let i = 0; i < imagesList.length; i++) {
    const doc = imagesList[i];
    if (doc.imageUrl && doc.imageUrl.startsWith("http") && !doc.imageUrl.startsWith("blob:")) {
      resolvedUrls.push(doc.imageUrl);
      continue;
    }

    const isPdf = doc.mimeType === "application/pdf" || doc.base64.startsWith("JVBERi");
    const ext = isPdf ? "pdf" : "jpg";
    const contentType = isPdf ? "application/pdf" : "image/jpeg";
    const storagePath = `${userId}/${Date.now()}-page-${i + 1}.${ext}`;

    try {
      const buffer = Buffer.from(doc.base64, "base64");
      const { error: uploadErr } = await admin.storage
        .from("course-scans")
        .upload(storagePath, buffer, { contentType, upsert: true });

      if (!uploadErr) {
        const { data: signedData } = await admin.storage
          .from("course-scans")
          .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
        if (signedData?.signedUrl) {
          resolvedUrls.push(signedData.signedUrl);
          continue;
        }
        const { data: pubData } = admin.storage.from("course-scans").getPublicUrl(storagePath);
        if (pubData?.publicUrl) {
          resolvedUrls.push(pubData.publicUrl);
          continue;
        }
      }
    } catch {}

    if (!isPdf && doc.base64.length < 600_000) {
      resolvedUrls.push(`data:${contentType};base64,${doc.base64}`);
    }
  }
  return resolvedUrls;
}

export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;
    let isProUser = false;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        const proUntilStr = user.user_metadata?.pro_until;
        const hasActiveTrial = typeof proUntilStr === "string" && new Date(proUntilStr).getTime() > Date.now();
        isProUser = Boolean(user.user_metadata?.is_pro) || hasActiveTrial;
      } else {
        const { data: claimsData } = await supabase.auth.getClaims();
        if (claimsData?.claims?.sub) userId = claimsData.claims.sub;
      }
    } catch {}

    const identifier = getClientIdentifier(request, userId);
    const rateLimitConfig = isProUser ? { limit: 30, windowSeconds: 600 } : { limit: 5, windowSeconds: 600 };
    const rlResult = await checkRateLimit(identifier, "api_scan", rateLimitConfig);
    if (!rlResult.success) return rateLimitResponse(rlResult);

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
            imagesList.push({ base64: rawBase64, mimeType: item.mimeType || "image/jpeg", imageUrl: item.imageUrl });
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
          imagesList.push({ base64: Buffer.from(bytes).toString("base64"), mimeType: file.type || "image/jpeg" });
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
        const inlineParts = imagesList.map((doc) => {
          const isPdf =
            doc.mimeType === "application/pdf" ||
            doc.base64.startsWith("JVBERi") ||
            (doc.imageUrl && doc.imageUrl.toLowerCase().includes(".pdf"));
          const finalMime = isPdf
            ? "application/pdf"
            : doc.mimeType && doc.mimeType.startsWith("image/")
            ? doc.mimeType
            : "image/jpeg";
          return { inlineData: { mimeType: finalMime, data: doc.base64 } };
        });

        const promptText = `${SYSTEM_PROMPT}${
          imagesList.length > 1
            ? `\n\nNOTE MULTI-PAGES HAUTE DENSITÉ (${imagesList.length} PAGES SCANNÉES) : Ne fais AUCUNE omission d'information entre la page 1 et la page ${imagesList.length}.`
            : ""
        }`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [{ text: promptText }, ...inlineParts],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                subject: { type: "STRING" },
                summary: { type: "STRING" },
                detailed_content: { type: "STRING" },
              },
              required: ["title", "subject", "summary", "detailed_content"],
            },
          },
        });

        const rawJson = (aiResponse.text || "").trim();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
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

    const storageUrls = await uploadScansToStorage(userId || "anon", imagesList);
    const primaryImageUrl = storageUrls[0] || undefined;

    let savedDeckId: string | undefined = undefined;
    if (userId) {
      try {
        const admin = getAdminClient();
        const firstTry = await admin
          .from("decks")
          .insert({
            user_id: userId,
            title: scanResult.title,
            subject: scanResult.subject,
            summary: scanResult.summary,
            detailed_content: scanResult.detailed_content || null,
            progress_percent: 0,
            image_url: primaryImageUrl || null,
          })
          .select("id")
          .single();

        let deckData = firstTry.data;
        let deckError = firstTry.error;

        if (deckError && deckError.code === "PGRST204") {
          const retryTry = await admin
            .from("decks")
            .insert({
              user_id: userId,
              title: scanResult.title,
              subject: scanResult.subject,
              summary: packSummaryFields(scanResult.summary, scanResult.detailed_content, 0),
              image_url: primaryImageUrl || null,
            })
            .select("id")
            .single();
          deckData = retryTry.data;
          deckError = retryTry.error;
        }

        if (!deckError && deckData) {
          savedDeckId = deckData.id;
          if (savedDeckId && apiKey) {
            const targetId = savedDeckId;
            after(async () => {
              await generateDeckGameAsync({
                deckId: targetId,
                title: scanResult.title,
                subject: scanResult.subject,
                content: scanResult.detailed_content || scanResult.summary || scanResult.title,
                apiKey,
              }).catch((e) => console.warn("Eager generation warning:", e));
            });
          }
        }
      } catch (dbError) {
        console.error("Note: Erreur enregistrement Supabase DB scan :", dbError);
      }
    }

    return NextResponse.json<ScanApiResponse>({
      success: true,
      deckId: savedDeckId,
      data: scanResult,
      imageUrl: primaryImageUrl,
      imageUrls: storageUrls,
    });
  } catch (error) {
    console.error("Erreur globale /api/scan :", error);
    return NextResponse.json<ScanApiResponse>(
      { success: false, error: error instanceof Error ? error.message : "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
