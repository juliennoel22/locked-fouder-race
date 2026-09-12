import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

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

    // Mot de passe interne déterministe et sécurisé basé sur l'email et la clé secrète serveur
    const secret =
      crypto
        .createHmac("sha256", serviceRoleKey)
        .update(normalizedEmail)
        .digest("hex")
        .slice(0, 32) + "A1!";

    // 1. Tenter la création immédiate avec email_confirm: true
    const { data: createdUser, error: createError } =
      await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: secret,
        email_confirm: true,
        user_metadata: {
          registered_via: "email_only",
          registered_at: new Date().toISOString(),
        },
      });

    // 2. Si l'utilisateur existe déjà, mettre à jour son mot de passe pour autoriser la session
    if (createError) {
      const { data: listData } = await admin.auth.admin.listUsers();
      const existingUser = listData?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );

      if (existingUser) {
        await admin.auth.admin.updateUserById(existingUser.id, {
          password: secret,
          email_confirm: true,
        });
      } else {
        console.error("Erreur création utilisateur Supabase :", createError);
        return NextResponse.json(
          { success: false, error: createError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      secret,
    });
  } catch (err) {
    console.error("Erreur route /api/auth/email :", err);
    return NextResponse.json(
      { success: false, error: "Impossible de traiter la demande." },
      { status: 500 }
    );
  }
}
