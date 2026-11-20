import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseAdminClient,
  getVerifiedSessionUser,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface PostCommentRecord {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  author_id: string | null;
  author_name: string;
  body: string;
  upvotes: number;
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
  const countsOnly = req.nextUrl.searchParams.get("counts") === "true";
  const postId = req.nextUrl.searchParams.get("postId")?.trim() || "";
  const supabase = getReadClient();

  if (countsOnly) {
    const counts: Record<string, number> = {};
    if (supabase) {
      const { data, error } = await supabase
        .from("post_comments")
        .select("post_id");
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const pid = String((row as { post_id?: string }).post_id || "");
          if (pid) counts[pid] = (counts[pid] || 0) + 1;
        }
      }
    }
    return NextResponse.json(
      { ok: true, counts },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  if (!postId) {
    return NextResponse.json(
      { ok: false, error: "Missing postId query parameter." },
      { status: 400 }
    );
  }

  if (!supabase) {
    return NextResponse.json({ ok: true, comments: [] });
  }

  const { data, error } = await supabase
    .from("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { ok: true, comments: [], warning: error.message },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  return NextResponse.json(
    { ok: true, comments: (data || []) as PostCommentRecord[] },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(req: NextRequest) {
  const { user: currentUser } = await getVerifiedSessionUser();
  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Please sign in to post a comment." },
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
    const payload = await req.json();
    const postId = String(payload?.postId || "").trim();
    const parentCommentId = payload?.parentCommentId
      ? String(payload.parentCommentId).trim()
      : null;
    const authorName =
      String(payload?.authorName || currentUser.email?.split("@")[0] || "Sangat Member")
        .trim()
        .slice(0, 80) || "Sangat Member";
    const body = String(payload?.body || "").trim().slice(0, 4000);

    if (!postId || body.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Post ID and comment text are required." },
        { status: 400 }
      );
    }

    const newComment = {
      id: crypto.randomUUID(),
      post_id: postId,
      parent_comment_id: parentCommentId,
      author_id: currentUser.id,
      author_name: authorName,
      body,
      upvotes: 1,
    };

    const { data, error } = await admin.client
      .from("post_comments")
      .insert(newComment)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error?.message ||
            "Could not post comment. Ensure public.post_comments exists in Supabase.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, comment: data as PostCommentRecord },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to post comment.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { user: currentUser } = await getVerifiedSessionUser();
  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Sign in required to vote." },
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
    const payload = await req.json();
    const commentId = String(payload?.commentId || "").trim();
    const delta = Number(payload?.delta ?? 1);
    const step = delta < 0 ? -1 : 1;

    if (!commentId) {
      return NextResponse.json(
        { ok: false, error: "commentId is required." },
        { status: 400 }
      );
    }

    const { data: current, error: fetchErr } = await admin.client
      .from("post_comments")
      .select("id, upvotes")
      .eq("id", commentId)
      .maybeSingle();

    if (fetchErr || !current) {
      return NextResponse.json(
        { ok: false, error: "Comment not found." },
        { status: 404 }
      );
    }

    const nextVotes = Math.max(0, Number(current.upvotes || 0) + step);
    const { data: updated, error: updErr } = await admin.client
      .from("post_comments")
      .update({ upvotes: nextVotes })
      .eq("id", commentId)
      .select("*")
      .single();

    if (updErr || !updated) {
      return NextResponse.json(
        { ok: false, error: updErr?.message || "Failed to update vote." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      comment: updated as PostCommentRecord,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to update vote.",
      },
      { status: 500 }
    );
  }
}
