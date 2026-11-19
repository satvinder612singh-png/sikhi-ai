import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface ReshareRecord {
  id: string;
  user_id: string;
  user_name: string;
  target_type: "sikhstacks" | "sikhinterest";
  target_id: string;
  target_title: string;
  target_summary: string | null;
  target_image_url: string | null;
  target_author_name: string | null;
  target_author_id: string | null;
  target_category: string | null;
  comment: string;
  created_at: string;
}

const FALLBACK_RESHARES_KEY = "learnsikhi_reshares_v1";

function getSupabaseServerClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function readFallbackReshares(): Promise<ReshareRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("site_state")
    .select("value")
    .eq("key", FALLBACK_RESHARES_KEY)
    .maybeSingle();
  return Array.isArray(data?.value) ? (data.value as ReshareRecord[]) : [];
}

async function writeFallbackReshares(list: ReshareRecord[]): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  await supabase.from("site_state").upsert(
    {
      key: FALLBACK_RESHARES_KEY,
      value: list,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
}

export async function GET(req: NextRequest) {
  const userId = (req.nextUrl.searchParams.get("userId") || "").trim();

  const supabase = getSupabaseServerClient();
  if (supabase) {
    let query = supabase
      .from("reshares")
      .select("*")
      .order("created_at", { ascending: false });
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      return NextResponse.json(
        { ok: true, reshares: data as ReshareRecord[] },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }
  }

  const all = await readFallbackReshares();
  const filtered = userId
    ? all.filter((r) => r.user_id === userId)
    : all;
  filtered.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  return NextResponse.json(
    { ok: true, reshares: filtered },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser().catch(() => null);
  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to reshare posts to your profile." },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const targetType =
      body.target_type === "sikhinterest" ? "sikhinterest" : "sikhstacks";
    const targetId = String(body.target_id || "").trim();
    const targetTitle = String(body.target_title || "").trim().slice(0, 220);

    if (!targetId || !targetTitle) {
      return NextResponse.json(
        { ok: false, error: "target_id and target_title are required." },
        { status: 400 }
      );
    }

    const record: ReshareRecord = {
      id: crypto.randomUUID(),
      user_id: currentUser.id,
      user_name:
        String(body.user_name || "").trim().slice(0, 80) ||
        currentUser.email?.split("@")[0] ||
        "Sangat Member",
      target_type: targetType,
      target_id: targetId,
      target_title: targetTitle,
      target_summary: body.target_summary
        ? String(body.target_summary).trim().slice(0, 400)
        : null,
      target_image_url: body.target_image_url
        ? String(body.target_image_url).trim()
        : null,
      target_author_name: body.target_author_name
        ? String(body.target_author_name).trim().slice(0, 100)
        : null,
      target_author_id: body.target_author_id
        ? String(body.target_author_id).trim()
        : null,
      target_category: body.target_category
        ? String(body.target_category).trim().slice(0, 80)
        : null,
      comment: String(body.comment || "").trim().slice(0, 1000),
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("reshares")
        .insert(record)
        .select("*")
        .single();
      if (!error && data) {
        return NextResponse.json(
          { ok: true, reshare: data as ReshareRecord },
          { status: 201 }
        );
      }
    }

    const existing = await readFallbackReshares();
    await writeFallbackReshares([record, ...existing]);

    return NextResponse.json({ ok: true, reshare: record }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to save reshare.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const currentUser = await getCurrentUser().catch(() => null);
  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "Sign in required." },
      { status: 401 }
    );
  }

  const id = (req.nextUrl.searchParams.get("id") || "").trim();
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing reshare id." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase
      .from("reshares")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.id);
    if (!error) {
      return NextResponse.json({ ok: true, deletedId: id });
    }
  }

  const existing = await readFallbackReshares();
  const next = existing.filter(
    (r) => !(r.id === id && r.user_id === currentUser.id)
  );
  await writeFallbackReshares(next);

  return NextResponse.json({ ok: true, deletedId: id });
}
