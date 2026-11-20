import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/config";

const PROTECTED_PREFIXES = ["/ask"];

/**
 * Refreshes the Supabase session cookie on every matched request (so auth
 * persists across routes) and gates protected pages.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/site-frames")) {
    return NextResponse.next();
  }
  if (!isSupabaseConfigured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
        Object.entries(headers ?? {}).forEach(([key, value]) =>
          response.headers.set(key, value)
        );
      },
    },
  });

  // getUser() validates the token with Supabase; handle stale refresh tokens gracefully.
  let user = null;
  const clearStaleSbCookies = () => {
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.delete(cookie.name);
      }
    }
  };

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      const errCode = (error as { code?: string }).code;
      if (
        errCode === "refresh_token_not_found" ||
        error.message?.includes("Refresh Token")
      ) {
        clearStaleSbCookies();
      }
    } else {
      user = data.user ?? null;
    }
  } catch (err) {
    const errObj = err as { code?: string; message?: string };
    if (
      errObj?.code === "refresh_token_not_found" ||
      errObj?.message?.includes("Refresh Token")
    ) {
      clearStaleSbCookies();
    }
  }

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isProtected && !user) {
    if (isProtected && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', `${pathname}${search}`)
      return NextResponse.redirect(url)
    }
  }

  return response;
}

export const config = {
  // Only run middleware on protected routes that require server-side auth gating.
  // Excludes all static assets and public routes (/, /sangat, /granths, /foundations,
  // /matriarchs, /games, /explore, /news, /sources, /articles/*, /u/*, /api/*)
  // to minimize Vercel Fluid Active CPU and eliminate redundant Supabase auth calls.
  matcher: ["/ask/:path*"],
};
