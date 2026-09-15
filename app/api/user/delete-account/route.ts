import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { deleteAccountRequestSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    // 1. Authentification utilisateur
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Vous devez être connecté pour supprimer votre compte." },
        { status: 401 }
      );
    }

    // 2. Validation Zod de la confirmation RGPD
    const body = await request.json().catch(() => ({}));
    const parseResult = deleteAccountRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Veuillez taper 'SUPPRIMER' pour confirmer la suppression définitive de vos données.",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: "Erreur de configuration serveur Supabase Admin." },
        { status: 500 }
      );
    }

    const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const userId = user.id;

    // 3. Suppression en cascade des fichiers dans Supabase Storage ('course-scans')
    try {
      const { data: fileList } = await admin.storage
        .from("course-scans")
        .list(userId);

      if (fileList && fileList.length > 0) {
        const filePaths = fileList.map((f) => `${userId}/${f.name}`);
        await admin.storage.from("course-scans").remove(filePaths);
      }
    } catch (storageErr) {
      console.warn("Erreur suppression fichiers storage RGPD :", storageErr);
    }

    // 4. Suppression en cascade des Decks & Flashcards BDD
    const { error: dbError } = await admin
      .from("decks")
      .delete()
      .eq("user_id", userId);

    if (dbError) {
      console.error("Erreur suppression decks RGPD :", dbError);
    }

    // 5. Suppression définitive du compte Auth Supabase
    const { error: deleteUserErr } = await admin.auth.admin.deleteUser(userId);

    if (deleteUserErr) {
      console.error("Erreur suppression compte auth RGPD :", deleteUserErr);
      return NextResponse.json(
        { success: false, error: "Impossible de supprimer le compte utilisateur." },
        { status: 500 }
      );
    }

    // 6. Déconnexion de la session courante
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Compte et données intégralement supprimés conformément au RGPD.",
    });
  } catch (error) {
    console.error("Erreur globale /api/user/delete-account :", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la suppression du compte." },
      { status: 500 }
    );
  }
}
