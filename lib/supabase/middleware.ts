import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Vérification de la session utilisateur Supabase
  let user = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      user = userData.user;
    }
  } catch {
    user = null;
  }

  const pathname = request.nextUrl.pathname;
  const isAuthPage =
    pathname === "/auth" ||
    pathname === "/auth/login" ||
    pathname === "/auth/sign-up" ||
    pathname === "/auth/forgot-password";

  const isJury =
    request.cookies.get("loreno_pro")?.value === "true" ||
    request.nextUrl.searchParams.get("jury") === "true";

  const isOnboardingCompleted =
    user?.user_metadata?.onboarding_completed === true;

  // 1. Rediriger les utilisateurs connectés depuis les pages auth
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = isOnboardingCompleted ? "/dashboard" : "/quiz";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // 2. Si l'utilisateur est connecté et va sur /quiz alors qu'il a déjà terminé l'onboarding
  if (user && pathname === "/quiz" && isOnboardingCompleted) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // 3. Bloquer l'accès à /dashboard ou /deck si non connecté ou si onboarding non terminé
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/deck") ||
    pathname.startsWith("/protected");

  if (isProtectedPath) {
    if (!user && !isJury) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value);
      });
      return redirectResponse;
    }

    if (user && !isOnboardingCompleted && !isJury) {
      const url = request.nextUrl.clone();
      url.pathname = "/quiz";
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
