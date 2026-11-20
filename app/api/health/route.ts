import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lightweight read-only health check + Supabase keep-alive endpoint.
 * Hit twice weekly by Vercel Cron (vercel.json) to prevent Supabase
 * free-tier 7-day auto-pause.
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  if (url && key) {
    try {
      const supabase = createClient(url, key, {
        auth: { persistSession: false },
      });
      await supabase.from("site_state").select("key").limit(1);
    } catch {
      // Keep health endpoint non-throwing even on transient network hiccups
    }
  }

  return NextResponse.json(
    { ok: true, timestamp },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
