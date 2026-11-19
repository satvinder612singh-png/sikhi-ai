import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface UserProfileRecord {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  instagram_url: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  substack_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

const FALLBACK_PROFILES_KEY = "learnsikhi_profiles_v1";

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

function sanitizeUrl(raw: unknown): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const candidate = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function sanitizeUsername(raw: unknown, fallbackId: string): string {
  const cleaned = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
  return cleaned || `member_${fallbackId.slice(0, 8)}`;
}

async function readFallbackProfiles(): Promise<Record<string, UserProfileRecord>> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("site_state")
    .select("value")
    .eq("key", FALLBACK_PROFILES_KEY)
    .maybeSingle();
  const raw = data?.value;
  return raw && typeof raw === "object"
    ? (raw as Record<string, UserProfileRecord>)
    : {};
}

async function writeFallbackProfiles(
  map: Record<string, UserProfileRecord>
): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  await supabase.from("site_state").upsert(
    {
      key: FALLBACK_PROFILES_KEY,
      value: map,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
}

export async function GET(req: NextRequest) {
  const lookup = (req.nextUrl.searchParams.get("id") || "").trim();
  const currentUser = await getCurrentUser().catch(() => null);
  const targetKey = lookup || currentUser?.id || "";

  if (!targetKey) {
    return NextResponse.json(
      { ok: false, error: "Not signed in and no profile id specified." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    // Try by id first, then by username
    const { data: byId, error: idErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetKey)
      .maybeSingle();

    if (!idErr && byId) {
      return NextResponse.json(
        { ok: true, profile: byId as UserProfileRecord },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const { data: byUsername, error: userErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", targetKey.toLowerCase())
      .maybeSingle();

    if (!userErr && byUsername) {
      return NextResponse.json(
        { ok: true, profile: byUsername as UserProfileRecord },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }
  }

  const fallbackMap = await readFallbackProfiles();
  const foundFallback =
    fallbackMap[targetKey] ||
    Object.values(fallbackMap).find(
      (p) => p.username.toLowerCase() === targetKey.toLowerCase()
    ) ||
    null;

  if (foundFallback) {
    return NextResponse.json(
      { ok: true, profile: foundFallback },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  // Synthesize a clean default profile shell
  const isSelf = Boolean(currentUser && currentUser.id === targetKey);
  const defaultName =
    isSelf && currentUser?.email
      ? currentUser.email.split("@")[0]
      : targetKey.replace(/[_-]+/g, " ");

  const shell: UserProfileRecord = {
    id: targetKey,
    username: sanitizeUsername(defaultName, targetKey),
    display_name: defaultName || "Sangat Member",
    bio: "",
    instagram_url: null,
    linkedin_url: null,
    x_url: null,
    substack_url: null,
    website_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json(
    { ok: true, profile: shell, isDefaultShell: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser().catch(() => null);
  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "Sign in required to update your profile." },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    const record: UserProfileRecord = {
      id: currentUser.id,
      username: sanitizeUsername(
        body.username || currentUser.email?.split("@")[0],
        currentUser.id
      ),
      display_name:
        String(body.display_name || "").trim().slice(0, 80) ||
        currentUser.email?.split("@")[0] ||
        "Sangat Member",
      bio: String(body.bio || "").trim().slice(0, 500),
      instagram_url: sanitizeUrl(body.instagram_url),
      linkedin_url: sanitizeUrl(body.linkedin_url),
      x_url: sanitizeUrl(body.x_url),
      substack_url: sanitizeUrl(body.substack_url),
      website_url: sanitizeUrl(body.website_url),
      created_at: now,
      updated_at: now,
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .upsert(record, { onConflict: "id" })
        .select("*")
        .single();

      if (!error && data) {
        return NextResponse.json(
          { ok: true, profile: data as UserProfileRecord },
          { headers: { "Cache-Control": "no-store, max-age=0" } }
        );
      }
    }

    const fallbackMap = await readFallbackProfiles();
    fallbackMap[currentUser.id] = record;
    await writeFallbackProfiles(fallbackMap);

    return NextResponse.json(
      { ok: true, profile: record },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to save profile.",
      },
      { status: 500 }
    );
  }
}
