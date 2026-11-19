"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Repeat2, X, Check, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export interface ReshareTarget {
  target_type: "sikhstacks" | "sikhinterest";
  target_id: string;
  target_title: string;
  target_summary?: string | null;
  target_image_url?: string | null;
  target_author_name?: string | null;
  target_author_id?: string | null;
  target_category?: string | null;
}

export function ReshareModal({
  target,
  onClose,
  onSuccess,
}: {
  target: ReshareTarget | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reshares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...target,
          comment: comment.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Could not reshare right now.");
      }
      setDone(true);
      onSuccess?.();
      window.setTimeout(() => {
        setComment("");
        setDone(false);
        onClose();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reshare.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reshare with comment"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-primary)",
        }}
        className="w-full max-w-lg rounded-2xl border p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-3 border-b pb-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <Repeat2
              className="w-4 h-4"
              style={{ color: "var(--accent-text)" }}
            />
            <h3 className="font-serif text-lg font-bold">
              Reshare to Your Profile
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reshare modal"
            style={{ borderColor: "var(--border-subtle)" }}
            className="rounded-lg border p-1.5 hover:border-[var(--accent-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Original Post Preview */}
        <div
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-xl border p-3.5 space-y-1.5"
        >
          <div className="flex items-center gap-2 text-[11px]">
            <span
              style={{ color: "var(--accent-text)" }}
              className="font-semibold uppercase tracking-wider"
            >
              {target.target_type === "sikhstacks"
                ? "SikhStacks"
                : "SikhInterest"}
            </span>
            {target.target_author_name && (
              <span style={{ color: "var(--theme-text-muted)" }}>
                · {target.target_author_name}
              </span>
            )}
          </div>
          <p className="font-serif text-base font-bold leading-snug">
            {target.target_title}
          </p>
          {target.target_summary && (
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-xs line-clamp-2"
            >
              {target.target_summary}
            </p>
          )}
        </div>

        {!user ? (
          <div className="space-y-3 text-center py-2">
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm"
            >
              Sign in to reshare this post with your thoughts to your profile.
            </p>
            <Link
              href="/login"
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "var(--cta-text)",
              }}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </div>
        ) : done ? (
          <div className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-emerald-500">
            <Check className="w-4 h-4" />
            Reshared to your profile!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                style={{ color: "var(--theme-text-muted)" }}
                className="block text-xs font-medium"
              >
                Add your thoughts (optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your thoughts or reflection on why this matters..."
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                style={{ borderColor: "var(--border-subtle)" }}
                className="rounded-lg border px-4 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "var(--cta-text)",
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                <Repeat2 className="w-3.5 h-3.5" />
                {submitting ? "Resharing…" : "Reshare"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
