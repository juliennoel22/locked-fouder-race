import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { reviewLogSchema, type ReviewLogInput } from "@/lib/validations";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = reviewLogSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: "Payload invalide" }, { status: 400 });
    }

    const { deckId, logs } = parseResult.data;
    if (deckId.startsWith("demo-")) {
      return NextResponse.json({ success: true, count: logs.length });
    }

    const admin = getAdminClient();
    const rowsToInsert = logs.map((l: ReviewLogInput["logs"][number]) => ({
      user_id: user.id,
      deck_id: deckId,
      card_front: l.cardFront,
      rating: l.rating,
      step_number: l.stepNumber || 1,
    }));

    try {
      await admin.from("review_logs").insert(rowsToInsert);
    } catch (dbErr) {
      // Fallback gracieux si la table distante n'est pas encore migrée
      console.warn("review_logs insertion fallback:", dbErr);
    }

    return NextResponse.json({ success: true, count: rowsToInsert.length });
  } catch (error) {
    console.error("Erreur /api/review/log :", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    const deckId = request.nextUrl.searchParams.get("deckId");

    if (!user || !deckId || deckId.startsWith("demo-")) {
      return NextResponse.json({ success: true, weakCards: [] });
    }

    const admin = getAdminClient();
    try {
      const { data, error } = await admin
        .from("review_logs")
        .select("card_front, rating, created_at")
        .eq("user_id", user.id)
        .eq("deck_id", deckId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error || !data) {
        return NextResponse.json({ success: true, weakCards: [] });
      }

      // Extraire les cartes où le dernier log est 'again' (cartes faibles récentes)
      const latestRatingByCard = new Map<string, string>();
      for (const row of data) {
        if (!latestRatingByCard.has(row.card_front)) {
          latestRatingByCard.set(row.card_front, row.rating);
        }
      }

      const weakCards = Array.from(latestRatingByCard.entries())
        .filter(([, rating]) => rating === "again")
        .map(([front]) => front);

      return NextResponse.json({ success: true, weakCards });
    } catch {
      return NextResponse.json({ success: true, weakCards: [] });
    }
  } catch {
    return NextResponse.json({ success: true, weakCards: [] });
  }
}
