"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowBigUp, MessageSquare, CornerDownRight, Send } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import type { PostCommentRecord } from "@/app/api/post-comments/route";

interface ThreadedCommentsProps {
  postId: string;
}

interface CommentNode extends PostCommentRecord {
  replies: CommentNode[];
}

function formatRelativeTime(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "just now";
  const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays <= 14) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildCommentTree(flat: PostCommentRecord[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  for (const item of flat) {
    map.set(item.id, { ...item, replies: [] });
  }
  const roots: CommentNode[] = [];
  for (const node of map.values()) {
    if (node.parent_comment_id && map.has(node.parent_comment_id)) {
      map.get(node.parent_comment_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

const VOTED_STORAGE_KEY = "learnsikhi_comment_votes_v1";

export function ThreadedComments({ postId }: ThreadedCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostCommentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBody, setNewBody] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultAuthorName = useMemo(() => {
    if (user?.email) return user.email.split("@")[0];
    return guestName.trim() || "Sangat Member";
  }, [user, guestName]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VOTED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") setVotedIds(parsed);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/post-comments?postId=${encodeURIComponent(postId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data?.ok && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    } catch {
      // keep existing state
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handlePostComment = async (parentId: string | null) => {
    const text = (parentId ? replyBody : newBody).trim();
    if (text.length < 2) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/post-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          parentCommentId: parentId,
          authorId: user?.id || null,
          authorName: defaultAuthorName,
          body: text,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok || !data.comment) {
        throw new Error(data?.error || "Could not post comment.");
      }
      setComments((prev) => [...prev, data.comment]);
      if (parentId) {
        setReplyBody("");
        setReplyingTo(null);
      } else {
        setNewBody("");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUpvote = async (commentId: string) => {
    const alreadyVoted = Boolean(votedIds[commentId]);
    const delta = alreadyVoted ? -1 : 1;

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, upvotes: Math.max(0, (c.upvotes || 0) + delta) }
          : c
      )
    );
    const nextVoted = { ...votedIds, [commentId]: !alreadyVoted };
    setVotedIds(nextVoted);
    try {
      window.localStorage.setItem(VOTED_STORAGE_KEY, JSON.stringify(nextVoted));
    } catch {
      // ignore storage errors
    }

    try {
      await fetch("/api/post-comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, delta }),
      });
    } catch {
      // optimistic UI already applied
    }
  };

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  const renderNode = (node: CommentNode, depth = 0) => {
    const isVoted = Boolean(votedIds[node.id]);
    const isReplying = replyingTo === node.id;

    return (
      <div
        key={node.id}
        className={
          depth > 0
            ? "ml-4 sm:ml-7 pl-4 border-l-2 border-amber-500/25 space-y-3"
            : "space-y-3"
        }
      >
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-2xl border p-4 space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--accent-text, var(--accent-primary))",
                }}
                className="w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-[11px] shrink-0"
              >
                {node.author_name.slice(0, 1).toUpperCase()}
              </span>
              <span className="font-bold truncate">{node.author_name}</span>
              <span
                style={{ color: "var(--theme-text-muted)" }}
                className="text-[11px] shrink-0"
              >
                · {formatRelativeTime(node.created_at)}
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">
            {node.body}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => void handleToggleUpvote(node.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                isVoted
                  ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300"
                  : "border-[var(--border-subtle)] hover:border-amber-500/50"
              }`}
            >
              <ArrowBigUp className="w-4 h-4" />
              Helpful ({node.upvotes || 0})
            </button>

            {depth < 4 && (
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(isReplying ? null : node.id);
                  setReplyBody("");
                }}
                style={{ color: "var(--theme-text-muted)" }}
                className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                {isReplying ? "Cancel" : "Reply"}
              </button>
            )}
          </div>

          {isReplying && (
            <div className="pt-2 space-y-2">
              <textarea
                rows={2}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={`Reply to ${node.author_name}…`}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || replyBody.trim().length < 2}
                  onClick={() => void handlePostComment(node.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Reply
                </button>
              </div>
            </div>
          )}
        </div>

        {node.replies.length > 0 && (
          <div className="space-y-3">
            {node.replies.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      aria-label="Discussion and threaded comments"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-subtle)",
      }}
      className="rounded-3xl border p-6 sm:p-8 space-y-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold">
            Sangat Vichaar &amp; Discussion
          </h2>
        </div>
        <span
          style={{ color: "var(--theme-text-muted)" }}
          className="text-xs font-semibold"
        >
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Top-level Comment Composer */}
      <div className="space-y-3">
        {!user && (
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name (optional, defaults to Sangat Member)"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            className="w-full sm:max-w-xs rounded-xl border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        )}

        <textarea
          rows={3}
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Share a reflection, source reference, or respectful question…"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
          }}
          className="w-full rounded-2xl border px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />

        {errorMsg && (
          <p className="text-xs font-semibold text-red-500">{errorMsg}</p>
        )}

        <div className="flex items-center justify-between gap-3">
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-xs"
          >
            Posting as <strong className="font-semibold">{defaultAuthorName}</strong>
          </p>
          <button
            type="button"
            disabled={submitting || newBody.trim().length < 2}
            onClick={() => void handlePostComment(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs sm:text-sm font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Posting…" : "Post Comment"}
          </button>
        </div>
      </div>

      {/* Threaded Comments List */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm py-4"
          >
            Loading discussion…
          </p>
        ) : tree.length === 0 ? (
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm py-4"
          >
            No comments yet. Start the vichaar above.
          </p>
        ) : (
          tree.map((node) => renderNode(node, 0))
        )}
      </div>
    </section>
  );
}
