import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseAdminClient,
  getVerifiedSessionUser,
} from "@/lib/supabase/admin";

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

function getReadClient() {
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
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  const userId = (req.nextUrl.searchParams.get("userId") || "").trim();
  const supabase = getReadClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: true, reshares: [] },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  let query = supabase
    .from("reshares")
    .select("*")
    .order("created_at", { ascending: false });
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { ok: true, reshares: [], warning: error.message },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  return NextResponse.json(
    { ok: true, reshares: (data || []) as ReshareRecord[] },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(req: NextRequest) {
  const { user: currentUser } = await getVerifiedSessionUser();
  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Please sign in to reshare posts." },
      { status: 401 }
    );
  }

  const admin = getSupabaseAdminClient();
  if (!admin.client) {
    return NextResponse.json(
      { ok: false, error: admin.error },
      { status: 500 }
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

    const { data, error } = await admin.client
      .from("reshares")
      .insert(record)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error?.message ||
            "Could not save reshare. Ensure public.reshares exists in Supabase.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, reshare: data as ReshareRecord },
      { status: 201 }
    );
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
  const { user: currentUser, isAdmin } = await getVerifiedSessionUser();
  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Sign in required." },
      { status: 401 }
    );
  }

  const admin = getSupabaseAdminClient();
  if (!admin.client) {
    return NextResponse.json(
      { ok: false, error: admin.error },
      { status: 500 }
    );
  }

  const id = (req.nextUrl.searchParams.get("id") || "").trim();
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing reshare id." },
      { status: 400 }
    );
  }

  const { data: existing } = await admin.client
    .from("reshares")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (existing && existing.user_id !== currentUser.id && !isAdmin) {
    return NextResponse.json(
      { ok: false, error: "Forbidden: You can only delete your own reshares." },
      { status: 403 }
    );
  }

  const { error } = await admin.client.from("reshares").delete().eq("id", id);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, deletedId: id });
}
