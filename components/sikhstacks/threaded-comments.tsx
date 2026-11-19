"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowBigUp, MessageSquare, CornerDownRight, Send } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import type { PostCommentRecord } from "@/app/api/post-comments/route";

interface ThreadedCommentsProps {
  postId: string;
  onCountChange?: (count: number) => void;
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

export function ThreadedComments({
  postId,
  onCountChange,
}: ThreadedCommentsProps) {
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
        onCountChange?.(data.comments.length);
      }
    } catch {
      // keep existing state
    } finally {
      setLoading(false);
    }
  }, [postId, onCountChange]);

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
      setComments((prev) => {
        const next = [...prev, data.comment];
        onCountChange?.(next.length);
        return next;
      });
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
        style={
          depth > 0
            ? { borderColor: "var(--border-subtle)" }
            : undefined
        }
        className={
          depth > 0
            ? "ml-4 sm:ml-6 pl-4 sm:pl-5 border-l transition-colors duration-150 space-y-3"
            : "space-y-3"
        }
      >
        <div
          style={{
            backgroundColor: depth === 0 ? "var(--bg-surface)" : "var(--bg-tertiary)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-xl border p-4 space-y-2.5 transition-colors duration-150"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                className="w-6 h-6 rounded-full border inline-flex items-center justify-center font-semibold text-[11px] shrink-0"
              >
                {node.author_name.slice(0, 1).toUpperCase()}
              </span>
              <span className="font-semibold truncate">{node.author_name}</span>
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

          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => void handleToggleUpvote(node.id)}
              style={
                isVoted
                  ? {
                      borderColor: "var(--accent-primary)",
                      color: "var(--accent-text)",
                      backgroundColor: "var(--bg-tertiary)",
                    }
                  : {
                      borderColor: "var(--border-subtle)",
                      color: "var(--theme-text-muted)",
                    }
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors duration-150 hover:border-[var(--accent-primary)]"
            >
              <ArrowBigUp className="w-3.5 h-3.5" />
              Helpful · {node.upvotes || 0}
            </button>

            {depth < 4 && (
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(isReplying ? null : node.id);
                  setReplyBody("");
                }}
                style={{ color: "var(--theme-text-muted)" }}
                className="inline-flex items-center gap-1 text-xs font-medium hover:text-[var(--text-primary)] transition-colors duration-150"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                {isReplying ? "Cancel" : "Reply"}
              </button>
            )}
          </div>

          {isReplying && (
            <div className="pt-2 space-y-2.5">
              <textarea
                rows={2}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={`Reply to ${node.author_name}…`}
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  style={{ borderColor: "var(--border-subtle)" }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || replyBody.trim().length < 2}
                  onClick={() => void handlePostComment(node.id)}
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "var(--cta-text)",
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>

        {node.replies.length > 0 && (
          <div className="space-y-3 pt-1">
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
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
      className="rounded-2xl border p-6 sm:p-8 space-y-6"
    >
      <div
        className="flex items-center justify-between gap-3 border-b pb-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare
            className="w-4 h-4"
            style={{ color: "var(--accent-text)" }}
          />
          <h3 className="font-serif text-lg sm:text-xl font-bold">
            Discussion &amp; Vichaar
          </h3>
        </div>
        <span
          style={{ color: "var(--theme-text-muted)" }}
          className="text-xs font-medium"
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
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            className="w-full sm:max-w-xs rounded-lg border px-3 py-2 text-sm focus:outline-none"
          />
        )}

        <textarea
          rows={3}
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Add a reflection, source citation, or question…"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
          }}
          className="w-full rounded-xl border px-3.5 py-3 text-sm sm:text-base focus:outline-none"
        />

        {errorMsg && (
          <p className="text-xs font-medium text-red-500">{errorMsg}</p>
        )}

        <div className="flex items-center justify-between gap-3">
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-xs"
          >
            Commenting as <strong className="font-medium">{defaultAuthorName}</strong>
          </p>
          <button
            type="button"
            disabled={submitting || newBody.trim().length < 2}
            onClick={() => void handlePostComment(null)}
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "var(--cta-text)",
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold disabled:opacity-50 transition-opacity duration-150"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Posting…" : "Post Comment"}
          </button>
        </div>
      </div>

      {/* Threaded Comments List */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm py-3"
          >
            Loading discussion…
          </p>
        ) : tree.length === 0 ? (
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm py-3"
          >
            No comments yet. Start the discussion above.
          </p>
        ) : (
          tree.map((node) => renderNode(node, 0))
        )}
      </div>
    </section>
  );
}
