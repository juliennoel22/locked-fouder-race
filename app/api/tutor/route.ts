import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

interface TutorMessage {
  role: "user" | "model";
  text: string;
}

interface TutorRequest {
  title: string;
  subject: string;
  summary: string;
  flashcards?: Array<{ front: string; back: string }>;
  messages: TutorMessage[];
}

import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";

import { tutorRequestSchema } from "@/lib/validations";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = tutorRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || "Payload de requête Tuteur invalide";
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const { title, subject, summary, flashcards, messages } = parseResult.data;

    const isProUser = Boolean(user?.user_metadata?.is_pro);

    // Rate Limiting : 10 messages/10 min (Freemium/IP), 60 messages/10 min (Pro)
    const identifier = getClientIdentifier(request, user?.id);
    const rateLimitConfig = isProUser
      ? { limit: 60, windowSeconds: 600 }
      : { limit: 10, windowSeconds: 600 };

    const rlResult = await checkRateLimit(identifier, "api_tutor", rateLimitConfig);
    if (!rlResult.success) {
      return rateLimitResponse(rlResult);
    }

    if (!isProUser && messages.length > 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Fonctionnalité réservée aux membres Premium. Débloque ton accès illimité !",
          requiresPro: true,
        },
        { status: 403 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          reply: "Configuration API manquante. Mode démonstration actif : concentre-toi sur les concepts clés !",
        },
        { status: 200 }
      );
    }

    // Format top flashcards as prompt context to ground the LLM in course material
    const cardsContext = flashcards
      .slice(0, 8)
      .map((c, i) => `[Carte ${i + 1}] Q: ${c.front} | R: ${c.back}`)
      .join("\n");

    const systemPrompt = `Tu es l'Assistant IA d'Examen et Tuteur personnel de Loreno (https://www.loreno.app).
Tu accompagnes un étudiant qui révise ses partiels et examens sur le cours suivant :
- Matière : ${subject || "Générale"}
- Titre du cours : ${title || "Notes de cours"}
- Synthèse du cours : ${summary || "Non renseigné"}
- Cartes clés :
${cardsContext}

Directives pédagogiques impératives :
1. Réponds de façon concise, dynamique, ultra-pédagogique et percutante (1 à 3 paragraphes max).
2. Donne des exemples concrets ou des moyens mnémotechniques pour retenir les notions.
3. Termine par une micro-question piège d'examen pour vérifier si l'étudiant a bien compris.`;

    const ai = new GoogleGenAI({ apiKey });

    // Build chronological conversation history
    const historyText = messages
      .map((m) => `${m.role === "user" ? "Étudiant" : "Tuteur"}: ${m.text}`)
      .join("\n\n");

    const prompt = `${systemPrompt}\n\nHistorique de la conversation :\n${historyText}\n\nTuteur:`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
    });

    let reply = "";
    for (const step of interaction.steps || []) {
      if ("content" in step && Array.isArray(step.content)) {
        for (const c of step.content) {
          if (c && typeof c === "object" && "text" in c && typeof c.text === "string") {
            reply += c.text;
          }
        }
      }
    }

    if (!reply) {
      reply = `Excellente question sur ${title}. Retiens avant tout les points de synthèse et prépare-toi à argumenter avec précision le jour de l'épreuve !`;
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    // Non-blocking fallback to protect student revision flow during rate limits or transient outages
    console.error("Note: Erreur Tutor API / Rate Limit, utilisation du fallback :", error);
    return NextResponse.json({
      success: true,
      reply: "Pour réussir ton examen sur ce cours, concentre-toi sur les concepts clés des flashcards et la structure des définitions fondamentales. N'hésite pas à relancer une question précise !",
    });
  }
}
