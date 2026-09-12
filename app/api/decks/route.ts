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
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) return userData.user;
  } catch {
    // fallback
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    try {
      const { data: tokenUserData } = await supabase.auth.getUser(token);
      if (tokenUserData?.user) return tokenUserData.user;
    } catch {
      // fallback
    }
  }

  try {
    const { data: claimsData } = await supabase.auth.getClaims();
    if (claimsData?.claims?.sub) {
      return { id: claimsData.claims.sub } as { id: string; email?: string };
    }
  } catch {
    // fallback
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(request, supabase);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const admin = getAdminClient();
    const { data: decks, error } = await admin
      .from("decks")
      .select("*, flashcards(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération decks Supabase :", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, decks: decks || [] });
  } catch (err) {
    console.error("Erreur GET /api/decks :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(request, supabase);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      subject,
      summary,
      initial_quiz_question,
      image_url,
      flashcards,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Le titre est requis" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    // 1. Insertion du deck
    const { data: deck, error: deckError } = await admin
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

    if (deckError || !deck) {
      console.error("Erreur insertion deck :", deckError);
      return NextResponse.json(
        { success: false, error: deckError?.message || "Erreur création carnet" },
        { status: 500 }
      );
    }

    // 2. Insertion des flashcards associées si présentes
    let savedFlashcards: Array<{ id: string; front: string; back: string; order_index: number }> = [];
    if (Array.isArray(flashcards) && flashcards.length > 0) {
      const cardsToInsert = flashcards.map((c: { front: string; back: string }, idx: number) => ({
        deck_id: deck.id,
        front: c.front,
        back: c.back,
        order_index: idx,
      }));

      const { data: insertedCards, error: cardError } = await admin
        .from("flashcards")
        .insert(cardsToInsert)
        .select("id, front, back, order_index");

      if (cardError) {
        console.error("Erreur insertion flashcards :", cardError);
      } else if (insertedCards) {
        savedFlashcards = insertedCards;
      }
    }

    return NextResponse.json({
      success: true,
      deck: {
        ...deck,
        flashcards: savedFlashcards,
      },
    });
  } catch (err) {
    console.error("Erreur POST /api/decks :", err);
    return NextResponse.json(
      { success: false, error: "Erreur interne" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(request, supabase);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID du carnet manquant" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const { error } = await admin
      .from("decks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erreur suppression deck :", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur DELETE /api/decks :", err);
    return NextResponse.json(
      { success: false, error: "Erreur interne" },
      { status: 500 }
    );
  }
}
