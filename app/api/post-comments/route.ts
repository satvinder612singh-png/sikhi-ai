import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

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

const FALLBACK_STATE_KEY = "learnsikhi_post_comments_v1";

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

async function readFallbackComments(): Promise<PostCommentRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("site_state")
    .select("value")
    .eq("key", FALLBACK_STATE_KEY)
    .maybeSingle();
  const raw = data?.value;
  return Array.isArray(raw) ? (raw as PostCommentRecord[]) : [];
}

async function writeFallbackComments(comments: PostCommentRecord[]): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  await supabase.from("site_state").upsert(
    {
      key: FALLBACK_STATE_KEY,
      value: comments,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
}

export async function GET(req: NextRequest) {
  const countsOnly = req.nextUrl.searchParams.get("counts") === "true";
  const postId = req.nextUrl.searchParams.get("postId")?.trim() || "";

  if (countsOnly) {
    const counts: Record<string, number> = {};
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("post_comments")
        .select("post_id");
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const pid = String((row as { post_id?: string }).post_id || "");
          if (pid) counts[pid] = (counts[pid] || 0) + 1;
        }
        return NextResponse.json({ ok: true, counts });
      }
    }
    const allFallback = await readFallbackComments();
    for (const c of allFallback) {
      counts[c.post_id] = (counts[c.post_id] || 0) + 1;
    }
    return NextResponse.json({ ok: true, counts });
  }

  if (!postId) {
    return NextResponse.json(
      { ok: false, error: "Missing postId query parameter." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data)) {
      return NextResponse.json({
        ok: true,
        comments: data as PostCommentRecord[],
        storage: "post_comments",
      });
    }
  }

  const allFallback = await readFallbackComments();
  const filtered = allFallback
    .filter((c) => c.post_id === postId)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

  return NextResponse.json({
    ok: true,
    comments: filtered,
    storage: "site_state",
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const postId = String(payload?.postId || "").trim();
    const parentCommentId = payload?.parentCommentId
      ? String(payload.parentCommentId).trim()
      : null;
    const authorId = payload?.authorId ? String(payload.authorId).trim() : null;
    const authorName =
      String(payload?.authorName || "Sangat Member").trim().slice(0, 80) ||
      "Sangat Member";
    const body = String(payload?.body || "").trim().slice(0, 4000);

    if (!postId || body.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Post ID and comment text are required." },
        { status: 400 }
      );
    }

    const newComment: PostCommentRecord = {
      id: crypto.randomUUID(),
      post_id: postId,
      parent_comment_id: parentCommentId,
      author_id: authorId,
      author_name: authorName,
      body,
      upvotes: 1,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          id: newComment.id,
          post_id: newComment.post_id,
          parent_comment_id: newComment.parent_comment_id,
          author_id: newComment.author_id,
          author_name: newComment.author_name,
          body: newComment.body,
          upvotes: newComment.upvotes,
        })
        .select("*")
        .single();

      if (!error && data) {
        return NextResponse.json(
          { ok: true, comment: data as PostCommentRecord },
          { status: 201 }
        );
      }
    }

    const existing = await readFallbackComments();
    const updated = [...existing, newComment];
    await writeFallbackComments(updated);

    return NextResponse.json({ ok: true, comment: newComment }, { status: 201 });
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

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: current, error: fetchErr } = await supabase
        .from("post_comments")
        .select("id, upvotes")
        .eq("id", commentId)
        .maybeSingle();

      if (!fetchErr && current) {
        const nextVotes = Math.max(0, Number(current.upvotes || 0) + step);
        const { data: updated, error: updErr } = await supabase
          .from("post_comments")
          .update({ upvotes: nextVotes })
          .eq("id", commentId)
          .select("*")
          .single();

        if (!updErr && updated) {
          return NextResponse.json({
            ok: true,
            comment: updated as PostCommentRecord,
          });
        }
      }
    }

    const existing = await readFallbackComments();
    let target: PostCommentRecord | null = null;
    const nextList = existing.map((c) => {
      if (c.id !== commentId) return c;
      target = { ...c, upvotes: Math.max(0, (c.upvotes || 0) + step) };
      return target;
    });

    if (!target) {
      return NextResponse.json(
        { ok: false, error: "Comment not found." },
        { status: 404 }
      );
    }

    await writeFallbackComments(nextList);
    return NextResponse.json({ ok: true, comment: target });
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
