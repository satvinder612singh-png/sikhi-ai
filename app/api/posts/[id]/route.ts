import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { verifyFounderAdminHeader } from "@/lib/articles-store";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_STATE_KEY = "learnsikhi_global_site_frames_v1";

function isAdminEmail(email?: string | null): boolean {
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return false;
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

async function tryDeleteStorageImage(
  url: string,
  key: string,
  imageUrl?: string | null
) {
  if (!imageUrl || typeof imageUrl !== "string") return;
  const match = imageUrl.match(
    /\/storage\/v1\/object\/public\/([^/]+)\/(.+?)(?:\?|$)/
  );
  if (!match) return;
  const bucket = decodeURIComponent(match[1]);
  const objectPath = decodeURIComponent(match[2]);
  try {
    const storageClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    await storageClient.storage.from(bucket).remove([objectPath]);
  } catch {
    // non-fatal
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser().catch(() => null);
  const isAdmin =
    verifyFounderAdminHeader(req) || isAdminEmail(currentUser?.email);

  if (!isAdmin && !currentUser) {
    return NextResponse.json(
      { ok: false, error: "Authentication required to delete posts." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const rawId = decodeURIComponent(id || "").trim();
  if (!rawId) {
    return NextResponse.json(
      { ok: false, error: "Missing post id." },
      { status: 400 }
    );
  }

  // Strip optional feed key prefix ("link:", "essay:", "visual:")
  const bareId = rawId.replace(/^(link|essay|visual):/, "");

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  try {
    const { data: row } = await supabase
      .from("site_state")
      .select("value")
      .eq("key", SITE_STATE_KEY)
      .maybeSingle();

    const currentVal =
      row?.value && typeof row.value === "object"
        ? (row.value as Record<string, unknown>)
        : {};

    const imagesToRemove: string[] = [];

    const filterArray = (arr: unknown): unknown[] => {
      if (!Array.isArray(arr)) return [];
      return arr.filter((item) => {
        if (!item || typeof item !== "object") return true;
        const rec = item as Record<string, unknown>;
        const itemId = String(rec.id || "");
        const matched = itemId === bareId || itemId === rawId;
        if (matched) {
          const img =
            (typeof rec.imageUrl === "string" && rec.imageUrl) ||
            (typeof rec.imageDataUrl === "string" && rec.imageDataUrl) ||
            (typeof rec.coverImageUrl === "string" && rec.coverImageUrl) ||
            null;
          if (img) imagesToRemove.push(img);
        }
        return !matched;
      });
    };

    const existingCustomPosts =
      currentVal.customPosts && typeof currentVal.customPosts === "object"
        ? (currentVal.customPosts as Record<string, unknown>)
        : {};

    const nextCustomPosts = {
      ...existingCustomPosts,
      links: filterArray(existingCustomPosts.links),
      blogs: filterArray(existingCustomPosts.blogs),
      pins: filterArray(existingCustomPosts.pins),
    };

    const nextCustomLinks = filterArray(currentVal.customLinks);
    const nextCustomBlogs = filterArray(currentVal.customBlogs);
    const nextCustomPins = filterArray(currentVal.customPins);

    const existingDeleted = Array.isArray(currentVal.deletedIds)
      ? (currentVal.deletedIds as string[])
      : [];
    const nextDeleted = Array.from(
      new Set([
        ...existingDeleted,
        rawId,
        bareId,
        `link:${bareId}`,
        `essay:${bareId}`,
        `visual:${bareId}`,
      ])
    );

    const nextValue = {
      ...currentVal,
      customPosts: nextCustomPosts,
      customLinks: nextCustomLinks,
      customBlogs: nextCustomBlogs,
      customPins: nextCustomPins,
      deletedIds: nextDeleted,
    };

    const { error: upsertErr } = await supabase.from("site_state").upsert(
      {
        key: SITE_STATE_KEY,
        value: nextValue,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (upsertErr) {
      return NextResponse.json(
        { ok: false, error: upsertErr.message },
        { status: 500 }
      );
    }

    for (const imgUrl of imagesToRemove) {
      await tryDeleteStorageImage(url, key, imgUrl);
    }

    try {
      revalidatePath("/");
      revalidatePath("/sangat");
      revalidatePath("/admin");
    } catch {
      // ignore
    }

    return NextResponse.json(
      { ok: true, deletedId: bareId },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to delete post.",
      },
      { status: 500 }
    );
  }
}
