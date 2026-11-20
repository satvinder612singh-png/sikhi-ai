import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseAdminClient,
  getVerifiedSessionUser,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface SikhInterestPostRecord {
  id: string;
  author_id: string | null;
  author_name: string;
  author_handle: string | null;
  title: string;
  description: string;
  category: string;
  gurmukhi_calligraphy: string | null;
  image_url: string | null;
  likes_count: number;
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

export async function GET() {
  const supabase = getReadClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: true, posts: [] },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  const { data, error } = await supabase
    .from("sikhinterest_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: true, posts: [], warning: error.message },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  return NextResponse.json(
    { ok: true, posts: (data || []) as SikhInterestPostRecord[] },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(req: NextRequest) {
  const { user: currentUser } = await getVerifiedSessionUser();
  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Please sign in to upload artwork to SikhInterest." },
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
    const title = String(body.title || "").trim().slice(0, 180);
    const description = String(body.description || "").trim().slice(0, 3000);
    const category =
      String(body.category || "Sikh Art & Miniature").trim().slice(0, 80) ||
      "Sikh Art & Miniature";
    const gurmukhiCalligraphy = body.gurmukhi_calligraphy
      ? String(body.gurmukhi_calligraphy).trim().slice(0, 300)
      : null;
    const imageUrl = body.image_url ? String(body.image_url).trim() : null;

    if (!title || !description) {
      return NextResponse.json(
        { ok: false, error: "Artwork title and description are required." },
        { status: 400 }
      );
    }

    const defaultName =
      String(body.author_name || "").trim() ||
      currentUser.email?.split("@")[0] ||
      "Sangat Artist";
    const defaultHandle =
      String(body.author_handle || "").trim() ||
      defaultName.toLowerCase().replace(/[^a-z0-9_]+/g, "_");

    const record: SikhInterestPostRecord = {
      id: crypto.randomUUID(),
      author_id: currentUser.id,
      author_name: defaultName,
      author_handle: defaultHandle,
      title,
      description,
      category,
      gurmukhi_calligraphy: gurmukhiCalligraphy,
      image_url: imageUrl,
      likes_count: 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await admin.client
      .from("sikhinterest_posts")
      .insert(record)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error?.message ||
            "Failed to save artwork. Ensure 006_phase1_schema_sync.sql has been run in Supabase.",
        },
        { status: 500 }
      );
    }

    try {
      revalidatePath("/");
      revalidatePath("/sangat");
    } catch {
      // ignore
    }

    return NextResponse.json(
      { ok: true, post: data as SikhInterestPostRecord },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to upload artwork.",
      },
      { status: 500 }
    );
  }
}
