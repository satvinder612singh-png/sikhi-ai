import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyFounderAdminHeader } from "@/lib/articles-store";
import {
  getSupabaseAdminClient,
  getVerifiedSessionUser,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_STATE_KEY = "learnsikhi_global_site_frames_v1";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user: currentUser, isAdmin: isSessionAdmin } =
    await getVerifiedSessionUser();
  const isHeaderAdmin = verifyFounderAdminHeader(req);
  const isAdmin = isHeaderAdmin || isSessionAdmin;

  if (!currentUser && !isHeaderAdmin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Sign in required to delete posts." },
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

  const { id } = await context.params;
  const rawId = decodeURIComponent(id || "").trim();
  if (!rawId) {
    return NextResponse.json(
      { ok: false, error: "Missing post id." },
      { status: 400 }
    );
  }

  const bareId = rawId.replace(/^(link|essay|visual):/, "");

  try {
    // 1. Delete from dedicated sikhinterest_posts table if present
    const { data: dedicatedPost } = await admin.client
      .from("sikhinterest_posts")
      .select("id, author_id, image_url")
      .eq("id", bareId)
      .maybeSingle();

    if (dedicatedPost) {
      const isAuthor =
        Boolean(currentUser?.id) && dedicatedPost.author_id === currentUser?.id;
      if (!isAdmin && !isAuthor) {
        return NextResponse.json(
          { ok: false, error: "Forbidden: Only the author or an admin can delete this post." },
          { status: 403 }
        );
      }
      await admin.client.from("sikhinterest_posts").delete().eq("id", bareId);
      if (typeof dedicatedPost.image_url === "string") {
        const match = dedicatedPost.image_url.match(
          /\/storage\/v1\/object\/public\/([^/]+)\/(.+?)(?:\?|$)/
        );
        if (match) {
          await admin.client.storage
            .from(decodeURIComponent(match[1]))
            .remove([decodeURIComponent(match[2])])
            .catch(() => {});
        }
      }
    } else if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Forbidden: Admin privileges required to delete legacy community posts." },
        { status: 403 }
      );
    }

    // 2. Clean up any legacy entries in site_state if present
    const { data: row } = await admin.client
      .from("site_state")
      .select("value")
      .eq("key", SITE_STATE_KEY)
      .maybeSingle();

    if (row?.value && typeof row.value === "object") {
      const currentVal = row.value as Record<string, unknown>;
      const filterArray = (arr: unknown): unknown[] => {
        if (!Array.isArray(arr)) return [];
        return arr.filter((item) => {
          if (!item || typeof item !== "object") return true;
          const itemId = String((item as Record<string, unknown>).id || "");
          return itemId !== bareId && itemId !== rawId;
        });
      };

      const existingCustomPosts =
        currentVal.customPosts && typeof currentVal.customPosts === "object"
          ? (currentVal.customPosts as Record<string, unknown>)
          : {};

      const nextValue = {
        ...currentVal,
        customPosts: {
          ...existingCustomPosts,
          links: filterArray(existingCustomPosts.links),
          blogs: filterArray(existingCustomPosts.blogs),
          pins: filterArray(existingCustomPosts.pins),
        },
      };

      await admin.client.from("site_state").upsert(
        {
          key: SITE_STATE_KEY,
          value: nextValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
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
