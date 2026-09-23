import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getAuthUser(request: NextRequest, supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const { data: userData, error } = await supabase.auth.getUser();
    if (userData?.user) return userData.user;
    if (error && (error.status === 429 || (error as any)?.code === "over_request_rate_limit")) {
      const { data: claimsData } = await supabase.auth.getClaims();
      if (claimsData?.claims?.sub) return { id: claimsData.claims.sub } as { id: string; email?: string };
    }
  } catch {}

  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { data: tokenUserData } = await supabase.auth.getUser(authHeader.replace("Bearer ", "").trim());
      if (tokenUserData?.user) return tokenUserData.user;
    } catch {}
  }

  try {
    const { data: claimsData } = await supabase.auth.getClaims();
    if (claimsData?.claims?.sub) return { id: claimsData.claims.sub } as { id: string; email?: string };
  } catch {}

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(request, supabase);
    if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

    const admin = getAdminClient();
    const { data: decks, error } = await admin
      .from("decks")
      .select("*, flashcards(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération decks Supabase :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, decks: decks || [] });
  } catch (err) {
    console.error("Erreur GET /api/decks :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(request, supabase);
    if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

    const body = await request.json();
    const { title, subject, summary, detailed_content, progress_percent, initial_quiz_question, image_url, flashcards = [] } = body;

    const admin = getAdminClient();

    let deck: any = null;
    let deckError: any = null;

    const initialInsert = await admin
      .from("decks")
      .insert({
        user_id: user.id,
        title: title || "Cours sans titre",
        subject: subject || "Général",
        summary: summary || null,
        detailed_content: detailed_content || null,
        progress_percent: typeof progress_percent === "number" ? progress_percent : 0,
        initial_quiz_question: initial_quiz_question || null,
        image_url: image_url || null,
      })
      .select("id, created_at, user_id, title, subject, summary, progress_percent, initial_quiz_question, image_url")
      .single();

    deck = initialInsert.data;
    deckError = initialInsert.error;

    if (deckError && deckError.code === "PGRST204") {
      console.warn("Retentative d'insertion sans detailed_content (PGRST204 fallback)...");
      const fallbackInsert = await admin
        .from("decks")
        .insert({
          user_id: user.id,
          title: title || "Cours sans titre",
          subject: subject || "Général",
          summary: summary || null,
          initial_quiz_question: initial_quiz_question || null,
          image_url: image_url || null,
        })
        .select("id, created_at, user_id, title, subject, summary, initial_quiz_question, image_url")
        .single();

      deck = fallbackInsert.data;
      deckError = fallbackInsert.error;
    }

    if (deckError || !deck) {
      console.error("Erreur insertion deck :", deckError);
      return NextResponse.json({ success: false, error: deckError?.message || "Erreur création cours" }, { status: 500 });
    }

    let insertedCards: any[] = [];
    if (Array.isArray(flashcards) && flashcards.length > 0) {
      const cardsToInsert = flashcards.map((c: { front: string; back: string }, idx: number) => ({
        deck_id: deck.id,
        front: c.front,
        back: c.back,
        order_index: idx,
      }));

      const { data: cards, error: cardsError } = await admin
        .from("flashcards")
        .insert(cardsToInsert)
        .select();

      if (cardsError) console.error("Erreur insertion flashcards :", cardsError);
      else insertedCards = cards || [];
    }

    return NextResponse.json({
      success: true,
      deck: { ...deck, flashcards: insertedCards },
    });
  } catch (err) {
    console.error("Erreur POST /api/decks :", err);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(request, supabase);
    if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID du cours manquant" }, { status: 400 });

    const admin = getAdminClient();
    const { error } = await admin.from("decks").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      console.error("Erreur suppression deck :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur DELETE /api/decks :", err);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(request, supabase);
    if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

    const body = await request.json();
    const { id, progress_percent, detailed_content } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID du cours manquant" }, { status: 400 });

    const updatePayload: Record<string, unknown> = {};
    if (typeof progress_percent === "number") {
      updatePayload.progress_percent = Math.max(0, Math.min(100, Math.round(progress_percent)));
    }
    if (typeof detailed_content === "string") {
      updatePayload.detailed_content = detailed_content;
    }
    updatePayload.updated_at = new Date().toISOString();

    const admin = getAdminClient();
    const { data: updatedDeck, error } = await admin
      .from("decks")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, progress_percent, detailed_content, updated_at")
      .single();

    if (error) {
      console.error("Erreur PATCH /api/decks :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deck: updatedDeck });
  } catch (err) {
    console.error("Erreur interne PATCH /api/decks :", err);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
