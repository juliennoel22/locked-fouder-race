import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { referralClaimSchema } from "@/lib/validations";

interface ReferralProfile {
  id?: string;
  user_id?: string;
  referral_code: string;
  invited_count: number;
  pro_days_earned: number;
  balance_cents: number;
  total_earned_cents: number;
  iban?: string | null;
}

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
    let referral: ReferralProfile | null = null;

    try {
      const { data: dbRef } = await admin
        .from("user_referrals")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (dbRef) referral = dbRef as ReferralProfile;
    } catch {}

    if (!referral) {
      const userMeta = user.user_metadata || {};
      let refCode = userMeta.referral_code;

      if (!refCode) {
        refCode = generateReferralCode(user.email);
        try {
          await admin.auth.admin.updateUserById(user.id, {
            user_metadata: { ...userMeta, referral_code: refCode },
          });
        } catch {}
      }

      try {
        const { data: created } = await admin
          .from("user_referrals")
          .insert({
            user_id: user.id,
            referral_code: refCode,
            invited_count: Number(userMeta.invited_count || 0),
            pro_days_earned: Number(userMeta.pro_days_earned || 0),
            balance_cents: Number(userMeta.balance_cents || 0),
            total_earned_cents: Number(userMeta.total_earned_cents || 0),
          })
          .select("*")
          .single();
        if (created) referral = created as ReferralProfile;
      } catch {}

      if (!referral) {
        referral = {
          referral_code: refCode,
          invited_count: Number(userMeta.invited_count || 0),
          pro_days_earned: Number(userMeta.pro_days_earned || 0),
          balance_cents: Number(userMeta.balance_cents || 0),
          total_earned_cents: Number(userMeta.total_earned_cents || 0),
          iban: userMeta.iban || null,
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
        invited_count: Number(referral.invited_count || 0),
        pro_days_earned: Number(referral.pro_days_earned || 0),
        balance_cents: Number(referral.balance_cents || 0),
        total_earned_cents: Number(referral.total_earned_cents || 0),
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
    const parseResult = referralClaimSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: "Code d'affiliation requis ou invalide" }, { status: 400 });
    }

    const cleanCode = parseResult.data.refCode.trim().toUpperCase().replace(/\s+/g, "-");
    const admin = getAdminClient();

    let referrer: ReferralProfile | null = null;

    try {
      const { data: dbReferrer } = await admin
        .from("user_referrals")
        .select("*")
        .eq("referral_code", cleanCode)
        .single();
      if (dbReferrer) referrer = dbReferrer as ReferralProfile;
    } catch {}

    if (!referrer) {
      const { data: usersData } = await admin.auth.admin.listUsers();
      const matchedUser = usersData?.users?.find(
        (u) => u.user_metadata?.referral_code?.toUpperCase() === cleanCode
      );

      if (matchedUser) {
        referrer = {
          user_id: matchedUser.id,
          referral_code: cleanCode,
          invited_count: Number(matchedUser.user_metadata?.invited_count || 0),
          pro_days_earned: Number(matchedUser.user_metadata?.pro_days_earned || 0),
          balance_cents: Number(matchedUser.user_metadata?.balance_cents || 0),
          total_earned_cents: Number(matchedUser.user_metadata?.total_earned_cents || 0),
        };
      }
    }

    if (!referrer) {
      return NextResponse.json({ success: false, error: "Code d'affiliation invalide" }, { status: 404 });
    }

    if (referrer.user_id === user.id) {
      return NextResponse.json({ success: false, error: "Vous ne pouvez pas parrainer votre propre compte" }, { status: 400 });
    }

    if (user.user_metadata?.referred_by) {
      return NextResponse.json({
        success: true,
        alreadyReferred: true,
        proUntil: user.user_metadata.pro_until || null,
        message: "Ce compte bénéficie déjà d'un parrainage actif.",
      });
    }

    const newCount = (Number(referrer.invited_count) || 0) + 1;
    let earnedDays = Number(referrer.pro_days_earned) || 0;

    if (newCount % 5 === 0) {
      earnedDays += 3;
    }

    try {
      await admin
        .from("user_referrals")
        .update({
          invited_count: newCount,
          pro_days_earned: earnedDays,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", referrer.user_id!);
    } catch {}

    try {
      const { data: targetUserData } = await admin.auth.admin.getUserById(referrer.user_id!);
      if (targetUserData?.user) {
        const targetMeta = targetUserData.user.user_metadata || {};
        const updatedReferrerMeta: Record<string, unknown> = {
          ...targetMeta,
          invited_count: newCount,
          pro_days_earned: earnedDays,
        };

        if (newCount % 5 === 0) {
          const currentReferrerUntil = targetMeta.pro_until
            ? new Date(String(targetMeta.pro_until)).getTime()
            : 0;
          const baseTime = Math.max(Date.now(), Number.isNaN(currentReferrerUntil) ? 0 : currentReferrerUntil);
          updatedReferrerMeta.pro_until = new Date(baseTime + 3 * 24 * 60 * 60 * 1000).toISOString();
        }

        await admin.auth.admin.updateUserById(referrer.user_id!, {
          user_metadata: updatedReferrerMeta,
        });
      }
    } catch {}

    const existingRefereeUntil = user.user_metadata?.pro_until
      ? new Date(String(user.user_metadata.pro_until)).getTime()
      : 0;
    const refereeBaseTime = Math.max(Date.now(), Number.isNaN(existingRefereeUntil) ? 0 : existingRefereeUntil);
    const proUntil = new Date(refereeBaseTime + 3 * 24 * 60 * 60 * 1000).toISOString();
    const isAlreadyPaidPro = Boolean(
      user.user_metadata?.is_pro &&
        (user.user_metadata?.plan === "fondateur" || user.user_metadata?.stripe_session_id)
    );

    try {
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          is_pro: isAlreadyPaidPro,
          pro_until: proUntil,
          referred_by: cleanCode,
        },
      });
    } catch (e) {
      console.warn("Could not update user metadata in referral POST:", e);
    }

    return NextResponse.json({
      success: true,
      proUntil,
      message: "Lien d'affiliation appliqué avec succès ! Vous bénéficiez de 3 jours Pro offerts.",
    });
  } catch (err) {
    console.error("Erreur POST /api/referral :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
