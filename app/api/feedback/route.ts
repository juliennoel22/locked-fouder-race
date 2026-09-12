import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface FeedbackPayload {
  email?: string;
  message: string;
  rating?: number;
  tag?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: FeedbackPayload = await request.json();
    const { email, message, rating, tag } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Le message ne peut pas être vide." },
        { status: 400 }
      );
    }

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanMessage = message.trim();
    const cleanTag = tag || "Avis général";
    const cleanRating = typeof rating === "number" ? rating : null;

    // Structured logging for Vercel Runtime Logs
    console.log("📝 [LORENO FEEDBACK]", {
      email: cleanEmail || "anonyme",
      tag: cleanTag,
      rating: cleanRating,
      message: cleanMessage,
      receivedAt: new Date().toISOString(),
    });

    // 1. Enregistrement de secours dans Supabase si la table feedback existe
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      try {
        const admin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        await admin.from("feedback").insert({
          email: cleanEmail || null,
          message: cleanMessage,
          rating: cleanRating,
          tag: cleanTag,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("Notice insertion Supabase feedback :", dbErr);
      }
    }

    // 2. Envoi par email direct à julien.n2208@gmail.com via FormSubmit
    try {
      const emailResponse = await fetch(
        "https://formsubmit.co/ajax/julien.n2208@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Origin: "https://www.loreno.app",
            Referer: "https://www.loreno.app/dashboard",
          },
          body: JSON.stringify({
            _subject: `💬 Nouvel avis Loreno [${cleanTag}] - ${cleanEmail || "Étudiant"}`,
            _template: "table",
            Email: cleanEmail || "Non communiqué",
            Catégorie: cleanTag,
            Note: cleanRating ? `${cleanRating} / 5 ⭐` : "Non notée",
            Message: cleanMessage,
            Date: new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" }),
          }),
        }
      );

      const emailResult = await emailResponse.json().catch(() => ({}));
      console.log("Résultat envoi email feedback :", emailResponse.status, emailResult);
    } catch (mailErr) {
      console.error("Erreur transmission email feedback :", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Merci pour ton retour ! Julien a bien reçu ton message.",
    });
  } catch (err) {
    console.error("Erreur route /api/feedback :", err);
    return NextResponse.json(
      { success: false, error: "Impossible d'envoyer le message." },
      { status: 500 }
    );
  }
}
