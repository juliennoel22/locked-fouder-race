import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key!,
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

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  // Récupérer l'utilisateur de manière robuste
  let user: { sub?: string; id?: string } | null = null;
  try {
    const { data: claimsData } = await supabase.auth.getClaims();
    if (claimsData?.claims) {
      user = claimsData.claims as { sub?: string; id?: string };
    }
  } catch {
    // fallback
  }

  if (!user) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        user = userData.user as unknown as { sub?: string; id?: string };
      }
    } catch {
      // ignore
    }
  }

  const pathname = request.nextUrl.pathname;
  const isAuthPage =
    pathname === "/auth" ||
    pathname === "/auth/login" ||
    pathname === "/auth/sign-up" ||
    pathname === "/auth/forgot-password";

  // 1. Rediriger les utilisateurs déjà connectés vers /dashboard depuis "/" ou les pages auth
  if (user && (pathname === "/" || isAuthPage)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // 2. Rediriger les utilisateurs non connectés vers /auth s'ils tentent d'accéder au dashboard ou /protected
  if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/protected"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
