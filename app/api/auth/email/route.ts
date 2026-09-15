import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface OnboardingPayload {
  step?: number;
  level?: string;
  goal?: string;
  userName?: string;
  painPoint?: string;
  completed?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { email, onboarding } = (await request.json()) as {
      email?: string;
      onboarding?: OnboardingPayload;
    };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Configuration Supabase manquante");
      return NextResponse.json(
        { success: false, error: "Erreur de configuration serveur." },
        { status: 500 }
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const initialMetadata: Record<string, string | number | boolean | null> = {
      registered_via: "email_otp",
      registered_at: new Date().toISOString(),
      onboarding_completed: onboarding?.completed ?? true,
      onboarding_step: onboarding?.step ?? 5,
      study_level: onboarding?.level || null,
      study_goal: onboarding?.goal || null,
      full_name: onboarding?.userName || null,
      pain_point: onboarding?.painPoint || null,
    };

    let userMetadata: Record<string, unknown> = initialMetadata;

    // 1. Tenter la pré-création sécurisée de l'utilisateur avec metadata (sans mot de passe)
    const { data: createdUser, error: createError } =
      await admin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: false,
        user_metadata: initialMetadata,
      });

    // 2. Si l'utilisateur existe déjà, mettre à jour ses metadata d'onboarding
    if (createError) {
      const { data: listData } = await admin.auth.admin.listUsers();
      const existingUser = listData?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );

      if (existingUser) {
        const existingMeta = existingUser.user_metadata || {};
        userMetadata = {
          ...existingMeta,
          ...(onboarding?.completed !== undefined ? { onboarding_completed: onboarding.completed } : {}),
          ...(onboarding?.step !== undefined ? { onboarding_step: onboarding.step } : {}),
          ...(onboarding?.level ? { study_level: onboarding.level } : {}),
          ...(onboarding?.goal ? { study_goal: onboarding.goal } : {}),
          ...(onboarding?.userName ? { full_name: onboarding.userName } : {}),
          ...(onboarding?.painPoint ? { pain_point: onboarding.painPoint } : {}),
        };

        await admin.auth.admin.updateUserById(existingUser.id, {
          user_metadata: userMetadata,
        });
      }
    } else if (createdUser?.user?.user_metadata) {
      userMetadata = createdUser.user.user_metadata;
    }

    // Réponse STRICTEMENT sécurisée : Aucun secret, token ou mot de passe retourné
    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      metadata: userMetadata,
    });
  } catch (err) {
    console.error("Erreur route /api/auth/email :", err);
    return NextResponse.json(
      { success: false, error: "Impossible de traiter la demande." },
      { status: 500 }
    );
  }
}
