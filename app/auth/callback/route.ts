import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard?onboard=true";

  // 1. Google OAuth (PKCE Code Exchange)
  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Marquer immédiatement l'onboarding comme complété pour l'utilisateur Google
      try {
        await supabase.auth.updateUser({
          data: {
            onboarding_completed: true,
            onboarding_step: 5,
            registered_via: "google_oauth",
          },
        });
      } catch (err) {
        console.warn("Erreur sync metadata oauth :", err);
      }

      const destination = next.startsWith("/") ? next : `/${next}`;
      return NextResponse.redirect(new URL(destination, origin));
    } else {
      console.error("Erreur exchangeCodeForSession:", error);
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, origin)
      );
    }
  }

  // 2. Email OTP / Magic Link
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      try {
        await supabase.auth.updateUser({
          data: {
            onboarding_completed: true,
            onboarding_step: 5,
          },
        });
      } catch (err) {
        console.warn("Erreur sync metadata otp :", err);
      }
      const destination = next.startsWith("/") ? next : `/${next}`;
      return NextResponse.redirect(new URL(destination, origin));
    } else {
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error?.message || "Erreur d'authentification")}`, origin)
      );
    }
  }

  return NextResponse.redirect(new URL("/dashboard?onboard=true", origin));
}
