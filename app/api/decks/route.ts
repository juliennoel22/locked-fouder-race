import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { deckCreateSchema, deckUpdateSchema } from "@/lib/validations";
import {
  packFlashcardBack,
  packQuizFields,
  packSummaryFields,
  unpackDeck,
  unpackFlashcard,
} from "@/lib/db-compat";

interface FlashcardRecord {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  distractors?: string[];
  order_index: number;
}

interface DeckRecord {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  subject: string;
  summary: string | null;
  detailed_content?: string | null;
  progress_percent?: number | null;
  initial_quiz_question: string | null;
  initial_quiz_answer?: string | null;
  image_url: string | null;
  flashcards?: FlashcardRecord[];
}

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
    if (error && (error.status === 429 || (error as { code?: string })?.code === "over_request_rate_limit")) {
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

    const unpackedDecks = (decks || []).map((d) => unpackDeck(d as DeckRecord));
    return NextResponse.json({ success: true, decks: unpackedDecks });
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

    const body = await request.json().catch(() => ({}));
    const parseResult = deckCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Données de cours invalides", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const {
      title,
      subject,
      summary,
      detailed_content,
      progress_percent,
      initial_quiz_question,
      initial_quiz_answer,
      image_url,
      flashcards,
    } = parseResult.data;

    const cleanImageUrl = image_url && !image_url.startsWith("blob:") ? image_url : null;
    const admin = getAdminClient();

    const initialInsert = await admin
      .from("decks")
      .insert({
        user_id: user.id,
        title: title || "Cours sans titre",
        subject: subject || "Général",
        summary: summary || null,
        detailed_content: detailed_content || null,
        progress_percent: progress_percent ?? 0,
        initial_quiz_question: initial_quiz_question || null,
        initial_quiz_answer: initial_quiz_answer || null,
        image_url: cleanImageUrl,
      })
      .select("*")
      .single();

    let deck = (initialInsert.data as DeckRecord) || null;
    let deckError = initialInsert.error;

    if (deckError && deckError.code === "PGRST204") {
      const fallbackInsert = await admin
        .from("decks")
        .insert({
          user_id: user.id,
          title: title || "Cours sans titre",
          subject: subject || "Général",
          summary: packSummaryFields(summary, detailed_content, progress_percent ?? 0),
          initial_quiz_question: packQuizFields(initial_quiz_question, initial_quiz_answer),
          image_url: cleanImageUrl,
        })
        .select("*")
        .single();

      deck = (fallbackInsert.data as DeckRecord) || null;
      deckError = fallbackInsert.error;
    }

    if (deckError || !deck) {
      return NextResponse.json({ success: false, error: deckError?.message || "Erreur création cours" }, { status: 500 });
    }

    let insertedCards: FlashcardRecord[] = [];
    if (flashcards && flashcards.length > 0) {
      const fullCards = flashcards.map((c, idx) => ({
        deck_id: deck!.id,
        front: c.front,
        back: c.back,
        distractors: c.distractors || [],
        order_index: idx,
      }));

      const firstCardsTry = await admin.from("flashcards").insert(fullCards).select();
      if (firstCardsTry.error && firstCardsTry.error.code === "PGRST204") {
        const compatCards = flashcards.map((c, idx) => ({
          deck_id: deck!.id,
          front: c.front,
          back: packFlashcardBack(c.back, c.distractors),
          order_index: idx,
        }));
        const retryCards = await admin.from("flashcards").insert(compatCards).select();
        if (!retryCards.error && retryCards.data) {
          insertedCards = (retryCards.data as FlashcardRecord[]).map((c) => unpackFlashcard(c));
        }
      } else if (!firstCardsTry.error && firstCardsTry.data) {
        insertedCards = (firstCardsTry.data as FlashcardRecord[]).map((c) => unpackFlashcard(c));
      }
    }

    return NextResponse.json({ success: true, deck: unpackDeck({ ...deck, flashcards: insertedCards }) });
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

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID du cours manquant" }, { status: 400 });

    const admin = getAdminClient();
    const { error } = await admin.from("decks").delete().eq("id", id).eq("user_id", user.id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

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

    const body = await request.json().catch(() => ({}));
    const parseResult = deckUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: "Données de mise à jour invalides" }, { status: 400 });
    }

    const { id, progress_percent, detailed_content } = parseResult.data;
    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof progress_percent === "number") {
      updatePayload.progress_percent = Math.max(0, Math.min(100, Math.round(progress_percent)));
    }
    if (typeof detailed_content === "string") {
      updatePayload.detailed_content = detailed_content;
    }

    const admin = getAdminClient();
    const { data: updatedDeck, error } = await admin
      .from("decks")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST204") {
        const { data: currentRow } = await admin.from("decks").select("*").eq("id", id).eq("user_id", user.id).single();
        if (!currentRow) return NextResponse.json({ success: false, error: "Cours introuvable" }, { status: 404 });

        const packedSummary = packSummaryFields(currentRow.summary, detailed_content, progress_percent);
        const fallbackUpdate = await admin
          .from("decks")
          .update({ summary: packedSummary })
          .eq("id", id)
          .eq("user_id", user.id)
          .select("*")
          .single();

        const targetRow = (fallbackUpdate.data as DeckRecord) || { ...(currentRow as DeckRecord), summary: packedSummary };
        return NextResponse.json({ success: true, deck: unpackDeck(targetRow) });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const unpacked = unpackDeck(updatedDeck as DeckRecord);
    if (typeof progress_percent === "number") unpacked.progress_percent = Math.max(0, Math.min(100, Math.round(progress_percent)));
    return NextResponse.json({ success: true, deck: unpacked });
  } catch (err) {
    console.error("Erreur interne PATCH /api/decks :", err);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
