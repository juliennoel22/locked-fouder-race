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

function generateReferralCode(email?: string): string {
  const prefix = email ? email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) : "LORENO";
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}-${randomStr}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const admin = getAdminClient();
    let { data: referral, error } = await admin
      .from("user_referrals")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !referral) {
      // Génération automatique du profil d'affiliation si inexistant
      const newCode = generateReferralCode(user.email);
      const { data: created, error: createErr } = await admin
        .from("user_referrals")
        .insert({
          user_id: user.id,
          referral_code: newCode,
          invited_count: 0,
          pro_days_earned: 0,
          balance_cents: 0,
          total_earned_cents: 0,
        })
        .select("*")
        .single();

      if (!createErr && created) {
        referral = created;
      } else {
        referral = {
          referral_code: newCode,
          invited_count: 0,
          pro_days_earned: 0,
          balance_cents: 0,
          total_earned_cents: 0,
          iban: null,
        };
      }
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://loreno.app";
    const referralLink = `${origin}?ref=${referral.referral_code}`;

    return NextResponse.json({
      success: true,
      data: {
        referral_code: referral.referral_code,
        referral_link: referralLink,
        invited_count: referral.invited_count || 0,
        pro_days_earned: referral.pro_days_earned || 0,
        balance_cents: referral.balance_cents || 0,
        total_earned_cents: referral.total_earned_cents || 0,
        iban: referral.iban || null,
      },
    });
  } catch (err) {
    console.error("Erreur GET /api/referral :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { refCode } = body;

    if (!refCode || typeof refCode !== "string") {
      return NextResponse.json({ success: false, error: "Code d'affiliation requis" }, { status: 400 });
    }

    const admin = getAdminClient();

    // Récupération du parrain
    const { data: referrer, error: refErr } = await admin
      .from("user_referrals")
      .select("*")
      .eq("referral_code", refCode.trim().toUpperCase())
      .single();

    if (refErr || !referrer) {
      return NextResponse.json({ success: false, error: "Code d'affiliation invalide" }, { status: 404 });
    }

    if (referrer.user_id === user.id) {
      return NextResponse.json({ success: false, error: "Vous ne pouvez pas parrainer votre propre compte" }, { status: 400 });
    }

    // Incrémenter le nombre d'invités du parrain
    const newCount = (referrer.invited_count || 0) + 1;
    let earnedDays = referrer.pro_days_earned || 0;

    // Déblocage 3 jours Pro tous les 5 potes invités
    if (newCount % 5 === 0) {
      earnedDays += 3;
    }

    await admin
      .from("user_referrals")
      .update({
        invited_count: newCount,
        pro_days_earned: earnedDays,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", referrer.user_id);

    return NextResponse.json({
      success: true,
      message: "Lien d'affiliation appliqué avec succès ! Vous et votre parrain bénéficiez des avantages Loreno Pro.",
    });
  } catch (err) {
    console.error("Erreur POST /api/referral :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
