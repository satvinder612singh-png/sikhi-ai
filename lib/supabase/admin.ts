import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/supabase/server";

/**
 * Server-only Supabase admin client using SUPABASE_SERVICE_ROLE_KEY.
 * NEVER import this module in any "use client" component.
 */
export function getSupabaseAdminClient():
  | { client: SupabaseClient; error: null }
  | { client: null; error: string } {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url) {
    return {
      client: null,
      error: "Server misconfiguration: NEXT_PUBLIC_SUPABASE_URL is missing.",
    };
  }
  if (!serviceRoleKey) {
    return {
      client: null,
      error:
        "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing. Add it to your environment variables to enable secure writes.",
    };
  }

  const client = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return { client, error: null };
}

export function isAdminEmail(email?: string | null): boolean {
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return false;
  if (clean.endsWith("student1313@learnsikhi.com")) return true;
  const configured = (
    process.env.FOUNDER_ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_FOUNDER_ADMIN_EMAIL ||
    "satvinder612singh@gmail.com"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return configured.includes(clean);
}

export async function getVerifiedSessionUser() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return { user: null, isAdmin: false };
  }
  return {
    user,
    isAdmin: isAdminEmail(user.email),
  };
}
