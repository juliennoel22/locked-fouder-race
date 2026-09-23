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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { iban } = body;

    if (!iban || typeof iban !== "string" || iban.trim().length < 10) {
      return NextResponse.json({ success: false, error: "Veuillez fournir un IBAN valide pour le virement" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: referral, error: refErr } = await admin
      .from("user_referrals")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (refErr || !referral) {
      return NextResponse.json({ success: false, error: "Profil d'affiliation non trouvé" }, { status: 404 });
    }

    const MIN_PAYOUT_CENTS = 7000; // 70,00 € minimum
    if ((referral.balance_cents || 0) < MIN_PAYOUT_CENTS) {
      return NextResponse.json({
        success: false,
        error: `Solde insuffisant (${((referral.balance_cents || 0) / 100).toFixed(2)} €). Le seuil minimum pour débloquer un virement est de 70,00 €.`,
      }, { status: 400 });
    }

    const payoutAmount = referral.balance_cents;

    // 1. Enregistrer la demande de virement bancaire
    const { error: payoutErr } = await admin
      .from("payout_requests")
      .insert({
        user_id: user.id,
        amount_cents: payoutAmount,
        iban: iban.trim().toUpperCase(),
        status: "pending",
      });

    if (payoutErr) {
      console.error("Erreur création demande de virement :", payoutErr);
      return NextResponse.json({ success: false, error: payoutErr.message }, { status: 500 });
    }

    // 2. Déduire le solde et enregistrer l'IBAN
    await admin
      .from("user_referrals")
      .update({
        balance_cents: 0,
        iban: iban.trim().toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      message: `Demande de virement de ${(payoutAmount / 100).toFixed(2)} € transmise avec succès ! Traitement sous 48h vers ${iban.trim().toUpperCase()}.`,
    });
  } catch (err) {
    console.error("Erreur POST /api/referral/payout :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
