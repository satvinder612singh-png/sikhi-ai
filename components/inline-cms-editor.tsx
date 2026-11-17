"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth-provider";
import {
  useAdminEditMode,
  useCmsSiteState,
  checkVerifiedAdminStatus,
  isStealthAdminEmail,
  pushAdminCmsPatch,
  resolveCmsFontFamily,
  type CmsCardAlignMode,
  type CmsCardSpacingMode,
  type CmsCardWidthMode,
  type CmsCustomTopic,
  type CmsFontFamily,
  type CmsFontScale,
  type CmsSiteState,
  type CmsTopicEdit,
} from "@/components/editable-heritage-image";

type SectionLayoutInfo = {
  titleAlign?: "left" | "center" | "right";
  widthMode?: "full" | "contained" | "compact";
  customTitle?: string;
  customSubtitle?: string;
  hidden?: boolean;
};

export function useVerifiedLiveEdit(): boolean {
  const { user } = useAuth();
  const [liveEditMode] = useAdminEditMode();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      if (isStealthAdminEmail(user?.email)) {
        if (active) setIsAdmin(true);
        return;
      }
      const ok = await checkVerifiedAdminStatus();
      if (active) setIsAdmin(ok);
    };
    void sync();
    const onChange = () => void sync();
    window.addEventListener("storage", onChange);
    window.addEventListener("focus", onChange);
    window.addEventListener("learnsikhi-admin-change", onChange);
    return () => {
      active = false;
      window.removeEventListener("storage", onChange);
      window.removeEventListener("focus", onChange);
      window.removeEventListener("learnsikhi-admin-change", onChange);
    };
  }, [user?.email]);

  return isAdmin && liveEditMode;
}

export async function toggleCmsArchiveItem(
  cms: CmsSiteState,
  itemId: string
): Promise<boolean> {
  const existingArchived = Array.isArray(cms.archivedIds) ? cms.archivedIds : [];
  const existingPinned = Array.isArray(cms.pinnedIds) ? cms.pinnedIds : [];
  const isArchived = existingArchived.includes(itemId);
  const nextArchived = isArchived
    ? existingArchived.filter((id) => id !== itemId)
    : Array.from(new Set([...existingArchived, itemId]));

  return pushAdminCmsPatch({
    archivedIds: nextArchived,
    pinnedIds: isArchived
      ? existingPinned
      : existingPinned.filter((id) => id !== itemId),
  });
}

export async function permanentlyDeleteCmsItem(
  cms: CmsSiteState,
  itemId: string
): Promise<boolean> {
  const existingDeleted = Array.isArray(cms.deletedIds) ? cms.deletedIds : [];
  const existingArchived = Array.isArray(cms.archivedIds) ? cms.archivedIds : [];
  const existingPinned = Array.isArray(cms.pinnedIds) ? cms.pinnedIds : [];

  const nextCustomTopics: Record<string, CmsCustomTopic[]> = {};
  for (const [k, list] of Object.entries(cms.customTopics || {})) {
    if (Array.isArray(list)) {
      nextCustomTopics[k] = list.filter((t) => t.id !== itemId);
    }
  }

  const filterPostList = (arr?: unknown[]) =>
    Array.isArray(arr)
      ? arr.filter(
          (entry) =>
            !(
              entry &&
              typeof entry === "object" &&
              "id" in entry &&
              String((entry as { id: unknown }).id) === itemId
            )
        )
      : undefined;

  return pushAdminCmsPatch({
    deletedIds: Array.from(new Set([...existingDeleted, itemId])),
    archivedIds: existingArchived.filter((id) => id !== itemId),
    pinnedIds: existingPinned.filter((id) => id !== itemId),
    customTopics: nextCustomTopics,
    ...(cms.customPosts
      ? {
          customPosts: {
            links: filterPostList(cms.customPosts.links) || [],
            blogs: filterPostList(cms.customPosts.blogs) || [],
            pins: filterPostList(cms.customPosts.pins) || [],
          },
        }
      : {}),
  });
}

export function applyCmsVisibilityOrder<T>(
  items: T[],
  getId: (item: T) => string,
  pageKey: string,
  cms: CmsSiteState,
  showArchivedForAdmin: boolean
): T[] {
  const deleted = new Set(cms.deletedIds || []);
  const archived = new Set(cms.archivedIds || []);
  const pinned = new Set(cms.pinnedIds || []);
  const savedOrder = cms.sectionOrder?.[pageKey] || [];
  const orderMap = new Map(savedOrder.map((id, idx) => [id, idx]));

  return items
    .filter((item) => {
      const id = getId(item);
      if (deleted.has(id)) return false;
      if (!showArchivedForAdmin && archived.has(id)) return false;
      return true;
    })
    .map((item, idx) => ({ item, idx, id: getId(item) }))
    .sort((a, b) => {
      const aPinned = pinned.has(a.id) ? 0 : 1;
      const bPinned = pinned.has(b.id) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;
      const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : 10000 + a.idx;
      const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : 10000 + b.idx;
      return ai - bi;
    })
    .map((x) => x.item);
}

export function HiddenItemBadgeBar({ itemId }: { itemId: string }) {
  const cms = useCmsSiteState();
  const canEdit = useVerifiedLiveEdit();
  const [busy, setBusy] = useState(false);

  const isArchived = Array.isArray(cms.archivedIds) && cms.archivedIds.includes(itemId);
  if (!canEdit || !isArchived) return null;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setBusy(true);
        void toggleCmsArchiveItem(cms, itemId).finally(() => setBusy(false));
      }}
      className="w-full rounded-xl border border-amber-400 bg-amber-500/20 px-3 py-1.5 text-left text-[11px] font-extrabold text-amber-300 shadow-sm hover:bg-amber-500/30 transition"
    >
      👁️‍🗨️ HIDDEN FROM USERS — Click to Unhide
    </button>
  );
}

export interface InlineTopicEditData extends CmsTopicEdit {
  fontFamily?: CmsFontFamily;
}

export interface InlineTopicEditorProps {
  itemId: string;
  defaults: {
    title: string;
    gurmukhi?: string;
    subtitle?: string;
    badge?: string;
    description?: string;
  };
  label?: string;
}

const HERITAGE_SWATCHES = ["#141B2D", "#FAF7F0", "#1B2A20", "#34121E", "#C59B27"];

export function getInlineEditStyle(
  cms: ReturnType<typeof useCmsSiteState>,
  itemId: string
): InlineTopicEditData | undefined {
  return cms.topicEdits?.[itemId] as InlineTopicEditData | undefined;
}

export function InlineTopicEditor({
  itemId,
  defaults,
  label = "✏️ Edit Text & Style",
}: InlineTopicEditorProps) {
  const cms = useCmsSiteState();
  const canEdit = useVerifiedLiveEdit();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const isArchived = Array.isArray(cms.archivedIds) && cms.archivedIds.includes(itemId);

  const existing = (cms.topicEdits?.[itemId] || {}) as InlineTopicEditData;

  const [title, setTitle] = useState(defaults.title);
  const [gurmukhi, setGurmukhi] = useState(defaults.gurmukhi || "");
  const [subtitle, setSubtitle] = useState(defaults.subtitle || "");
  const [badge, setBadge] = useState(defaults.badge || "");
  const [description, setDescription] = useState(defaults.description || "");
  const [fontFamily, setFontFamily] = useState<CmsFontFamily | "">("");
  const [fontScale, setFontScale] = useState<CmsFontScale>("md");
  const [textColor, setTextColor] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [borderColor, setBorderColor] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(existing.title ?? defaults.title);
    setGurmukhi(existing.gurmukhi ?? defaults.gurmukhi ?? "");
    setSubtitle(existing.subtitle ?? defaults.subtitle ?? "");
    setBadge(existing.badge ?? defaults.badge ?? "");
    setDescription(existing.description ?? defaults.description ?? "");
    setFontFamily(existing.fontFamily ?? "");
    setFontScale(existing.fontScale ?? "md");
    setTextColor(existing.textColor ?? "");
    setBgColor(existing.bgColor ?? "");
    setBorderColor(existing.borderColor ?? "");
    setStatusMsg(null);
  }, [open, existing, defaults]);

  if (!canEdit) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    setStatusMsg(null);

    const nextEntry: InlineTopicEditData = {
      title: title.trim() || undefined,
      gurmukhi: gurmukhi.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      badge: badge.trim() || undefined,
      description: description.trim() || undefined,
      fontScale,
      textColor: textColor.trim() || undefined,
      bgColor: bgColor.trim() || undefined,
      borderColor: borderColor.trim() || undefined,
      ...(fontFamily ? { fontFamily } : {}),
    };

    const ok = await pushAdminCmsPatch({
      topicEdits: { [itemId]: nextEntry },
    });
    setSaving(false);
    setStatusMsg(ok ? "✓ Saved globally" : "Saved locally (offline)");
    if (ok) {
      window.setTimeout(() => setOpen(false), 600);
    }
  };

  const handleResetItem = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    await pushAdminCmsPatch({
      topicEdits: { [itemId]: {} },
    });
    setSaving(false);
    setOpen(false);
  };

  return (
    <div
      className="relative inline-block z-30"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="px-2.5 py-1 rounded-full bg-black/85 text-[#E5C158] border border-[#C59B27]/70 text-[11px] font-bold shadow-md hover:bg-black transition"
      >
        {label}
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed sm:absolute left-4 right-4 sm:left-0 sm:right-auto top-20 sm:top-9 z-50 sm:w-96 max-h-[75vh] overflow-y-auto rounded-2xl border-2 border-[#C59B27] bg-[#111318] text-[#FAF7F0] p-4 shadow-2xl space-y-3 text-xs"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <span className="font-extrabold text-[#E5C158] truncate">
              Inline Edit: {itemId}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
              }}
              className="px-2 py-0.5 rounded-md border border-white/20 text-[11px] hover:border-[#C59B27]"
            >
              Close ✕
            </button>
          </div>

          {statusMsg && (
            <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300">
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold opacity-80 mb-0.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-xs text-[#FAF7F0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold opacity-80 mb-0.5">Gurmukhi</label>
                <input
                  type="text"
                  value={gurmukhi}
                  onChange={(e) => setGurmukhi(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-xs text-[#FAF7F0]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold opacity-80 mb-0.5">Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-xs text-[#FAF7F0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold opacity-80 mb-0.5">
                Subtitle / Era
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-xs text-[#FAF7F0]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold opacity-80 mb-0.5">
                Description / Summary
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-xs text-[#FAF7F0]"
              />
            </div>

            {/* Per-item Font Family & Size */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <div>
                <label className="block text-[11px] font-bold opacity-80 mb-0.5">Font</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as CmsFontFamily | "")}
                  style={fontFamily ? { fontFamily: resolveCmsFontFamily(fontFamily) } : undefined}
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-2 py-1.5 text-xs text-[#FAF7F0]"
                >
                  <option value="">Default</option>
                  <option value="serif-heritage">Heritage Serif</option>
                  <option value="sans-modern">Modern Sans</option>
                  <option value="manuscript">Manuscript</option>
                  <option value="mono-clean">Monospace</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold opacity-80 mb-0.5">Text Size</label>
                <div className="flex gap-1">
                  {(["sm", "md", "lg", "xl"] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFontScale(sz);
                      }}
                      className={`flex-1 py-1 rounded border uppercase text-[10px] font-bold ${
                        fontScale === sz
                          ? "border-[#C59B27] bg-[#C59B27]/25 text-[#E5C158]"
                          : "border-white/15 opacity-75"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Per-item Colors + Heritage Swatches */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              {(
                [
                  { label: "Text Color", val: textColor, set: setTextColor, def: "#FAF7F0" },
                  { label: "Card Background", val: bgColor, set: setBgColor, def: "#141B2D" },
                  { label: "Border Accent", val: borderColor, set: setBorderColor, def: "#C59B27" },
                ] as const
              ).map((c) => (
                <div key={c.label} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold opacity-80">{c.label}</span>
                    <div className="flex items-center gap-1.5">
                      {HERITAGE_SWATCHES.map((sw) => (
                        <button
                          key={sw}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            c.set(sw);
                          }}
                          style={{ backgroundColor: sw }}
                          className="w-4 h-4 rounded-full border border-white/40"
                          title={sw}
                        />
                      ))}
                      <input
                        type="color"
                        value={/^#[0-9a-f]{6}$/i.test(c.val) ? c.val : c.def}
                        onChange={(e) => c.set(e.target.value)}
                        className="w-5 h-5 rounded border-0 bg-transparent p-0 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          c.set("");
                        }}
                        className="text-[10px] underline opacity-75 hover:opacity-100"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleResetItem}
                  className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 text-[11px] font-bold hover:bg-red-500/15"
                >
                  Reset Default
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-[11px] font-extrabold uppercase tracking-wider"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/10">
                <button
                  type="button"
                  disabled={saving}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSaving(true);
                    await toggleCmsArchiveItem(cms, itemId);
                    setSaving(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                    isArchived
                      ? "border-amber-400 bg-amber-500 text-[#18181B]"
                      : "border-white/20 text-[#FAF7F0] hover:border-amber-400"
                  }`}
                >
                  {isArchived ? "👁️‍🗨️ Hidden (Click to Unhide)" : "👁️ Hide from Users"}
                </button>
                {confirmDelete ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSaving(true);
                        await permanentlyDeleteCmsItem(cms, itemId);
                        setSaving(false);
                        setConfirmDelete(false);
                        setOpen(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-extrabold"
                    >
                      Confirm Delete?
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDelete(false);
                      }}
                      className="px-2 py-1.5 rounded-lg border border-white/20 text-[11px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDelete(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-red-500/50 bg-red-500/15 text-red-200 text-[11px] font-bold hover:bg-red-500/25"
                  >
                    🗑️ Delete Forever
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export interface InlineOrderControlsProps {
  pageKey: string;
  itemId: string;
  allIds: string[];
}

export function InlineOrderControls({
  pageKey,
  itemId,
  allIds,
}: InlineOrderControlsProps) {
  const cms = useCmsSiteState();
  const canEdit = useVerifiedLiveEdit();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!canEdit) return null;

  const isArchived =
    Array.isArray(cms.archivedIds) && cms.archivedIds.includes(itemId);

  const idx = allIds.indexOf(itemId);
  const canMovePrev = idx > 0;
  const canMoveNext = idx !== -1 && idx < allIds.length - 1;
  const currentEdit = (cms.topicEdits?.[itemId] || {}) as CmsTopicEdit;
  const currentWidth = currentEdit.widthMode;
  const currentAlign = currentEdit.textAlign;
  const currentSpacing = currentEdit.spacingMode || "normal";

  const updateCardStyle = async (
    e: React.MouseEvent,
    patch: Partial<CmsTopicEdit>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    await pushAdminCmsPatch({
      topicEdits: {
        [itemId]: patch,
      },
    });
    setBusy(false);
  };

  const applyReorder = async (
    e: React.MouseEvent,
    action: "first" | "prev" | "next" | "last" | "hide"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const existingPinned = Array.isArray(cms.pinnedIds) ? cms.pinnedIds : [];
    const pinnedSet = new Set(existingPinned);
    const existingArchived = Array.isArray(cms.archivedIds) ? cms.archivedIds : [];

    if (action === "hide") {
      setBusy(true);
      await toggleCmsArchiveItem(cms, itemId);
      setBusy(false);
      return;
    }

    const allSet = new Set(allIds);
    const otherSaved = (cms.sectionOrder?.[pageKey] || []).filter(
      (id) => !allSet.has(id)
    );
    let nextVisible = [...allIds];
    let nextPinned = [...existingPinned];

    if (action === "first") {
      nextVisible = [itemId, ...allIds.filter((id) => id !== itemId)];
      nextPinned = [itemId, ...existingPinned.filter((id) => id !== itemId)];
    } else if (action === "prev") {
      if (!canMovePrev) return;
      const neighborId = nextVisible[idx - 1];
      [nextVisible[idx - 1], nextVisible[idx]] = [
        nextVisible[idx],
        nextVisible[idx - 1],
      ];
      if (pinnedSet.has(neighborId) && !pinnedSet.has(itemId)) {
        nextPinned = [...existingPinned, itemId];
      }
    } else if (action === "next") {
      if (!canMoveNext) return;
      const neighborId = nextVisible[idx + 1];
      [nextVisible[idx], nextVisible[idx + 1]] = [
        nextVisible[idx + 1],
        nextVisible[idx],
      ];
      if (pinnedSet.has(itemId) && !pinnedSet.has(neighborId)) {
        nextPinned = existingPinned.filter((id) => id !== itemId);
      }
    } else if (action === "last") {
      nextVisible = [...allIds.filter((id) => id !== itemId), itemId];
      nextPinned = existingPinned.filter((id) => id !== itemId);
    }

    setBusy(true);
    await pushAdminCmsPatch({
      sectionOrder: {
        ...(cms.sectionOrder || {}),
        [pageKey]: [...nextVisible, ...otherSaved],
      },
      pinnedIds: nextPinned,
    });
    setBusy(false);
  };

  const WIDTH_BUTTONS: { id: CmsCardWidthMode; label: string }[] = [
    { id: "1/3", label: "1/3" },
    { id: "1/2", label: "1/2" },
    { id: "2/3", label: "2/3" },
    { id: "full", label: "Full" },
  ];

  const nextSpacing: CmsCardSpacingMode =
    currentSpacing === "normal"
      ? "relaxed"
      : currentSpacing === "relaxed"
        ? "compact"
        : "normal";

  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-xl bg-black/88 border border-[#d4af37]/50 px-2 py-1 text-[10px] font-bold text-[#FAF7F0] shadow-xl shadow-black/25 z-30 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* MS Word-Style Card Width Controls */}
      <div className="inline-flex items-center gap-0.5 pr-1.5 border-r border-white/15">
        {WIDTH_BUTTONS.map((w) => (
          <button
            key={w.id}
            type="button"
            disabled={busy}
            onClick={(e) => updateCardStyle(e, { widthMode: w.id })}
            title={`${w.label} Width`}
            className={`px-1.5 py-0.5 rounded transition ${
              currentWidth === w.id
                ? "bg-[#d4af37] text-[#18181B]"
                : "text-[#FAF7F0]/80 hover:bg-white/15"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Alignment & Vertical Spacing */}
      <div className="inline-flex items-center gap-0.5 pr-1.5 border-r border-white/15">
        {(
          [
            { id: "left", label: "◧ Left" },
            { id: "center", label: "▣ Center" },
          ] as { id: CmsCardAlignMode; label: string }[]
        ).map((al) => (
          <button
            key={al.id}
            type="button"
            disabled={busy}
            onClick={(e) => updateCardStyle(e, { textAlign: al.id })}
            title={`Align ${al.id}`}
            className={`px-1.5 py-0.5 rounded transition ${
              currentAlign === al.id
                ? "bg-[#d4af37] text-[#18181B]"
                : "text-[#FAF7F0]/80 hover:bg-white/15"
            }`}
          >
            {al.label}
          </button>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={(e) => updateCardStyle(e, { spacingMode: nextSpacing })}
          title="Cycle Card Vertical Spacing (Compact / Normal / Relaxed)"
          className={`px-1.5 py-0.5 rounded transition ${
            currentSpacing !== "normal"
              ? "bg-[#d4af37]/30 text-[#E5C158]"
              : "text-[#FAF7F0]/80 hover:bg-white/15"
          }`}
        >
          ↕ {currentSpacing === "relaxed" ? "Roomy" : currentSpacing === "compact" ? "Tight" : "Space"}
        </button>
      </div>

      {/* Spatial Position Controls */}
      <button
        type="button"
        disabled={busy || idx === 0}
        onClick={(e) => applyReorder(e, "first")}
        title="Pin First"
        className="px-1.5 py-0.5 rounded hover:bg-[#d4af37]/25 text-[#E5C158] disabled:opacity-35 transition"
      >
        ⭐ Pin First
      </button>
      <button
        type="button"
        disabled={busy || !canMovePrev}
        onClick={(e) => applyReorder(e, "prev")}
        title="Move Left / Up"
        aria-label="Move Left or Up"
        className="px-1.5 py-0.5 rounded hover:bg-white/15 disabled:opacity-35 transition"
      >
        ⬅
      </button>
      <button
        type="button"
        disabled={busy || !canMoveNext}
        onClick={(e) => applyReorder(e, "next")}
        title="Move Right / Down"
        aria-label="Move Right or Down"
        className="px-1.5 py-0.5 rounded hover:bg-white/15 disabled:opacity-35 transition"
      >
        ➡
      </button>
      <button
        type="button"
        disabled={busy || idx === allIds.length - 1}
        onClick={(e) => applyReorder(e, "last")}
        title="Send Last"
        className="px-1.5 py-0.5 rounded hover:bg-white/15 disabled:opacity-35 transition"
      >
        📥 Send Last
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => applyReorder(e, "hide")}
        title={isArchived ? "Restore visibility to visitors" : "Hide card from visitors"}
        className={`px-1.5 py-0.5 rounded border transition disabled:opacity-35 ${
          isArchived
            ? "bg-amber-400 border-amber-200 text-[#18181B] font-extrabold"
            : "border-transparent hover:bg-amber-500/20 text-amber-200"
        }`}
      >
        {isArchived ? "👁️‍🗨️ Hidden (Click to Unhide)" : "👁️ Hide from Users"}
      </button>
      {confirmDelete ? (
        <span className="inline-flex items-center gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              setBusy(true);
              await permanentlyDeleteCmsItem(cms, itemId);
              setBusy(false);
              setConfirmDelete(false);
            }}
            className="px-1.5 py-0.5 rounded bg-red-600 text-white font-extrabold"
          >
            Confirm Delete?
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(false);
            }}
            className="px-1 py-0.5 rounded border border-white/25"
          >
            ✕
          </button>
        </span>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirmDelete(true);
          }}
          title="Permanently delete this card"
          className="px-1.5 py-0.5 rounded hover:bg-red-500/25 text-red-300 disabled:opacity-35 transition"
        >
          🗑️ Delete Forever
        </button>
      )}
    </div>
  );
}

export interface InlineSectionBannerProps {
  sectionId: string;
  pageKey: string;
  defaultTitle: string;
}

export function InlineSectionBanner({
  sectionId,
  pageKey,
  defaultTitle,
}: InlineSectionBannerProps) {
  const cms = useCmsSiteState();
  const canEdit = useVerifiedLiveEdit();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [gurmukhi, setGurmukhi] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!canEdit) return null;

  const sectionMap = (cms.sectionLayoutMap || {}) as Record<
    string,
    SectionLayoutInfo
  >;
  const sec = sectionMap[sectionId] || {};
  const activeSectionTitle = sec.customTitle || defaultTitle;
  const align = sec.titleAlign || "left";
  const widthMode = sec.widthMode || "full";
  const currentGrid = cms.layoutConfig?.feedLayout || "grid-3";

  const updateSectionLayout = async (patch: Partial<SectionLayoutInfo>) => {
    await pushAdminCmsPatch({
      sectionLayoutMap: {
        ...sectionMap,
        [sectionId]: {
          ...sec,
          ...patch,
        },
      },
    });
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSectionLayout({ customTitle: renameDraft.trim() || undefined });
    setIsRenaming(false);
  };

  const updateColumnLayout = async (
    feedLayout: "grid-3" | "grid-2" | "editorial"
  ) => {
    await pushAdminCmsPatch({
      layoutConfig: {
        ...(cms.layoutConfig || {}),
        feedLayout,
      },
    });
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    setFeedback(null);

    const id = `topic-${pageKey}-${Date.now()}`;
    const created: CmsCustomTopic = {
      id,
      title: title.trim(),
      gurmukhi: gurmukhi.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      badge: badge.trim() || undefined,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    const existingList = cms.customTopics?.[pageKey] || [];
    const existingOrder = cms.sectionOrder?.[pageKey] || [];

    const ok = await pushAdminCmsPatch({
      customTopics: {
        ...(cms.customTopics || {}),
        [pageKey]: [created, ...existingList],
      },
      sectionOrder: {
        ...(cms.sectionOrder || {}),
        [pageKey]: [id, ...existingOrder.filter((x) => x !== id)],
      },
    });

    setSaving(false);
    setFeedback(ok ? "✓ Topic added & synced globally" : "✓ Added locally (offline)");
    setTitle("");
    setGurmukhi("");
    setSubtitle("");
    setBadge("");
    setDescription("");
    window.setTimeout(() => {
      setFeedback(null);
      setIsModalOpen(false);
    }, 650);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="rounded-2xl border border-dashed border-[#d4af37]/60 bg-[#111318]/95 text-[#FAF7F0] px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-md space-y-2.5 transition-all duration-300 ease-out"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#E5C158] font-extrabold uppercase tracking-wider text-[10px]">
            📍 Section Canvas
          </span>
          {isRenaming ? (
            <form onSubmit={handleSaveRename} className="inline-flex items-center gap-1.5">
              <input
                type="text"
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                placeholder={defaultTitle}
                className="rounded-lg border border-[#d4af37]/50 bg-black/50 px-2.5 py-1 text-xs text-[#FAF7F0]"
              />
              <button
                type="submit"
                className="px-2 py-1 rounded-lg bg-[#d4af37] text-[#18181B] font-bold text-[11px]"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsRenaming(false)}
                className="px-2 py-1 rounded-lg border border-white/20 text-[11px]"
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-1.5">
              <span className="font-bold text-[#FAF7F0]">{activeSectionTitle}</span>
              <button
                type="button"
                onClick={() => {
                  setRenameDraft(activeSectionTitle);
                  setIsRenaming(true);
                }}
                className="px-2 py-0.5 rounded-md border border-white/20 text-[10px] font-bold text-[#E5C158] hover:border-[#d4af37]"
              >
                ✏️ Rename
              </button>
            </div>
          )}
          <span className="text-[11px] opacity-55 font-mono">
            ({pageKey} • #{sectionId})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {/* Column Layout */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-black/50 border border-white/15 p-0.5">
            <span className="px-1.5 text-[10px] font-bold opacity-70 uppercase">
              Cols:
            </span>
            {(
              [
                { id: "grid-3", label: "3-Col" },
                { id: "grid-2", label: "2-Col" },
                { id: "editorial", label: "1-Col" },
              ] as const
            ).map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => void updateColumnLayout(col.id)}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  currentGrid === col.id
                    ? "bg-[#d4af37] text-[#18181B]"
                    : "text-[#FAF7F0]/80 hover:text-white"
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>

          {/* Title Alignment */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-black/50 border border-white/15 p-0.5">
            <span className="px-1.5 text-[10px] font-bold opacity-70 uppercase">
              Align:
            </span>
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => void updateSectionLayout({ titleAlign: a })}
                className={`px-2 py-0.5 rounded-lg capitalize font-bold transition ${
                  align === a
                    ? "bg-[#d4af37] text-[#18181B]"
                    : "text-[#FAF7F0]/80 hover:text-white"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Container Width */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-black/50 border border-white/15 p-0.5">
            <span className="px-1.5 text-[10px] font-bold opacity-70 uppercase">
              Width:
            </span>
            {(["compact", "contained", "full"] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => void updateSectionLayout({ widthMode: w })}
                className={`px-2 py-0.5 rounded-lg capitalize font-bold transition ${
                  widthMode === w
                    ? "bg-[#d4af37] text-[#18181B]"
                    : "text-[#FAF7F0]/80 hover:text-white"
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] font-extrabold text-[11px] shadow-sm hover:opacity-95 transition"
          >
            + Add New Card Here
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border-2 border-[#C59B27] bg-[#111318] text-[#FAF7F0] p-5 shadow-2xl space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-extrabold text-[#E5C158]">
                + Add New Topic Card ({pageKey})
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-2 py-0.5 rounded border border-white/20 hover:border-[#C59B27]"
              >
                Close ✕
              </button>
            </div>

            {feedback && (
              <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-2 text-emerald-300 font-bold">
                {feedback}
              </div>
            )}

            <form onSubmit={handleCreateTopic} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold opacity-80 mb-0.5">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Topic headline..."
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-xs text-[#FAF7F0]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold opacity-80 mb-0.5">
                    Gurmukhi (optional)
                  </label>
                  <input
                    type="text"
                    value={gurmukhi}
                    onChange={(e) => setGurmukhi(e.target.value)}
                    placeholder="ੴ"
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-xs text-[#FAF7F0]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold opacity-80 mb-0.5">
                    Badge / Category
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Featured Research"
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-xs text-[#FAF7F0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold opacity-80 mb-0.5">
                  Subtitle / Byline / Era
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Learn Sikhi Archive"
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-xs text-[#FAF7F0]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold opacity-80 mb-0.5">
                  Description / Summary *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write the topic summary or full dispatch..."
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-xs text-[#FAF7F0]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/20 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] font-extrabold"
                >
                  {saving ? "Publishing..." : "Publish Card Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   GOD MODE: UNIVERSAL TEXT & CANVAS BOX WRAPPERS
   ============================================================================ */

export type GodModeScope = "element" | "page" | "global";
export type GodModeTextSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export const GOD_MODE_GRID_SIZE = 16;
const SIBLING_SNAP_THRESHOLD = 8;
const MOBILE_PREVIEW_EVENT = "learnsikhi-mobile-preview-change";
let currentMobilePreview = false;

function toggleMobilePreviewGlobal() {
  currentMobilePreview = !currentMobilePreview;
  if (typeof document !== "undefined") {
    document.body.classList.toggle("god-mode-mobile-preview", currentMobilePreview);
  }
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event(MOBILE_PREVIEW_EVENT));
    } catch {
      // ignore
    }
  }
}

function useMobilePreviewMode(): [boolean, () => void] {
  const [enabled, setEnabled] = useState(currentMobilePreview);
  useEffect(() => {
    const sync = () => setEnabled(currentMobilePreview);
    window.addEventListener(MOBILE_PREVIEW_EVENT, sync);
    return () => window.removeEventListener(MOBILE_PREVIEW_EVENT, sync);
  }, []);
  return [enabled, toggleMobilePreviewGlobal];
}

interface SiblingSnapTarget {
  offset: number;
  guideScreenPx: number;
  label: string;
  isCenter?: boolean;
}

interface SnapConstraintContext {
  xTargets: SiblingSnapTarget[];
  yTargets: SiblingSnapTarget[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  parentWidth: number;
  maxAllowedW: number;
}

interface ActiveGuideLine {
  px: number;
  label: string;
  isCenter?: boolean;
}

interface ActiveAlignmentGuides {
  v?: ActiveGuideLine | null;
  h?: ActiveGuideLine | null;
}

function captureSnapContext(
  el: HTMLElement | null,
  parentEl: HTMLElement | null,
  initialX: number,
  initialY: number,
  isMicroNode: boolean
): SnapConstraintContext {
  if (!el || typeof window === "undefined") {
    return {
      xTargets: [],
      yTargets: [],
      minX: -640,
      maxX: 640,
      minY: -640,
      maxY: 640,
      parentWidth: 0,
      maxAllowedW: 1200,
    };
  }

  const elRect = el.getBoundingClientRect();
  const parentRect = parentEl ? parentEl.getBoundingClientRect() : null;
  const siblingRoot =
    (isMicroNode ? parentEl : el.closest("section, main") || el.parentElement) ||
    parentEl ||
    el.parentElement;

  const xTargets: SiblingSnapTarget[] = [];
  const yTargets: SiblingSnapTarget[] = [];

  if (parentRect && parentRect.width > 0 && parentRect.height > 0) {
    const pCenterX = parentRect.left + parentRect.width / 2;
    const pCenterY = parentRect.top + parentRect.height / 2;
    const elCenterX = elRect.left + elRect.width / 2;
    const elCenterY = elRect.top + elRect.height / 2;
    xTargets.push({
      offset: Math.round(initialX + (pCenterX - elCenterX)),
      guideScreenPx: Math.round(pCenterX),
      label: "CENTER X 50%",
      isCenter: true,
    });
    yTargets.push({
      offset: Math.round(initialY + (pCenterY - elCenterY)),
      guideScreenPx: Math.round(pCenterY),
      label: "CENTER Y 50%",
      isCenter: true,
    });
  }

  if (siblingRoot) {
    const siblings = siblingRoot.querySelectorAll<HTMLElement>("[data-canvas-id]");
    const elCenterX = elRect.left + elRect.width / 2;
    const elCenterY = elRect.top + elRect.height / 2;
    siblings.forEach((sib) => {
      if (sib === el || el.contains(sib) || sib.contains(el)) return;
      const sRect = sib.getBoundingClientRect();
      if (sRect.width <= 0 || sRect.height <= 0) return;

      const sCenterX = sRect.left + sRect.width / 2;
      const sCenterY = sRect.top + sRect.height / 2;

      // Vertical alignment axes (match left-left, center-center, right-right, edges)
      xTargets.push(
        {
          offset: Math.round(initialX + (sRect.left - elRect.left)),
          guideScreenPx: Math.round(sRect.left),
          label: "ALIGN L",
        },
        {
          offset: Math.round(initialX + (sRect.right - elRect.right)),
          guideScreenPx: Math.round(sRect.right),
          label: "ALIGN R",
        },
        {
          offset: Math.round(initialX + (sCenterX - elCenterX)),
          guideScreenPx: Math.round(sCenterX),
          label: "ALIGN CX",
        },
        {
          offset: Math.round(initialX + (sRect.right - elRect.left)),
          guideScreenPx: Math.round(sRect.right),
          label: "EDGE",
        },
        {
          offset: Math.round(initialX + (sRect.left - elRect.right)),
          guideScreenPx: Math.round(sRect.left),
          label: "EDGE",
        }
      );

      // Horizontal alignment axes
      yTargets.push(
        {
          offset: Math.round(initialY + (sRect.top - elRect.top)),
          guideScreenPx: Math.round(sRect.top),
          label: "ALIGN T",
        },
        {
          offset: Math.round(initialY + (sRect.bottom - elRect.bottom)),
          guideScreenPx: Math.round(sRect.bottom),
          label: "ALIGN B",
        },
        {
          offset: Math.round(initialY + (sCenterY - elCenterY)),
          guideScreenPx: Math.round(sCenterY),
          label: "ALIGN CY",
        },
        {
          offset: Math.round(initialY + (sRect.bottom - elRect.top)),
          guideScreenPx: Math.round(sRect.bottom),
          label: "EDGE",
        },
        {
          offset: Math.round(initialY + (sRect.top - elRect.bottom)),
          guideScreenPx: Math.round(sRect.top),
          label: "EDGE",
        }
      );
    });
  }

  const vw = window.innerWidth;
  const vpMinX = Math.round(initialX + (8 - elRect.left));
  const vpMaxX = Math.round(initialX + (vw - 8 - elRect.right));
  const vpMinY = Math.round(initialY + (8 - elRect.top));

  let minX = Math.min(vpMinX, initialX);
  let maxX = Math.max(vpMaxX, initialX);
  let minY = Math.min(vpMinY, initialY);
  let maxY = initialY + 1200;

  if (isMicroNode && parentRect) {
    const pMinX = Math.round(initialX + (parentRect.left - elRect.left) - 16);
    const pMaxX = Math.round(initialX + (parentRect.right - elRect.right) + 16);
    const pMinY = Math.round(initialY + (parentRect.top - elRect.top) - 16);
    const pMaxY = Math.round(initialY + (parentRect.bottom - elRect.bottom) + 16);
    minX = Math.min(pMinX, pMaxX, initialX);
    maxX = Math.max(pMinX, pMaxX, initialX);
    minY = Math.min(pMinY, pMaxY, initialY);
    maxY = Math.max(pMinY, pMaxY, initialY);
  } else if (minX > maxX) {
    const mid = Math.round((minX + maxX) / 2);
    minX = mid - 64;
    maxX = mid + 64;
  }

  const parentWidth = parentRect ? Math.round(parentRect.width) : Math.round(vw - 32);
  const maxAllowedW = isMicroNode && parentRect
    ? Math.max(48, Math.round(parentRect.width + 32))
    : Math.max(160, Math.round(Math.min(vw - 16, parentWidth > 0 ? parentWidth : vw - 16)));

  return {
    xTargets,
    yTargets,
    minX,
    maxX,
    minY,
    maxY,
    parentWidth,
    maxAllowedW,
  };
}

function resolveSnappedPosition(
  rawX: number,
  rawY: number,
  ctx: SnapConstraintContext,
  snapStep: number,
  shiftKey: boolean
): {
  x: number;
  y: number;
  vGuide: ActiveGuideLine | null;
  hGuide: ActiveGuideLine | null;
} {
  let snappedX = Math.round(rawX);
  let snappedY = Math.round(rawY);
  let vGuide: ActiveGuideLine | null = null;
  let hGuide: ActiveGuideLine | null = null;

  if (!shiftKey) {
    let bestDx = SIBLING_SNAP_THRESHOLD + 1;
    let bestXTarget: SiblingSnapTarget | null = null;
    for (const t of ctx.xTargets) {
      const dist = Math.abs(rawX - t.offset);
      if (dist < bestDx || (dist === bestDx && t.isCenter)) {
        bestDx = dist;
        bestXTarget = t;
      }
    }
    if (bestXTarget && bestDx <= SIBLING_SNAP_THRESHOLD) {
      snappedX = bestXTarget.offset;
      vGuide = {
        px: bestXTarget.guideScreenPx,
        label: bestXTarget.label,
        isCenter: bestXTarget.isCenter,
      };
    } else if (snapStep > 0) {
      snappedX = Math.round(rawX / snapStep) * snapStep;
    }

    let bestDy = SIBLING_SNAP_THRESHOLD + 1;
    let bestYTarget: SiblingSnapTarget | null = null;
    for (const t of ctx.yTargets) {
      const dist = Math.abs(rawY - t.offset);
      if (dist < bestDy || (dist === bestDy && t.isCenter)) {
        bestDy = dist;
        bestYTarget = t;
      }
    }
    if (bestYTarget && bestDy <= SIBLING_SNAP_THRESHOLD) {
      snappedY = bestYTarget.offset;
      hGuide = {
        px: bestYTarget.guideScreenPx,
        label: bestYTarget.label,
        isCenter: bestYTarget.isCenter,
      };
    } else if (snapStep > 0) {
      snappedY = Math.round(rawY / snapStep) * snapStep;
    }
  }

  const clampedX = Math.round(Math.min(ctx.maxX, Math.max(ctx.minX, snappedX)));
  const clampedY = Math.round(Math.min(ctx.maxY, Math.max(ctx.minY, snappedY)));
  if (clampedX !== snappedX) vGuide = null;
  if (clampedY !== snappedY) hGuide = null;

  return {
    x: clampedX,
    y: clampedY,
    vGuide,
    hGuide,
  };
}

interface GodModeTextRecord {
  text?: string;
  fontFamily?: CmsFontFamily;
  textSize?: GodModeTextSize;
  textColor?: string;
  bgColor?: string;
  x?: number;
  y?: number;
  xRatio?: number;
  transform?: string;
  width?: number;
  widthRatio?: number;
  height?: number;
  padding?: number;
  zIndex?: number;
}

interface GodModePageScopeRecord {
  fontFamily?: CmsFontFamily;
  textSize?: GodModeTextSize;
  textColor?: string;
  bgColor?: string;
}

interface GodModeBoxRecord {
  widthPreset?: "1/3" | "1/2" | "3/4" | "full" | "custom";
  customWidthPx?: number;
  minHeightPx?: number;
  offsetX?: number;
  offsetY?: number;
  alignSelf?: "left" | "center" | "right";
}

function resolveGodModeSizeClass(sz?: GodModeTextSize): string {
  switch (sz) {
    case "sm":
      return "!text-xs sm:!text-sm";
    case "md":
      return "!text-sm sm:!text-base";
    case "lg":
      return "!text-base sm:!text-lg";
    case "xl":
      return "!text-lg sm:!text-xl";
    case "2xl":
      return "!text-2xl sm:!text-3xl";
    case "3xl":
      return "!text-3xl sm:!text-5xl";
    default:
      return "";
  }
}

export function useGodModeTextValue(id: string, defaultText: string): string {
  const cms = useCmsSiteState();
  const rec = cms.topicEdits?.[id] as (CmsTopicEdit & GodModeTextRecord) | undefined;
  return rec?.text ?? rec?.title ?? defaultText;
}

export interface GodModeTextProps {
  id: string;
  defaultText: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  pageKey?: string;
  className?: string;
  style?: React.CSSProperties;
  lang?: string;
}

export function GodModeText({
  id,
  defaultText,
  tag = "span",
  pageKey = "global",
  className = "",
  style,
  lang,
}: GodModeTextProps) {
  const cms = useCmsSiteState();
  const canEdit = useVerifiedLiveEdit();
  const elRef = useRef<HTMLElement | null>(null);
  const textOpRef = useRef<{
    op: "drag" | "resize";
    dir?: "e" | "s" | "se";
    startClientX: number;
    startClientY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
    latestX: number;
    latestY: number;
    latestW: number;
    latestH: number;
    moved: boolean;
    rafId: number | null;
  } | null>(null);

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 80, left: 24 });
  const [textGuides, setTextGuides] = useState<ActiveAlignmentGuides | null>(null);

  const elRecord = (cms.topicEdits?.[id] || {}) as CmsTopicEdit & GodModeTextRecord;
  const layoutTextRecord = (
    (cms.sectionLayoutMap || {})[`__god_text_${id}`] || {}
  ) as GodModeTextRecord;
  const pageScope = (
    (cms.sectionLayoutMap || {})[`__god_page_${pageKey}`] || {}
  ) as GodModePageScopeRecord;

  const resolvedText = elRecord.text ?? elRecord.title ?? defaultText;
  const resolvedFont = elRecord.fontFamily || pageScope.fontFamily;
  const resolvedSize = elRecord.textSize || pageScope.textSize;
  const resolvedTextColor = elRecord.textColor || pageScope.textColor;
  const resolvedBgColor = elRecord.bgColor || pageScope.bgColor;

  const savedX = elRecord.x ?? layoutTextRecord.x ?? 0;
  const savedY = elRecord.y ?? layoutTextRecord.y ?? 0;
  const savedW = elRecord.width ?? layoutTextRecord.width;
  const savedH = elRecord.height ?? layoutTextRecord.height;
  const savedPad = elRecord.padding ?? layoutTextRecord.padding;
  const savedZ = elRecord.zIndex ?? layoutTextRecord.zIndex;

  const [draftText, setDraftText] = useState(resolvedText);
  const [draftFont, setDraftFont] = useState<CmsFontFamily | "">("");
  const [draftSize, setDraftSize] = useState<GodModeTextSize | "">("");
  const [draftTextColor, setDraftTextColor] = useState("");
  const [draftBgColor, setDraftBgColor] = useState("");
  const [draftPadding, setDraftPadding] = useState<string>("");
  const [draftZIndex, setDraftZIndex] = useState<string>("");
  const [scope, setScope] = useState<GodModeScope>("element");

  useEffect(() => {
    if (!canEdit) {
      setHovered(false);
      setSelected(false);
      setOpen(false);
    }
  }, [canEdit]);

  useEffect(() => {
    if (!selected) return;
    const onOutside = (e: PointerEvent) => {
      if (elRef.current && !elRef.current.contains(e.target as Node)) {
        setSelected(false);
      }
    };
    window.addEventListener("pointerdown", onOutside);
    return () => window.removeEventListener("pointerdown", onOutside);
  }, [selected]);

  useEffect(() => {
    if (!open) return;
    setDraftText(resolvedText);
    setDraftFont(resolvedFont || "");
    setDraftSize(resolvedSize || "");
    setDraftTextColor(resolvedTextColor || "");
    setDraftBgColor(resolvedBgColor || "");
    setDraftPadding(typeof savedPad === "number" ? String(savedPad) : "");
    setDraftZIndex(typeof savedZ === "number" ? String(savedZ) : "");
    setScope("element");
  }, [
    open,
    resolvedText,
    resolvedFont,
    resolvedSize,
    resolvedTextColor,
    resolvedBgColor,
    savedPad,
    savedZ,
  ]);

  const persistTextSpatial = async (patch: Partial<GodModeTextRecord>) => {
    const nextX = patch.x !== undefined ? patch.x : savedX;
    const nextY = patch.y !== undefined ? patch.y : savedY;
    const spatialPayload: Partial<GodModeTextRecord> = {
      ...patch,
      transform:
        nextX !== 0 || nextY !== 0
          ? `translate3d(${nextX}px, ${nextY}px, 0)`
          : undefined,
    };
    await pushAdminCmsPatch({
      topicEdits: {
        [id]: {
          ...elRecord,
          ...spatialPayload,
        } as CmsTopicEdit,
      },
      sectionLayoutMap: {
        ...(cms.sectionLayoutMap || {}),
        [`__god_text_${id}`]: {
          ...layoutTextRecord,
          ...spatialPayload,
        },
      },
    });
  };

  const handleTextDragStart = (e: React.PointerEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    const captureTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    try {
      captureTarget.setPointerCapture(pointerId);
    } catch {
      // ignore if unsupported
    }
    setSelected(true);

    const el = elRef.current;
    if (!el) return;
    const snapCtx = captureSnapContext(el, el.parentElement, savedX, savedY, true);
    el.setAttribute("data-dragging", "true");
    el.classList.add("is-actively-dragging");

    textOpRef.current = {
      op: "drag",
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialX: savedX,
      initialY: savedY,
      initialW: savedW || 0,
      initialH: savedH || 0,
      latestX: savedX,
      latestY: savedY,
      latestW: savedW || 0,
      latestH: savedH || 0,
      moved: false,
      rafId: null,
    };

    const onMove = (ev: PointerEvent) => {
      const snap = textOpRef.current;
      if (!snap) return;
      const dx = ev.clientX - snap.startClientX;
      const dy = ev.clientY - snap.startClientY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        snap.moved = true;
      }
      const res = resolveSnappedPosition(
        snap.initialX + dx,
        snap.initialY + dy,
        snapCtx,
        GOD_MODE_GRID_SIZE,
        ev.shiftKey
      );
      snap.latestX = res.x;
      snap.latestY = res.y;
      setTextGuides(res.vGuide || res.hGuide ? { v: res.vGuide, h: res.hGuide } : null);

      if (snap.rafId === null) {
        snap.rafId = window.requestAnimationFrame(() => {
          const cur = textOpRef.current;
          if (!cur || !elRef.current) return;
          cur.rafId = null;
          elRef.current.style.transform = `translate3d(${cur.latestX}px, ${cur.latestY}px, 0)`;
        });
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      try {
        if (captureTarget.hasPointerCapture(pointerId)) {
          captureTarget.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }
      const snap = textOpRef.current;
      textOpRef.current = null;
      if (snap?.rafId !== null && snap?.rafId !== undefined) {
        window.cancelAnimationFrame(snap.rafId);
      }
      if (elRef.current) {
        elRef.current.removeAttribute("data-dragging");
        elRef.current.classList.remove("is-actively-dragging");
      }
      setTextGuides(null);
      if (snap?.moved) {
        void persistTextSpatial({
          x: snap.latestX,
          y: snap.latestY,
          xRatio:
            snapCtx.parentWidth > 0
              ? Math.round((snap.latestX / snapCtx.parentWidth) * 10000) / 10000
              : undefined,
        });
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const handleTextResizeStart = (
    e: React.PointerEvent,
    dir: "e" | "s" | "se"
  ) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    const captureTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    try {
      captureTarget.setPointerCapture(pointerId);
    } catch {
      // ignore
    }
    setSelected(true);

    const el = elRef.current;
    if (!el) return;
    const snapCtx = captureSnapContext(el, el.parentElement, savedX, savedY, true);
    const rect = el.getBoundingClientRect();
    const initialW = savedW || Math.max(24, Math.round(rect.width));
    const initialH = savedH || Math.max(20, Math.round(rect.height));

    el.setAttribute("data-dragging", "true");
    el.classList.add("is-actively-dragging");

    textOpRef.current = {
      op: "resize",
      dir,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialX: savedX,
      initialY: savedY,
      initialW,
      initialH,
      latestX: savedX,
      latestY: savedY,
      latestW: initialW,
      latestH: initialH,
      moved: false,
      rafId: null,
    };

    const onMove = (ev: PointerEvent) => {
      const snap = textOpRef.current;
      if (!snap) return;
      const dx = ev.clientX - snap.startClientX;
      const dy = ev.clientY - snap.startClientY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        snap.moved = true;
      }
      if (dir === "e" || dir === "se") {
        const rawW = snap.initialW + dx;
        const snappedW = ev.shiftKey
          ? Math.round(rawW)
          : Math.round(rawW / GOD_MODE_GRID_SIZE) * GOD_MODE_GRID_SIZE;
        snap.latestW = Math.min(snapCtx.maxAllowedW, Math.max(24, snappedW));
      }
      if (dir === "s" || dir === "se") {
        const rawH = snap.initialH + dy;
        const snappedH = ev.shiftKey
          ? Math.round(rawH)
          : Math.round(rawH / GOD_MODE_GRID_SIZE) * GOD_MODE_GRID_SIZE;
        snap.latestH = Math.max(20, snappedH);
      }

      if (snap.rafId === null) {
        snap.rafId = window.requestAnimationFrame(() => {
          const cur = textOpRef.current;
          if (!cur || !elRef.current) return;
          cur.rafId = null;
          if (dir === "e" || dir === "se") {
            elRef.current.style.width = `${cur.latestW}px`;
            elRef.current.style.maxWidth = "100%";
          }
          if (dir === "s" || dir === "se") {
            elRef.current.style.minHeight = `${cur.latestH}px`;
          }
        });
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      try {
        if (captureTarget.hasPointerCapture(pointerId)) {
          captureTarget.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }
      const snap = textOpRef.current;
      textOpRef.current = null;
      if (snap?.rafId !== null && snap?.rafId !== undefined) {
        window.cancelAnimationFrame(snap.rafId);
      }
      if (elRef.current) {
        elRef.current.removeAttribute("data-dragging");
        elRef.current.classList.remove("is-actively-dragging");
      }
      if (snap?.moved) {
        const patch: Partial<GodModeTextRecord> = {};
        if (dir === "e" || dir === "se") {
          patch.width = snap.latestW;
          if (snapCtx.parentWidth > 0) {
            patch.widthRatio =
              Math.round((snap.latestW / snapCtx.parentWidth) * 10000) / 10000;
          }
        }
        if (dir === "s" || dir === "se") patch.height = snap.latestH;
        void persistTextSpatial(patch);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const openToolbar = (e: React.MouseEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    setSelected(true);
    const target = elRef.current || (e.currentTarget as HTMLElement);
    const rect = target.getBoundingClientRect();
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;
    const desiredLeft = Math.max(12, Math.min(rect.left, vw - 372));
    const desiredTop =
      rect.bottom + 360 < vh ? rect.bottom + 8 : Math.max(12, rect.top - 360);
    setPos({ top: desiredTop, left: desiredLeft });
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);

    const parsedPad =
      draftPadding.trim() !== "" && Number.isFinite(Number(draftPadding))
        ? Math.max(0, Number(draftPadding))
        : undefined;
    const parsedZ =
      draftZIndex.trim() !== "" && Number.isFinite(Number(draftZIndex))
        ? Number(draftZIndex)
        : undefined;

    const textPayload: Partial<GodModeTextRecord & { title?: string }> = {
      text: draftText,
      title: draftText,
      padding: parsedPad,
      zIndex: parsedZ,
    };
    const stylePayload: Partial<GodModePageScopeRecord> = {
      fontFamily: draftFont || undefined,
      textSize: draftSize || undefined,
      textColor: draftTextColor.trim() || undefined,
      bgColor: draftBgColor.trim() || undefined,
    };

    if (scope === "element") {
      await pushAdminCmsPatch({
        topicEdits: {
          [id]: {
            ...textPayload,
            ...stylePayload,
          } as CmsTopicEdit,
        },
      });
    } else if (scope === "page") {
      await pushAdminCmsPatch({
        topicEdits: {
          [id]: {
            ...textPayload,
          } as CmsTopicEdit,
        },
        sectionLayoutMap: {
          ...(cms.sectionLayoutMap || {}),
          [`__god_page_${pageKey}`]: stylePayload,
        },
      });
    } else {
      const mappedScale: CmsFontScale =
        draftSize === "sm"
          ? "sm"
          : draftSize === "lg"
            ? "lg"
            : draftSize === "xl" || draftSize === "2xl" || draftSize === "3xl"
              ? "xl"
              : "md";
      await pushAdminCmsPatch({
        topicEdits: {
          [id]: {
            ...textPayload,
          } as CmsTopicEdit,
        },
        layoutConfig: {
          ...(cms.layoutConfig || {}),
          ...(draftFont ? { fontFamily: draftFont } : {}),
          ...(draftSize ? { headingScale: mappedScale, bodyScale: mappedScale } : {}),
          ...(draftTextColor.trim()
            ? tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4"
              ? { headingTextColor: draftTextColor.trim() }
              : { bodyTextColor: draftTextColor.trim() }
            : {}),
          ...(draftBgColor.trim() ? { cardBgColor: draftBgColor.trim() } : {}),
        },
      });
    }

    setSaving(false);
    setOpen(false);
  };

  const handleReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    await pushAdminCmsPatch({
      topicEdits: {
        [id]: {
          text: undefined,
          title: undefined,
          fontFamily: undefined,
          textSize: undefined,
          textColor: undefined,
          bgColor: undefined,
          x: undefined,
          y: undefined,
          transform: undefined,
          width: undefined,
          height: undefined,
          padding: undefined,
          zIndex: undefined,
        } as CmsTopicEdit,
      },
      sectionLayoutMap: {
        ...(cms.sectionLayoutMap || {}),
        [`__god_text_${id}`]: {},
      },
    });
    setSaving(false);
    setOpen(false);
  };

  const hasSpatialStyle =
    savedX !== 0 ||
    savedY !== 0 ||
    typeof savedW === "number" ||
    typeof savedH === "number" ||
    typeof savedPad === "number" ||
    typeof savedZ === "number";

  const mergedClassName = [
    className,
    resolveGodModeSizeClass(resolvedSize),
    canEdit ? "god-mode-text-editable" : "",
    canEdit && selected ? "god-mode-selected" : "",
    canEdit && hovered && !selected ? "god-mode-hover" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const activeZIndex =
    canEdit && (selected || hovered)
      ? Math.max(999, typeof savedZ === "number" ? savedZ : 999)
      : savedZ;

  const mergedStyle: React.CSSProperties = {
    boxSizing: "border-box",
    ...style,
    ...(canEdit || hasSpatialStyle
      ? {
          position: style?.position ?? "relative",
          ...(tag === "span" && !style?.display ? { display: "inline-block" } : {}),
        }
      : {}),
    ...(savedX !== 0 || savedY !== 0
      ? { transform: `translate3d(${savedX}px, ${savedY}px, 0)` }
      : {}),
    ...(typeof savedW === "number" ? { width: `${savedW}px`, maxWidth: "100%" } : {}),
    ...(typeof savedH === "number" ? { minHeight: `${savedH}px` } : {}),
    ...(typeof savedPad === "number" ? { padding: `${savedPad}px` } : {}),
    ...(typeof activeZIndex === "number" ? { zIndex: activeZIndex } : {}),
    ...(resolvedFont ? { fontFamily: resolveCmsFontFamily(resolvedFont) } : {}),
    ...(resolvedTextColor ? { color: resolvedTextColor } : {}),
    ...(resolvedBgColor
      ? {
          backgroundColor: resolvedBgColor,
          paddingLeft:
            typeof savedPad === "number"
              ? `${savedPad}px`
              : (style?.paddingLeft ?? "0.35em"),
          paddingRight:
            typeof savedPad === "number"
              ? `${savedPad}px`
              : (style?.paddingRight ?? "0.35em"),
          borderRadius: style?.borderRadius ?? "0.35rem",
        }
      : {}),
  };

  const Tag = tag;

  return (
    <>
      <Tag
        ref={elRef as React.RefObject<never>}
        lang={lang}
        data-canvas-id={id}
        data-edit-mode={canEdit ? "true" : undefined}
        data-desktop-freeform={
          savedX !== 0 || savedY !== 0 || typeof savedW === "number" ? "true" : undefined
        }
        style={mergedStyle}
        className={mergedClassName}
        onMouseEnter={
          canEdit
            ? (e) => {
                e.stopPropagation();
                setHovered(true);
              }
            : undefined
        }
        onMouseLeave={canEdit ? () => setHovered(false) : undefined}
        onPointerDown={
          canEdit
            ? (e) => {
                e.stopPropagation();
                setSelected(true);
              }
            : undefined
        }
        onClick={canEdit ? openToolbar : undefined}
        title={canEdit ? `Click to edit or drag/resize "${id}"` : undefined}
      >
        {canEdit && (hovered || selected) && (
          <>
            <span
              role="button"
              tabIndex={0}
              onPointerDown={handleTextDragStart}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              title="Drag to move anywhere inside card"
              className="absolute -top-5 left-0 z-[65] inline-flex items-center gap-0.5 rounded bg-[#2563EB] px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-white shadow cursor-grab active:cursor-grabbing select-none whitespace-nowrap"
            >
              ✥ Drag
            </span>
            <span
              role="button"
              tabIndex={0}
              aria-label="Resize width East"
              onPointerDown={(e) => handleTextResizeStart(e, "e")}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="slide-canvas-handle top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize"
            />
            <span
              role="button"
              tabIndex={0}
              aria-label="Resize height South"
              onPointerDown={(e) => handleTextResizeStart(e, "s")}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="slide-canvas-handle -bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize"
            />
            <span
              role="button"
              tabIndex={0}
              aria-label="Resize corner South-East"
              onPointerDown={(e) => handleTextResizeStart(e, "se")}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="slide-canvas-handle -bottom-1.5 -right-1.5 cursor-nwse-resize"
            />
          </>
        )}
        {resolvedText}
      </Tag>

      {(textGuides?.v || textGuides?.h) &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {textGuides.v && (
              <div
                style={{ left: `${textGuides.v.px}px` }}
                className="sibling-guide-v"
              >
                <span className="fixed top-16 -translate-x-1/2 rounded bg-cyan-400 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950 shadow">
                  {textGuides.v.label}
                </span>
              </div>
            )}
            {textGuides.h && (
              <div
                style={{ top: `${textGuides.h.px}px` }}
                className="sibling-guide-h"
              >
                <span className="fixed left-3 -translate-y-1/2 rounded bg-cyan-400 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950 shadow">
                  {textGuides.h.label}
                </span>
              </div>
            )}
          </>,
          document.body
        )}

      {canEdit &&
        open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[90]"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
              className="fixed w-[355px] max-w-[calc(100vw-24px)] rounded-2xl border-2 border-[#d4af37] bg-[#111318]/98 text-[#FAF7F0] p-4 shadow-2xl shadow-black/50 backdrop-blur-md space-y-3 text-xs z-[95]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <span className="font-extrabold text-[#E5C158] truncate">
                  ⚡ God Mode Text: {id}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-2 py-0.5 rounded border border-white/20 text-[11px] hover:border-[#d4af37]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                    Text Content
                  </label>
                  <textarea
                    rows={2}
                    autoFocus
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="w-full rounded-lg border border-white/25 bg-black/50 px-2.5 py-1.5 text-xs text-[#FAF7F0] focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                      Font Family
                    </label>
                    <select
                      value={draftFont}
                      onChange={(e) => setDraftFont(e.target.value as CmsFontFamily | "")}
                      className="w-full rounded-lg border border-white/20 bg-black/60 px-2 py-1.5 text-xs text-[#FAF7F0]"
                    >
                      <option value="">Default</option>
                      <option value="serif-heritage">Heritage Serif</option>
                      <option value="sans-modern">Modern Sans</option>
                      <option value="manuscript">Manuscript</option>
                      <option value="mono-clean">Mono</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[10px] font-bold opacity-75 mb-1">
                        Color
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={
                            /^#[0-9a-f]{6}$/i.test(draftTextColor)
                              ? draftTextColor
                              : "#FAF7F0"
                          }
                          onChange={(e) => setDraftTextColor(e.target.value)}
                          className="w-7 h-7 rounded border-0 bg-transparent p-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setDraftTextColor("")}
                          className="text-[10px] underline opacity-70"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold opacity-75 mb-1">
                        Highlight
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={
                            /^#[0-9a-f]{6}$/i.test(draftBgColor)
                              ? draftBgColor
                              : "#141B2D"
                          }
                          onChange={(e) => setDraftBgColor(e.target.value)}
                          className="w-7 h-7 rounded border-0 bg-transparent p-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setDraftBgColor("")}
                          className="text-[10px] underline opacity-70"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-0.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75">
                      Padding (px)
                    </span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Auto"
                      value={draftPadding}
                      onChange={(e) => setDraftPadding(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-xs text-[#FAF7F0]"
                    />
                  </label>
                  <label className="space-y-0.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75">
                      Z-Index Layer
                    </span>
                    <input
                      type="number"
                      placeholder="Auto (60 selected)"
                      value={draftZIndex}
                      onChange={(e) => setDraftZIndex(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-xs text-[#FAF7F0]"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                    Text Size
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    {(["sm", "md", "lg", "xl", "2xl", "3xl"] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setDraftSize(draftSize === sz ? "" : sz)}
                        className={`py-1 rounded border uppercase text-[10px] font-bold transition ${
                          draftSize === sz
                            ? "border-[#d4af37] bg-[#d4af37] text-[#18181B]"
                            : "border-white/20 opacity-80 hover:opacity-100"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                    Apply Style Scope
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: "element", label: "This Element" },
                        { id: "page", label: "This Page" },
                        { id: "global", label: "Whole Website" },
                      ] as { id: GodModeScope; label: string }[]
                    ).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setScope(s.id)}
                        className={`py-1.5 px-1.5 rounded-lg border text-[10px] font-bold transition ${
                          scope === s.id
                            ? "border-[#d4af37] bg-[#d4af37]/25 text-[#E5C158]"
                            : "border-white/15 opacity-75 hover:opacity-100"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleReset}
                    className="px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-300 text-[11px] font-bold hover:bg-red-500/15"
                  >
                    Reset Default
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-[11px] font-extrabold"
                  >
                    {saving ? "Saving..." : "Apply & Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export type SlideLayoutWidth = "full" | "wide" | "half" | "compact";
export type SlideLayoutAlign = "left" | "center" | "right";

export interface SlideCanvasState {
  x?: number;
  y?: number;
  xRatio?: number;
  transform?: string;
  width?: number;
  widthRatio?: number;
  height?: number;
  widthPreset?: "1/3" | "1/2" | "3/4" | "full" | "custom";
  layoutWidth?: SlideLayoutWidth;
  layoutAlign?: SlideLayoutAlign;
  rotation?: number;
  zIndex?: number;
  lockAspectRatio?: boolean;
  alignSelf?: "left" | "center" | "right";
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  snapStep?: 0 | 10 | 16 | 20;
  scope?: "root" | "child" | "micro";
  isMicroElement?: boolean;
  parentId?: string;
  deleted?: boolean;
}

export interface SlidePresentationCanvasProps {
  id: string;
  pageKey?: string;
  label?: string;
  elementType?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isFloatingWidget?: boolean;
  isChild?: boolean;
  isMicroElement?: boolean;
  parentId?: string;
  snapToGrid?: boolean | number;
  extraInspectorContent?: React.ReactNode;
}

const NestedFrameDepthContext = createContext<string | null>(null);
const ACTIVE_ENTERED_FRAME_EVENT = "learnsikhi-entered-frame-change";
const ACTIVE_HOVERED_CANVAS_EVENT = "learnsikhi-hovered-canvas-change";
let currentEnteredFrameId: string | null = null;
let currentHoveredCanvasId: string | null = null;

function setHoveredCanvasIdGlobal(nextId: string | null) {
  if (currentHoveredCanvasId === nextId) return;
  currentHoveredCanvasId = nextId;
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event(ACTIVE_HOVERED_CANVAS_EVENT));
    } catch {
      // ignore
    }
  }
}

function useHoveredCanvasId(): [string | null, (next: string | null) => void] {
  const [hoveredId, setHoveredId] = useState<string | null>(currentHoveredCanvasId);

  useEffect(() => {
    const sync = () => setHoveredId(currentHoveredCanvasId);
    window.addEventListener(ACTIVE_HOVERED_CANVAS_EVENT, sync);
    return () => {
      window.removeEventListener(ACTIVE_HOVERED_CANVAS_EVENT, sync);
    };
  }, []);

  return [hoveredId, setHoveredCanvasIdGlobal];
}

type InvMatrix2D = [number, number, number, number, number];

function captureInverseMatrix(parentEl: HTMLElement | null): InvMatrix2D | null {
  if (!parentEl || typeof window === "undefined") return null;
  const t = window.getComputedStyle(parentEl).transform;
  const m = t && t !== "none" ? t.match(/^matrix\(([^)]+)\)$/) : null;
  if (!m) return null;
  const nums = m[1].split(",").map((v) => Number.parseFloat(v.trim()));
  if (nums.length < 4 || nums.some((n) => !Number.isFinite(n))) return null;
  const det = nums[0] * nums[3] - nums[1] * nums[2];
  return Math.abs(det) >= 1e-4 ? [nums[0], nums[1], nums[2], nums[3], det] : null;
}

function applyInverseMatrix(
  inv: InvMatrix2D | null,
  dxScreen: number,
  dyScreen: number
): { dx: number; dy: number } {
  if (!inv) return { dx: dxScreen, dy: dyScreen };
  return {
    dx: (inv[3] * dxScreen - inv[2] * dyScreen) / inv[4],
    dy: (-inv[1] * dxScreen + inv[0] * dyScreen) / inv[4],
  };
}

function setEnteredFrameIdGlobal(nextId: string | null) {
  currentEnteredFrameId = nextId;
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event(ACTIVE_ENTERED_FRAME_EVENT));
    } catch {
      // ignore
    }
  }
}

function useEnteredFrameId(): [string | null, (next: string | null) => void] {
  const [enteredId, setEnteredId] = useState<string | null>(currentEnteredFrameId);

  useEffect(() => {
    const sync = () => setEnteredId(currentEnteredFrameId);
    window.addEventListener(ACTIVE_ENTERED_FRAME_EVENT, sync);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && currentEnteredFrameId) {
        setEnteredFrameIdGlobal(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(ACTIVE_ENTERED_FRAME_EVENT, sync);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return [enteredId, setEnteredFrameIdGlobal];
}

type ResizeHandleDir = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLE_DEFS: {
  dir: ResizeHandleDir;
  posClass: string;
  cursorClass: string;
}[] = [
  { dir: "nw", posClass: "-top-1.5 -left-1.5", cursorClass: "cursor-nwse-resize" },
  {
    dir: "n",
    posClass: "-top-1.5 left-1/2 -translate-x-1/2",
    cursorClass: "cursor-ns-resize",
  },
  { dir: "ne", posClass: "-top-1.5 -right-1.5", cursorClass: "cursor-nesw-resize" },
  {
    dir: "e",
    posClass: "top-1/2 -right-1.5 -translate-y-1/2",
    cursorClass: "cursor-ew-resize",
  },
  { dir: "se", posClass: "-bottom-1.5 -right-1.5", cursorClass: "cursor-nwse-resize" },
  {
    dir: "s",
    posClass: "-bottom-1.5 left-1/2 -translate-x-1/2",
    cursorClass: "cursor-ns-resize",
  },
  { dir: "sw", posClass: "-bottom-1.5 -left-1.5", cursorClass: "cursor-nesw-resize" },
  {
    dir: "w",
    posClass: "top-1/2 -left-1.5 -translate-y-1/2",
    cursorClass: "cursor-ew-resize",
  },
];

export function clampFloatingWidgetPos(
  rawRight?: unknown,
  rawBottom?: unknown
): { right: number; bottom: number; needsHeal: boolean } {
  const r = typeof rawRight === "number" ? rawRight : Number.NaN;
  const b = typeof rawBottom === "number" ? rawBottom : Number.NaN;
  if (typeof window === "undefined") {
    return {
      right: Number.isFinite(r) && r >= 16 ? Math.round(r) : 24,
      bottom: Number.isFinite(b) && b >= 16 ? Math.round(b) : 24,
      needsHeal: false,
    };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxR = Math.max(16, vw - 72);
  const maxB = Math.max(16, vh - 72);
  if (
    !Number.isFinite(r) ||
    !Number.isFinite(b) ||
    r < 0 ||
    b < 0 ||
    r > vw ||
    b > vh
  ) {
    return {
      right: Math.min(maxR, 24),
      bottom: Math.min(maxB, 24),
      needsHeal: rawRight !== undefined || rawBottom !== undefined,
    };
  }
  const clampedR = Math.round(Math.min(maxR, Math.max(16, r)));
  const clampedB = Math.round(Math.min(maxB, Math.max(16, b)));
  return {
    right: clampedR,
    bottom: clampedB,
    needsHeal: clampedR !== Math.round(r) || clampedB !== Math.round(b),
  };
}

export function SlidePresentationCanvas({
  id,
  label,
  elementType,
  children,
  className = "",
  style,
  isFloatingWidget = false,
  isChild = false,
  isMicroElement = false,
  parentId: explicitParentId,
  snapToGrid = true,
  extraInspectorContent,
}: SlidePresentationCanvasProps) {
  const cms = useCmsSiteState();
  const canEdit = useVerifiedLiveEdit();
  const contextParentId = useContext(NestedFrameDepthContext);
  const resolvedParentId = explicitParentId ?? contextParentId;
  const isMicroNode = Boolean(isMicroElement);
  const isChildNode = Boolean(isChild || isMicroNode || resolvedParentId);
  const [enteredFrameId, setEnteredFrameId] = useEnteredFrameId();
  const [globalHoveredId, setGlobalHoveredId] = useHoveredCanvasId();

  const isEnteredAsParent = !isChildNode && enteredFrameId === id;
  const isInteractiveChild = canEdit && isChildNode;
  const showHandles = canEdit && (!isChildNode ? !isEnteredAsParent : isInteractiveChild);

  const storageKey = isMicroNode
    ? resolvedParentId
      ? `__slide_micro_${resolvedParentId}::${id}`
      : `__slide_micro_${id}`
    : isChildNode && resolvedParentId
      ? `__slide_child_${resolvedParentId}::${id}`
      : `__slide_canvas_${id}`;

  const boxRef = useRef<HTMLDivElement | null>(null);
  const portalToolbarRef = useRef<HTMLDivElement | null>(null);
  const dragSnapshotRef = useRef<{
    op: "drag" | "resize" | "rotate";
    startClientX: number;
    startClientY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
    latestX: number;
    latestY: number;
    latestW: number;
    latestH: number;
    latestRot: number;
    moved: boolean;
    rafId: number | null;
  } | null>(null);
  const hovered = showHandles && globalHoveredId === id;
  const [selected, setSelected] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [mobilePreview, toggleMobilePreview] = useMobilePreviewMode();
  const [toolbarPos, setToolbarPos] = useState<{
    top: number;
    left: number;
    flipBelow: boolean;
  } | null>(null);

  const resolvedElementType =
    elementType ||
    (/image|painting/i.test(label || "")
      ? "Image"
      : /caption|text|title|quote|heading/i.test(label || "")
        ? "Text"
        : /icon|emblem/i.test(label || "")
          ? "Icon"
          : /badge|pill|button/i.test(label || "")
            ? "Badge"
            : /frame|border/i.test(label || "")
              ? "Frame"
              : /panel|search|player|widget/i.test(label || "")
                ? "Widget"
                : "Card");
  const [activeOp, setActiveOp] = useState<
    "idle" | "drag" | "resize" | "rotate"
  >("idle");
  const [smartGuides, setSmartGuides] = useState<ActiveAlignmentGuides | null>(null);

  const layoutMap = (cms.sectionLayoutMap || {}) as Record<string, unknown>;
  const legacySaved = (layoutMap[`__god_box_${id}`] || {}) as GodModeBoxRecord;
  const slideSaved = (
    layoutMap[storageKey] ||
    (isMicroNode && resolvedParentId
      ? layoutMap[`__slide_child_${resolvedParentId}::${id}`]
      : undefined) ||
    (isMicroNode ? layoutMap[`__slide_canvas_${id}`] : undefined) ||
    {}
  ) as SlideCanvasState;

  const [mounted, setMounted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);

  useEffect(() => {
    setMounted(true);
    const updateVw = () => setViewportWidth(window.innerWidth);
    updateVw();
    window.addEventListener("resize", updateVw);
    return () => window.removeEventListener("resize", updateVw);
  }, []);

  const storedSupportPos = isFloatingWidget
    ? (layoutMap.supportWidgetPos as { right?: unknown; bottom?: unknown } | undefined)
    : undefined;
  const rawFloatingRight =
    storedSupportPos?.right !== undefined
      ? storedSupportPos.right
      : typeof slideSaved.x === "number" && slideSaved.x !== 0
        ? 24 - slideSaved.x
        : 24;
  const rawFloatingBottom =
    storedSupportPos?.bottom !== undefined
      ? storedSupportPos.bottom
      : typeof slideSaved.y === "number" && slideSaved.y !== 0
        ? 24 - slideSaved.y
        : 24;
  const floatingPosCheck = isFloatingWidget
    ? clampFloatingWidgetPos(rawFloatingRight, rawFloatingBottom)
    : { right: 24, bottom: 24, needsHeal: false };

  const saved: SlideCanvasState = {
    x: slideSaved.x ?? (isChildNode ? 0 : legacySaved.offsetX ?? 0),
    y: slideSaved.y ?? (isChildNode ? 0 : legacySaved.offsetY ?? 0),
    xRatio: slideSaved.xRatio,
    width: slideSaved.width ?? (isChildNode ? undefined : legacySaved.customWidthPx),
    widthRatio: slideSaved.widthRatio,
    height: slideSaved.height ?? (isChildNode ? undefined : legacySaved.minHeightPx),
    widthPreset:
      slideSaved.widthPreset ?? (isChildNode ? undefined : legacySaved.widthPreset),
    layoutWidth: slideSaved.layoutWidth,
    layoutAlign:
      slideSaved.layoutAlign ??
      slideSaved.alignSelf ??
      (isChildNode ? undefined : legacySaved.alignSelf),
    rotation: slideSaved.rotation ?? 0,
    zIndex: slideSaved.zIndex,
    lockAspectRatio: Boolean(slideSaved.lockAspectRatio),
    alignSelf:
      slideSaved.layoutAlign ??
      slideSaved.alignSelf ??
      (isChildNode ? undefined : legacySaved.alignSelf),
    textColor: slideSaved.textColor,
    bgColor: slideSaved.bgColor,
    borderColor: slideSaved.borderColor,
    deleted: Boolean(slideSaved.deleted),
    snapStep:
      slideSaved.snapStep !== undefined
        ? slideSaved.snapStep
        : typeof snapToGrid === "number"
          ? snapToGrid >= 20
            ? 20
            : snapToGrid === 10
              ? 10
              : snapToGrid > 0
                ? GOD_MODE_GRID_SIZE
                : 0
          : snapToGrid
            ? GOD_MODE_GRID_SIZE
            : 0,
  };

  const activeSnapStep = saved.snapStep ?? GOD_MODE_GRID_SIZE;

  useEffect(() => {
    if (!canEdit) {
      setGlobalHoveredId(null);
      setSelected(false);
      setInspectorOpen(false);
      setToolbarPos(null);
      if (currentEnteredFrameId === id) {
        setEnteredFrameIdGlobal(null);
      }
    }
  }, [canEdit, id, setGlobalHoveredId]);

  useEffect(() => {
    if (!selected) return;
    const onOutside = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        boxRef.current &&
        !boxRef.current.contains(target) &&
        (!portalToolbarRef.current || !portalToolbarRef.current.contains(target))
      ) {
        setSelected(false);
      }
    };
    window.addEventListener("pointerdown", onOutside);
    return () => window.removeEventListener("pointerdown", onOutside);
  }, [selected]);

  const shouldShowPortalToolbar =
    mounted && showHandles && !isMicroNode && (hovered || selected || inspectorOpen);

  useEffect(() => {
    if (!shouldShowPortalToolbar) {
      setToolbarPos(null);
      return;
    }
    let raf = 0;
    const syncPos = () => {
      if (!boxRef.current || typeof window === "undefined") return;
      const rect = boxRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const flipBelow = rect.top < 88;
      const top = flipBelow
        ? Math.min(vh - 54, Math.max(8, Math.round(rect.bottom + 8)))
        : Math.max(8, Math.round(rect.top - 42));
      const left = Math.max(8, Math.min(Math.round(rect.left), Math.max(8, vw - 360)));
      setToolbarPos({ top, left, flipBelow });
    };
    syncPos();
    const onTick = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        syncPos();
      });
    };
    window.addEventListener("scroll", onTick, true);
    window.addEventListener("resize", onTick);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onTick, true);
      window.removeEventListener("resize", onTick);
    };
  }, [shouldShowPortalToolbar, saved.x, saved.y, saved.width, activeOp, viewportWidth]);

  const persistCanvas = async (
    patch: Partial<SlideCanvasState>,
    extraSectionMap?: Record<string, unknown>
  ) => {
    const nextX = patch.x !== undefined ? patch.x : (saved.x ?? 0);
    const nextY = patch.y !== undefined ? patch.y : (saved.y ?? 0);
    const nextMerged: SlideCanvasState = {
      ...saved,
      ...patch,
      transform:
        nextX !== 0 || nextY !== 0
          ? `translate(${nextX}px, ${nextY}px)`
          : undefined,
      scope: isMicroNode ? "micro" : isChildNode ? "child" : "root",
      ...(isMicroNode ? { isMicroElement: true } : {}),
      ...(resolvedParentId ? { parentId: resolvedParentId } : {}),
    };
    await pushAdminCmsPatch({
      sectionLayoutMap: {
        ...(cms.sectionLayoutMap || {}),
        [storageKey]: nextMerged,
        ...(extraSectionMap || {}),
      },
    });
  };

  useEffect(() => {
    if (!isFloatingWidget || !canEdit || !mounted) return;
    if (floatingPosCheck.needsHeal || (storedSupportPos === undefined && (saved.x || saved.y))) {
      void persistCanvas(
        { x: 0, y: 0 },
        {
          supportWidgetPos: {
            right: floatingPosCheck.right,
            bottom: floatingPosCheck.bottom,
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFloatingWidget, canEdit, mounted]);

  const setDraggingBodyLock = (locked: boolean) => {
    if (typeof document === "undefined") return;
    if (locked) document.body.classList.add("god-mode-dragging");
    else document.body.classList.remove("god-mode-dragging");
  };

  const findParentCardElement = (el: HTMLElement | null): HTMLElement | null => {
    if (!el) return null;
    if (isMicroNode) {
      const cardAncestor = el.parentElement?.closest(
        '[data-god-card="true"], article, .god-mode-box'
      ) as HTMLElement | null;
      if (cardAncestor) return cardAncestor;
    }
    return (el.offsetParent as HTMLElement | null) || el.parentElement;
  };

  const handleDragStart = (e: React.PointerEvent) => {
    if (!showHandles) return;
    e.preventDefault();
    e.stopPropagation();
    const captureTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    try {
      captureTarget.setPointerCapture(pointerId);
    } catch {
      // ignore if unsupported
    }
    setSelected(true);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initialX = isFloatingWidget ? floatingPosCheck.right : (saved.x || 0);
    const initialY = isFloatingWidget ? floatingPosCheck.bottom : (saved.y || 0);
    const baseRot = saved.rotation || 0;

    // Measure element, container bounds & sibling alignment targets ONCE on pointerdown (zero DOM reads in pointermove)
    const el = boxRef.current;
    const elRect = el ? el.getBoundingClientRect() : null;
    const parentEl = findParentCardElement(el);
    const snapCtx = captureSnapContext(el, parentEl, initialX, initialY, isMicroNode);

    // Capture static inverse-transform projector once on pointerdown
    const invMatrix = isMicroNode ? captureInverseMatrix(parentEl) : null;

    if (el) {
      el.setAttribute("data-dragging", "true");
      el.classList.add("is-actively-dragging");
    }

    dragSnapshotRef.current = {
      op: "drag",
      startClientX,
      startClientY,
      initialX,
      initialY,
      initialW: elRect ? Math.round(elRect.width) : 0,
      initialH: elRect ? Math.round(elRect.height) : 0,
      latestX: initialX,
      latestY: initialY,
      latestW: elRect ? Math.round(elRect.width) : 0,
      latestH: elRect ? Math.round(elRect.height) : 0,
      latestRot: baseRot,
      moved: false,
      rafId: null,
    };

    let prevGuideKey = "";
    setActiveOp("drag");
    setDraggingBodyLock(true);

    const onMove = (ev: PointerEvent) => {
      const snap = dragSnapshotRef.current;
      if (!snap) return;
      const screenDx = ev.clientX - snap.startClientX;
      const screenDy = ev.clientY - snap.startClientY;
      if (Math.abs(screenDx) > 2 || Math.abs(screenDy) > 2) {
        snap.moved = true;
      }

      if (isFloatingWidget && typeof window !== "undefined") {
        const maxR = Math.max(16, window.innerWidth - 72);
        const maxB = Math.max(16, window.innerHeight - 72);
        snap.latestX = Math.round(Math.min(maxR, Math.max(16, snap.initialX - screenDx)));
        snap.latestY = Math.round(Math.min(maxB, Math.max(16, snap.initialY - screenDy)));

        if (snap.rafId === null) {
          snap.rafId = window.requestAnimationFrame(() => {
            const cur = dragSnapshotRef.current;
            if (!cur || !boxRef.current) return;
            cur.rafId = null;
            boxRef.current.style.right = `${cur.latestX}px`;
            boxRef.current.style.bottom = `${cur.latestY}px`;
            boxRef.current.style.left = "auto";
            boxRef.current.style.top = "auto";
            boxRef.current.style.transform = cur.latestRot ? `rotate(${cur.latestRot}deg)` : "none";
          });
        }
        return;
      }

      const { dx, dy } = applyInverseMatrix(invMatrix, screenDx, screenDy);
      const res = resolveSnappedPosition(
        snap.initialX + dx,
        snap.initialY + dy,
        snapCtx,
        activeSnapStep,
        ev.shiftKey
      );
      snap.latestX = res.x;
      snap.latestY = res.y;

      if (snap.rafId === null) {
        snap.rafId = window.requestAnimationFrame(() => {
          const cur = dragSnapshotRef.current;
          if (!cur || !boxRef.current) return;
          cur.rafId = null;
          boxRef.current.style.transform = `translate3d(${cur.latestX}px, ${cur.latestY}px, 0)${
            cur.latestRot ? ` rotate(${cur.latestRot}deg)` : ""
          }`;
        });
      }

      const nextGuideKey = `${res.vGuide?.px ?? ""}|${res.hGuide?.px ?? ""}`;
      if (nextGuideKey !== prevGuideKey) {
        prevGuideKey = nextGuideKey;
        setSmartGuides(
          res.vGuide || res.hGuide ? { v: res.vGuide, h: res.hGuide } : null
        );
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      try {
        if (captureTarget.hasPointerCapture(pointerId)) {
          captureTarget.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }
      const snap = dragSnapshotRef.current;
      dragSnapshotRef.current = null;
      if (snap?.rafId !== null && snap?.rafId !== undefined) {
        window.cancelAnimationFrame(snap.rafId);
      }
      if (boxRef.current) {
        boxRef.current.removeAttribute("data-dragging");
        boxRef.current.classList.remove("is-actively-dragging");
      }
      setActiveOp("idle");
      setDraggingBodyLock(false);
      setSmartGuides(null);
      if (snap?.moved) {
        if (isFloatingWidget) {
          void persistCanvas(
            { x: 0, y: 0 },
            {
              supportWidgetPos: {
                right: snap.latestX,
                bottom: snap.latestY,
              },
            }
          );
        } else {
          void persistCanvas({
            x: snap.latestX,
            y: snap.latestY,
            xRatio:
              snapCtx.parentWidth > 0
                ? Math.round((snap.latestX / snapCtx.parentWidth) * 10000) / 10000
                : undefined,
          });
        }
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const handleResizeStart = (e: React.PointerEvent, dir: ResizeHandleDir) => {
    if (!showHandles) return;
    e.preventDefault();
    e.stopPropagation();
    const captureTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    try {
      captureTarget.setPointerCapture(pointerId);
    } catch {
      // ignore
    }
    setSelected(true);
    const el = boxRef.current;
    const parentEl = findParentCardElement(el);
    const rect = el ? el.getBoundingClientRect() : { width: 380, height: 140 };
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initialX = saved.x || 0;
    const initialY = saved.y || 0;
    const snapCtx = captureSnapContext(el, parentEl, initialX, initialY, isMicroNode);
    const minW = isMicroNode ? 20 : 80;
    const minH = isMicroNode ? 20 : 36;
    const initialW = saved.width || Math.max(minW, Math.round(rect.width));
    const initialH = saved.height || Math.max(minH, Math.round(rect.height));
    const aspect = initialW / Math.max(minH, initialH);
    const baseRot = saved.rotation || 0;

    const invMatrix = isMicroNode ? captureInverseMatrix(parentEl) : null;

    if (el) {
      el.setAttribute("data-dragging", "true");
      el.classList.add("is-actively-dragging");
    }

    dragSnapshotRef.current = {
      op: "resize",
      startClientX,
      startClientY,
      initialX,
      initialY,
      initialW,
      initialH,
      latestX: initialX,
      latestY: initialY,
      latestW: initialW,
      latestH: initialH,
      latestRot: baseRot,
      moved: false,
      rafId: null,
    };

    setActiveOp("resize");
    setDraggingBodyLock(true);

    const snapVal = (v: number, bypass: boolean) =>
      !bypass && activeSnapStep > 0
        ? Math.round(v / activeSnapStep) * activeSnapStep
        : Math.round(v);

    const onMove = (ev: PointerEvent) => {
      const snap = dragSnapshotRef.current;
      if (!snap) return;
      const screenDx = ev.clientX - snap.startClientX;
      const screenDy = ev.clientY - snap.startClientY;
      if (Math.abs(screenDx) > 1 || Math.abs(screenDy) > 1) {
        snap.moved = true;
      }
      const { dx, dy } = applyInverseMatrix(invMatrix, screenDx, screenDy);

      let w = snap.initialW;
      let h = snap.initialH;
      let x = snap.initialX;
      let y = snap.initialY;

      if (dir.includes("e")) {
        w = Math.min(snapCtx.maxAllowedW, Math.max(minW, snapVal(snap.initialW + dx, ev.shiftKey)));
      }
      if (dir.includes("s")) {
        h = Math.max(minH, snapVal(snap.initialH + dy, ev.shiftKey));
      }
      if (dir.includes("w")) {
        const candidateW = Math.min(
          snapCtx.maxAllowedW,
          Math.max(minW, snapVal(snap.initialW - dx, ev.shiftKey))
        );
        const candidateX = Math.round(snap.initialX + (snap.initialW - candidateW));
        x = Math.round(Math.min(snapCtx.maxX, Math.max(snapCtx.minX, candidateX)));
        w = candidateW;
      }
      if (dir.includes("n")) {
        const candidateH = Math.max(minH, snapVal(snap.initialH - dy, ev.shiftKey));
        const candidateY = Math.round(snap.initialY + (snap.initialH - candidateH));
        y = Math.round(Math.min(snapCtx.maxY, Math.max(snapCtx.minY, candidateY)));
        h = candidateH;
      }

      if (saved.lockAspectRatio && (dir.length === 2 || dir === "e" || dir === "w")) {
        h = Math.max(minH, Math.round(w / aspect));
      } else if (saved.lockAspectRatio && (dir === "n" || dir === "s")) {
        w = Math.min(snapCtx.maxAllowedW, Math.max(minW, Math.round(h * aspect)));
      }

      snap.latestX = x;
      snap.latestY = y;
      snap.latestW = w;
      snap.latestH = h;

      if (snap.rafId === null) {
        snap.rafId = window.requestAnimationFrame(() => {
          const cur = dragSnapshotRef.current;
          if (!cur || !boxRef.current) return;
          cur.rafId = null;
          boxRef.current.style.width = `${cur.latestW}px`;
          boxRef.current.style.maxWidth = isFloatingWidget ? "95vw" : "100%";
          boxRef.current.style.minHeight = `${cur.latestH}px`;
          boxRef.current.style.transform = `translate3d(${cur.latestX}px, ${cur.latestY}px, 0)${
            cur.latestRot ? ` rotate(${cur.latestRot}deg)` : ""
          }`;
        });
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      try {
        if (captureTarget.hasPointerCapture(pointerId)) {
          captureTarget.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }
      const snap = dragSnapshotRef.current;
      dragSnapshotRef.current = null;
      if (snap?.rafId !== null && snap?.rafId !== undefined) {
        window.cancelAnimationFrame(snap.rafId);
      }
      if (boxRef.current) {
        boxRef.current.removeAttribute("data-dragging");
        boxRef.current.classList.remove("is-actively-dragging");
      }
      setActiveOp("idle");
      setDraggingBodyLock(false);
      if (snap?.moved) {
        void persistCanvas({
          x: snap.latestX,
          y: snap.latestY,
          width: snap.latestW,
          height: snap.latestH,
          widthPreset: "custom",
          xRatio:
            snapCtx.parentWidth > 0
              ? Math.round((snap.latestX / snapCtx.parentWidth) * 10000) / 10000
              : undefined,
          widthRatio:
            snapCtx.parentWidth > 0
              ? Math.round((snap.latestW / snapCtx.parentWidth) * 10000) / 10000
              : undefined,
        });
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const handleRotateStart = (e: React.PointerEvent) => {
    if (!showHandles) return;
    e.preventDefault();
    e.stopPropagation();
    const captureTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    try {
      captureTarget.setPointerCapture(pointerId);
    } catch {
      // ignore
    }
    setSelected(true);
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const initialX = saved.x || 0;
    const initialY = saved.y || 0;
    const initialRot = saved.rotation || 0;

    el.setAttribute("data-dragging", "true");
    el.classList.add("is-actively-dragging");

    dragSnapshotRef.current = {
      op: "rotate",
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialX,
      initialY,
      initialW: Math.round(rect.width),
      initialH: Math.round(rect.height),
      latestX: initialX,
      latestY: initialY,
      latestW: Math.round(rect.width),
      latestH: Math.round(rect.height),
      latestRot: initialRot,
      moved: false,
      rafId: null,
    };

    setActiveOp("rotate");
    setDraggingBodyLock(true);

    const onMove = (ev: PointerEvent) => {
      const snap = dragSnapshotRef.current;
      if (!snap) return;
      snap.moved = true;
      const deg =
        (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
      let normalized = Math.round(((deg + 180) % 360 + 360) % 360 - 180);
      if (Math.abs(normalized) <= 4) normalized = 0;
      else if (Math.abs(normalized - 90) <= 4) normalized = 90;
      else if (Math.abs(normalized + 90) <= 4) normalized = -90;
      snap.latestRot = normalized;

      if (snap.rafId === null) {
        snap.rafId = window.requestAnimationFrame(() => {
          const cur = dragSnapshotRef.current;
          if (!cur || !boxRef.current) return;
          cur.rafId = null;
          boxRef.current.style.transform = `translate3d(${cur.latestX}px, ${cur.latestY}px, 0) rotate(${cur.latestRot}deg)`;
        });
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      try {
        if (captureTarget.hasPointerCapture(pointerId)) {
          captureTarget.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }
      const snap = dragSnapshotRef.current;
      dragSnapshotRef.current = null;
      if (snap?.rafId !== null && snap?.rafId !== undefined) {
        window.cancelAnimationFrame(snap.rafId);
      }
      if (boxRef.current) {
        boxRef.current.removeAttribute("data-dragging");
        boxRef.current.classList.remove("is-actively-dragging");
      }
      setActiveOp("idle");
      setDraggingBodyLock(false);
      if (snap?.moved) {
        void persistCanvas({ rotation: snap.latestRot });
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const curX = saved.x ?? 0;
  const curY = saved.y ?? 0;
  const curW = saved.widthPreset === "custom" ? saved.width : undefined;
  const curH = saved.height;
  const curRot = saved.rotation ?? 0;
  const curZ = saved.zIndex;

  const layoutWidthCls =
    !curW && saved.layoutWidth
      ? saved.layoutWidth === "full"
        ? "w-full"
        : saved.layoutWidth === "wide"
          ? "w-full lg:w-3/4"
          : saved.layoutWidth === "half"
            ? "w-full lg:w-1/2"
            : saved.layoutWidth === "compact"
              ? "max-w-2xl"
              : ""
      : "";

  const legacyWidthCls =
    !curW && !layoutWidthCls && saved.widthPreset === "1/3"
      ? "w-full md:w-1/3"
      : !curW && !layoutWidthCls && saved.widthPreset === "1/2"
        ? "w-full md:w-1/2"
        : !curW && !layoutWidthCls && saved.widthPreset === "3/4"
          ? "w-full md:w-3/4"
          : !curW && !layoutWidthCls && saved.widthPreset === "full"
            ? "w-full"
            : "";

  const presetWidthCls = layoutWidthCls || legacyWidthCls;

  const activeAlign = saved.layoutAlign ?? saved.alignSelf;
  const alignCls =
    activeAlign === "center"
      ? "mx-auto"
      : activeAlign === "right"
        ? "ml-auto"
        : activeAlign === "left"
          ? "mr-auto"
          : "";

  const computeNextZ = (dir: "front" | "back"): number => {
    const entries = Object.values(cms.sectionLayoutMap || {}) as SlideCanvasState[];
    const zs = entries
      .map((item) => (typeof item?.zIndex === "number" ? item.zIndex : 20))
      .filter((n) => Number.isFinite(n));
    const maxZ = zs.length > 0 ? Math.max(...zs) : 20;
    const minZ = zs.length > 0 ? Math.min(...zs) : 20;
    if (dir === "front") return Math.max((curZ ?? 20) + 10, maxZ + 1);
    return Math.max(0, Math.min((curZ ?? 20) - 10, minZ - 1));
  };

  const activeZ = isFloatingWidget
    ? Math.max(95, typeof curZ === "number" ? curZ : 95)
    : showHandles && (selected || hovered || inspectorOpen || activeOp !== "idle")
      ? Math.max(999, typeof curZ === "number" ? curZ : 999)
      : curZ;

  // Cross-device viewport clamping for free-form desktop transforms & fixed widths
  const isNarrowMobile = mounted && viewportWidth <= 768 && !mobilePreview;
  const maxSafeVwWidth = mounted && viewportWidth > 0 ? Math.max(160, viewportWidth - 24) : undefined;
  const clampedRenderW =
    !isFloatingWidget && curW && !isNarrowMobile
      ? maxSafeVwWidth
        ? Math.min(curW, maxSafeVwWidth)
        : curW
      : curW;
  const clampedRenderX =
    !isFloatingWidget && mounted && !isNarrowMobile && curX !== 0
      ? Math.max(
          -Math.round(viewportWidth * 0.45),
          Math.min(Math.round(viewportWidth * 0.45), curX)
        )
      : curX;

  const canvasStyle: React.CSSProperties = {
    boxSizing: "border-box",
    ...style,
    ...(isFloatingWidget
      ? {
          position: "fixed",
          right: `${floatingPosCheck.right}px`,
          bottom: `${floatingPosCheck.bottom}px`,
          left: "auto",
          top: "auto",
          transform: curRot ? `rotate(${curRot}deg)` : "none",
        }
      : !isNarrowMobile && (clampedRenderX !== 0 || curY !== 0 || curRot !== 0)
        ? {
            transform: `translate3d(${clampedRenderX}px, ${curY}px, 0)${
              curRot ? ` rotate(${curRot}deg)` : ""
            }`,
          }
        : {}),
    ...(clampedRenderW && !isNarrowMobile
      ? { width: `${clampedRenderW}px`, maxWidth: isFloatingWidget ? "95vw" : "100%" }
      : {}),
    ...(curH && !isNarrowMobile ? { minHeight: `${curH}px` } : {}),
    ...(typeof activeZ === "number" ? { zIndex: activeZ } : {}),
    ...(canEdit ? { overflow: "visible" } : {}),
    ...(saved.textColor ? { color: saved.textColor } : {}),
    ...(saved.bgColor ? { backgroundColor: saved.bgColor, borderRadius: "1rem" } : {}),
    ...(saved.borderColor
      ? { border: `2px solid ${saved.borderColor}`, borderRadius: "1rem" }
      : {}),
  };

  const frameContent = !isMicroNode ? (
    <NestedFrameDepthContext.Provider value={id}>
      {children}
    </NestedFrameDepthContext.Provider>
  ) : (
    children
  );

  if (saved.deleted && !canEdit) {
    return null;
  }

  if (saved.deleted && canEdit) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-red-400/50 bg-black/50 px-2 py-1 text-[10px] font-bold text-red-200/80"
      >
        <span>🗑️ Hidden {resolvedElementType}: {label || id}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void persistCanvas({ deleted: false });
          }}
          className="px-1.5 py-0.5 rounded bg-[#d4af37] text-[#18181B] font-extrabold text-[9px]"
        >
          Restore
        </button>
      </div>
    );
  }

  const hasFreeformDesktop =
    !isFloatingWidget && (curX !== 0 || curY !== 0 || Boolean(curW) || Boolean(curH));

  const canvasMarkup = (
    <div
      ref={boxRef}
      data-canvas-id={id}
      data-god-card={!isMicroNode && !isFloatingWidget ? "true" : undefined}
      data-dragging={activeOp !== "idle" ? "true" : undefined}
      data-edit-mode={canEdit ? "true" : undefined}
      data-desktop-freeform={hasFreeformDesktop ? "true" : undefined}
      style={canvasStyle}
      onMouseOver={(e) => {
        if (!showHandles) return;
        e.stopPropagation();
        setGlobalHoveredId(id);
      }}
      onMouseOut={(e) => {
        if (!showHandles) return;
        const nextTarget = e.relatedTarget as Node | null;
        if (
          !e.currentTarget.contains(nextTarget) &&
          (!portalToolbarRef.current || !portalToolbarRef.current.contains(nextTarget))
        ) {
          if (currentHoveredCanvasId === id) {
            setGlobalHoveredId(null);
          }
        }
      }}
      onPointerDown={(e) => {
        if (!showHandles) return;
        if (isMicroNode) {
          e.stopPropagation();
          const targetEl = e.target as HTMLElement | null;
          if (
            targetEl?.closest(
              "input, textarea, select, [data-no-micro-drag='true']"
            )
          ) {
            return;
          }
          handleDragStart(e);
          return;
        }
        // Outer parent frame: ONLY start dragging on the header grip OR empty background of the frame itself
        if (e.target === e.currentTarget) {
          handleDragStart(e);
        }
      }}
      onClick={(e) => {
        if (!showHandles) return;
        if (isMicroNode) {
          e.stopPropagation();
          setSelected(true);
        } else if (e.target === e.currentTarget) {
          e.stopPropagation();
          setSelected(true);
        }
      }}
      onDoubleClick={(e) => {
        if (!canEdit || isChildNode) return;
        e.preventDefault();
        e.stopPropagation();
        setEnteredFrameId(isEnteredAsParent ? null : id);
        setGlobalHoveredId(null);
        setSelected(false);
        setInspectorOpen(false);
      }}
      className={[
        "god-mode-box",
        isFloatingWidget ? "god-mode-floating-widget" : "",
        hasFreeformDesktop ? "god-mode-desktop-freeform" : "",
        canEdit ? "overflow-visible" : "",
        isMicroNode && showHandles ? "cursor-grab active:cursor-grabbing" : "",
        presetWidthCls,
        alignCls,
        isEnteredAsParent
          ? "god-mode-grid rounded-2xl border-2 border-dashed border-[#d4af37] p-1.5 overflow-visible"
          : showHandles
            ? selected
              ? `god-mode-selected slide-canvas-frame ${isMicroNode ? "rounded-lg" : "rounded-2xl p-1"}`
              : hovered
                ? `god-mode-hover ${isMicroNode ? "rounded-lg" : "rounded-2xl p-0.5"}`
                : "god-mode-box-active"
            : "",
        activeOp !== "idle" ? "god-mode-box-dragging is-actively-dragging" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showHandles && (selected || hovered) && (
        <span
          style={isMicroNode ? { left: "auto", right: "8px" } : undefined}
          className="god-mode-type-tag"
        >
          {resolvedElementType}
        </span>
      )}
      {showHandles && isMicroNode && (hovered || selected) && (
        <button
          type="button"
          onPointerDown={handleDragStart}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelected(true);
          }}
          title={`Drag ${label || resolvedElementType} anywhere inside card`}
          className="absolute -top-3.5 -left-1 z-[65] inline-flex items-center gap-0.5 rounded bg-[#2563EB] px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-white shadow cursor-grab active:cursor-grabbing select-none whitespace-nowrap"
        >
          ✥ Drag
        </button>
      )}
      {canEdit && isEnteredAsParent && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#111318]/95 border border-[#d4af37] px-3 py-1.5 text-[11px] font-bold text-[#FAF7F0] shadow-lg"
        >
          <span className="text-[#E5C158]">
            🔍 Inside Frame: {label || id} — Click &amp; drag inner elements (Esc to exit)
          </span>
          <button
            type="button"
            onClick={() => setEnteredFrameId(null)}
            className="px-2.5 py-0.5 rounded-lg bg-[#d4af37] text-[#18181B] font-extrabold text-[10px]"
          >
            Exit Frame ✓
          </button>
        </div>
      )}

      {showHandles &&
        (!isMicroNode || selected || hovered) &&
        HANDLE_DEFS.filter(
          (h) =>
            !isMicroNode ||
            selected ||
            h.dir === "e" ||
            h.dir === "s" ||
            h.dir === "se"
        ).map((h) => (
          <button
            key={h.dir}
            type="button"
            aria-label={`Resize ${h.dir} handle`}
            onPointerDown={(e) => handleResizeStart(e, h.dir)}
            className={`slide-canvas-handle ${h.posClass} ${h.cursorClass}`}
          />
        ))}

      {showHandles && (!isMicroNode || selected) && (
        /* Top Rotation Handle + Connector Stem */
        <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
          <button
            type="button"
            onPointerDown={handleRotateStart}
            title="Drag to rotate element"
            aria-label={`Rotate ${label || id}`}
            className="pointer-events-auto h-5 w-5 rounded-full bg-white border-2 border-[#2563EB] text-[#2563EB] text-[10px] font-black flex items-center justify-center shadow hover:scale-110 cursor-grab active:cursor-grabbing"
          >
            ↻
          </button>
          <span className="h-2.5 w-0.5 bg-[#2563EB]/85" />
        </div>
      )}

      {showHandles && !isMicroNode && (
        /* Lightweight in-corner Move Grip (always accessible); Full Toolbar Portaled at z-[99999] */
        <button
          type="button"
          onPointerDown={handleDragStart}
          onClick={(e) => {
            e.stopPropagation();
            setSelected(true);
          }}
          title={`Drag ${label || id} (16px Magnetic Grid + Sibling Guides; hold Shift to free-move)`}
          className="mb-1 inline-flex items-center gap-1 rounded-md border border-[#2563EB]/65 bg-[#0F172A]/90 px-2 py-0.5 text-[10px] font-bold text-[#93C5FD] shadow cursor-grab active:cursor-grabbing select-none"
        >
          ✥ {label || id}
        </button>
      )}

      {shouldShowPortalToolbar &&
        toolbarPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={portalToolbarRef}
            onMouseEnter={() => setGlobalHoveredId(id)}
            onMouseLeave={(e) => {
              const nextTarget = e.relatedTarget as Node | null;
              if (!boxRef.current || !boxRef.current.contains(nextTarget)) {
                if (currentHoveredCanvasId === id) {
                  setGlobalHoveredId(null);
                }
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${toolbarPos.top}px`,
              left: `${toolbarPos.left}px`,
              zIndex: 99999,
            }}
            className={`flex flex-wrap items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1 text-[10px] font-bold text-[#FAF7F0] shadow-2xl shadow-black/60 backdrop-blur-md max-w-[calc(100vw-16px)] ${
              isChildNode
                ? "bg-[#1E1B4B]/95 border-[#A855F7]/90"
                : "bg-[#0F172A]/95 border-[#2563EB]/90"
            }`}
          >
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onPointerDown={handleDragStart}
                title="Drag outer frame (16px Magnetic Grid + Sibling Snapping ON; Shift = Free)"
                className="cursor-grab active:cursor-grabbing px-1.5 py-0.5 rounded bg-[#2563EB]/30 text-[#93C5FD] border border-[#2563EB]/60 select-none"
              >
                ✥ Move · {label || id}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(true);
                  setInspectorOpen((v) => !v);
                }}
                className={`px-2 py-0.5 rounded border transition ${
                  inspectorOpen
                    ? "bg-[#2563EB] text-white border-[#60A5FA]"
                    : "border-white/20 text-[#E5C158] hover:border-[#d4af37]"
                }`}
              >
                ⚙️ Inspector
              </button>
              {!isChildNode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEnteredFrameId(id);
                  }}
                  title="Double-click frame or click here to move inner elements"
                  className="px-1.5 py-0.5 rounded border border-[#d4af37]/45 text-[#E5C158] hover:bg-[#d4af37]/20"
                >
                  🔍 Enter
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMobilePreview();
                }}
                title="Toggle Mobile Responsive Clamp vs Desktop Free-Form Preview"
                className={`px-1.5 py-0.5 rounded border ${
                  mobilePreview
                    ? "bg-[#d4af37] text-[#18181B] border-[#d4af37]"
                    : "border-white/20 text-sky-200 hover:border-sky-400"
                }`}
              >
                📱 {mobilePreview ? "Free" : "Mobile"}
              </button>
            </div>

            <div className="flex items-center gap-1.5 opacity-95">
              <span className="font-mono text-[9px] text-sky-200 hidden sm:inline">
                ({curX}, {curY})
                {curW ? ` ${curW}px` : ""}
                {curRot ? ` ${curRot}°` : ""}
              </span>
              {(isFloatingWidget ||
                curX !== 0 ||
                curY !== 0 ||
                curRot !== 0 ||
                saved.width ||
                saved.height ||
                saved.widthPreset ||
                saved.layoutWidth ||
                saved.layoutAlign ||
                saved.textColor ||
                saved.bgColor ||
                saved.borderColor) && (
                <button
                  type="button"
                  onClick={() =>
                    void persistCanvas(
                      {
                        x: 0,
                        y: 0,
                        xRatio: undefined,
                        width: undefined,
                        widthRatio: undefined,
                        height: undefined,
                        widthPreset: undefined,
                        layoutWidth: undefined,
                        layoutAlign: undefined,
                        rotation: 0,
                        zIndex: undefined,
                        alignSelf: undefined,
                        textColor: undefined,
                        bgColor: undefined,
                        borderColor: undefined,
                      },
                      isFloatingWidget
                        ? { supportWidgetPos: { right: 24, bottom: 24 } }
                        : undefined
                    )
                  }
                  className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-400/50 text-red-200 hover:bg-red-500/35"
                >
                  ↺ {isFloatingWidget ? "Reset Position" : "Reset to Grid"}
                </button>
              )}
            </div>
          </div>,
          document.body
        )}

      {showHandles && isMicroNode && (selected || inspectorOpen) && (
        /* Compact Out-of-Flow Action Bar for Micro-Elements inside Cards */
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 whitespace-nowrap rounded-lg border border-[#3b82f6] bg-[#0B101B]/95 px-1.5 py-0.5 text-[10px] font-bold text-[#FAF7F0] shadow-xl"
        >
          <button
            type="button"
            onPointerDown={handleDragStart}
            title={`Drag ${label || resolvedElementType} relative to parent card`}
            className="cursor-grab active:cursor-grabbing px-1.5 py-0.5 rounded bg-[#2563EB]/30 text-[#93C5FD] select-none"
          >
            ⋮⋮ {label || resolvedElementType}
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(true);
              setInspectorOpen((v) => !v);
            }}
            title="Inspect position, size, rotation & colors"
            className={`px-1.5 py-0.5 rounded border ${
              inspectorOpen
                ? "bg-[#2563EB] text-white border-[#60A5FA]"
                : "border-white/20 text-[#E5C158]"
            }`}
          >
            ⚙️
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setInspectorOpen(false);
              setSelected(false);
              void persistCanvas({ deleted: true });
            }}
            title={`Delete / hide ${label || resolvedElementType}`}
            className="px-1.5 py-0.5 rounded text-red-300 hover:bg-red-500/25"
          >
            🗑️
          </button>
          {(curX !== 0 ||
            curY !== 0 ||
            curRot !== 0 ||
            saved.width ||
            saved.height ||
            saved.layoutWidth ||
            saved.layoutAlign) && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                void persistCanvas({
                  x: 0,
                  y: 0,
                  width: undefined,
                  height: undefined,
                  widthPreset: undefined,
                  layoutWidth: undefined,
                  layoutAlign: undefined,
                  alignSelf: undefined,
                  rotation: 0,
                });
              }}
              title="Reset local offset"
              className="px-1 py-0.5 rounded text-sky-300 hover:bg-white/10"
            >
              ↺
            </button>
          )}
        </div>
      )}

      {frameContent}

      {/* Smart Center & Sibling Alignment Laser Guides Portal */}
      {(smartGuides?.v || smartGuides?.h) &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {smartGuides.v && (
              <div
                style={{ left: `${smartGuides.v.px}px` }}
                className="sibling-guide-v"
              >
                <span className="fixed top-16 -translate-x-1/2 rounded bg-cyan-400 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950 shadow">
                  {smartGuides.v.label}
                </span>
              </div>
            )}
            {smartGuides.h && (
              <div
                style={{ top: `${smartGuides.h.px}px` }}
                className="sibling-guide-h"
              >
                <span className="fixed left-3 -translate-y-1/2 rounded bg-cyan-400 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950 shadow">
                  {smartGuides.h.label}
                </span>
              </div>
            )}
          </>,
          document.body
        )}

      {/* Floating Figma-Style Canvas Inspector Portal */}
      {canEdit &&
        inspectorOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="fixed right-4 top-20 z-[100] w-[320px] max-w-[calc(100vw-32px)] max-h-[82vh] overflow-y-auto rounded-2xl border-2 border-[#2563EB] bg-[#0B101B]/98 text-[#FAF7F0] p-4 shadow-2xl shadow-black/60 backdrop-blur-md space-y-3 text-xs"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                  {isMicroNode
                    ? `🧬 Micro-Element (${resolvedParentId ? `in ${resolvedParentId}` : "Card Relative"})`
                    : isChildNode
                      ? `🧩 Child Element (in ${resolvedParentId || "Card"})`
                      : "🖼️ Root Frame (Figma Inspector)"}
                </p>
                <p className="font-bold truncate text-sm">{label || id}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectorOpen(false)}
                className="px-2 py-0.5 rounded border border-white/20 text-[11px] hover:border-sky-400"
              >
                ✕
              </button>
            </div>

            {/* Scope Context Switcher */}
            {isMicroNode ? (
              <p className="rounded-lg border border-sky-400/35 bg-sky-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-sky-200">
                Coordinates &amp; transforms save independently relative to the enclosing card.
              </p>
            ) : isChildNode && resolvedParentId ? (
              <button
                type="button"
                onClick={() => {
                  setInspectorOpen(false);
                  setEnteredFrameId(null);
                }}
                className="w-full py-1.5 rounded-lg border border-purple-400/50 bg-purple-500/15 text-purple-200 font-bold text-[11px] hover:bg-purple-500/25"
              >
                ↑ Exit Child Scope Back to Root Frame
              </button>
            ) : !isChildNode ? (
              <button
                type="button"
                onClick={() => {
                  setInspectorOpen(false);
                  setEnteredFrameId(id);
                }}
                className="w-full py-1.5 rounded-lg border border-[#d4af37]/50 bg-[#d4af37]/15 text-[#E5C158] font-bold text-[11px] hover:bg-[#d4af37]/25"
              >
                🔍 Double-Click / Enter Frame to Edit Inner Children
              </button>
            ) : null}

            {/* Magnetic Grid Snap Toggle */}
            <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/35 px-2.5 py-1.5">
              <span className="text-[10px] font-bold opacity-80">
                🧲 Grid Snap
              </span>
              <div className="flex gap-1">
                {([16, 10, 20, 0] as const).map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => void persistCanvas({ snapStep: step })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeSnapStep === step
                        ? "bg-[#2563EB] text-white"
                        : "bg-white/10 opacity-75"
                    }`}
                  >
                    {step === 0 ? "Off" : `${step}px`}
                  </button>
                ))}
              </div>
            </div>

            {/* X / Y / Rotation */}
            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-0.5">
                <span className="text-[10px] opacity-70 font-bold">X (px)</span>
                <input
                  type="number"
                  value={curX}
                  onChange={(e) =>
                    void persistCanvas({ x: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-xs"
                />
              </label>
              <label className="space-y-0.5">
                <span className="text-[10px] opacity-70 font-bold">Y (px)</span>
                <input
                  type="number"
                  value={curY}
                  onChange={(e) =>
                    void persistCanvas({ y: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-xs"
                />
              </label>
              <label className="space-y-0.5">
                <span className="text-[10px] opacity-70 font-bold">Rotate°</span>
                <input
                  type="number"
                  min={-180}
                  max={180}
                  value={curRot}
                  onChange={(e) =>
                    void persistCanvas({ rotation: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-xs"
                />
              </label>
            </div>

            {/* W / H + Aspect Ratio Lock */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-0.5">
                  <span className="text-[10px] opacity-70 font-bold">
                    Width (px)
                  </span>
                  <input
                    type="number"
                    min={isMicroNode ? 20 : 160}
                    placeholder="Auto"
                    value={curW ?? ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      void persistCanvas(
                        val > 0
                          ? { width: val, widthPreset: "custom" }
                          : { width: undefined, widthPreset: undefined }
                      );
                    }}
                    className="w-full rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-xs"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[10px] opacity-70 font-bold">
                    Min Height (px)
                  </span>
                  <input
                    type="number"
                    min={isMicroNode ? 20 : 40}
                    placeholder="Auto"
                    value={curH ?? ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      void persistCanvas({ height: val > 0 ? val : undefined });
                    }}
                    className="w-full rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-xs"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex gap-1">
                  {(["1/3", "1/2", "3/4", "full"] as const).map((wp) => (
                    <button
                      key={wp}
                      type="button"
                      onClick={() =>
                        void persistCanvas({ widthPreset: wp, width: undefined })
                      }
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                        saved.widthPreset === wp
                          ? "border-[#2563EB] bg-[#2563EB] text-white"
                          : "border-white/20 opacity-75"
                      }`}
                    >
                      {wp}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void persistCanvas({ lockAspectRatio: !saved.lockAspectRatio })
                  }
                  className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                    saved.lockAspectRatio
                      ? "border-[#d4af37] bg-[#d4af37]/25 text-[#E5C158]"
                      : "border-white/20 opacity-75"
                  }`}
                >
                  🔒 Aspect: {saved.lockAspectRatio ? "Locked" : "Free"}
                </button>
              </div>
            </div>

            {/* Container Width & Block Alignment Constraints */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase opacity-75">
                  Container Width
                </span>
                {saved.layoutWidth && (
                  <button
                    type="button"
                    onClick={() =>
                      void persistCanvas({
                        layoutWidth: undefined,
                        widthPreset: undefined,
                      })
                    }
                    className="text-[10px] underline text-sky-300 hover:text-white"
                  >
                    Auto
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: "full", label: "Full (100%)" },
                    { id: "wide", label: "Wide (75%)" },
                    { id: "half", label: "Half (50%)" },
                    { id: "compact", label: "Compact" },
                  ] as { id: SlideLayoutWidth; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      void persistCanvas({
                        layoutWidth:
                          saved.layoutWidth === opt.id ? undefined : opt.id,
                        width: undefined,
                        widthPreset: undefined,
                      })
                    }
                    className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                      saved.layoutWidth === opt.id
                        ? "border-[#2563EB] bg-[#2563EB] text-white"
                        : "border-white/20 bg-white/5 opacity-85 hover:opacity-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase opacity-75">
                  Block Alignment
                </span>
                {activeAlign && (
                  <button
                    type="button"
                    onClick={() =>
                      void persistCanvas({
                        layoutAlign: undefined,
                        alignSelf: undefined,
                      })
                    }
                    className="text-[10px] underline text-sky-300 hover:text-white"
                  >
                    Auto
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "left", label: "Left" },
                    { id: "center", label: "Center" },
                    { id: "right", label: "Right" },
                  ] as { id: SlideLayoutAlign; label: string }[]
                ).map((al) => (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() =>
                      void persistCanvas({
                        layoutAlign: activeAlign === al.id ? undefined : al.id,
                        alignSelf: activeAlign === al.id ? undefined : al.id,
                      })
                    }
                    className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                      activeAlign === al.id
                        ? "border-[#d4af37] bg-[#d4af37] text-[#18181B]"
                        : "border-white/20 bg-white/5 opacity-85 hover:opacity-100"
                    }`}
                  >
                    {al.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Z-Index Layering */}
            <div className="space-y-1 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase opacity-75">
                  Layering (Z-Index: {curZ ?? "Auto"})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void persistCanvas({ zIndex: computeNextZ("front") })}
                  className="py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/15 text-sky-300 font-bold text-[11px] hover:bg-sky-500/25"
                >
                  ⬆️ Bring to Front
                </button>
                <button
                  type="button"
                  onClick={() => void persistCanvas({ zIndex: computeNextZ("back") })}
                  className="py-1.5 rounded-lg border border-white/20 bg-white/5 font-bold text-[11px] hover:bg-white/15"
                >
                  ⬇️ Send to Back
                </button>
              </div>
            </div>

            {/* Text, Background & Border Colors */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="block text-[10px] font-bold uppercase opacity-75">
                Box Colors
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: "textColor", label: "Text", def: "#FAF7F0" },
                    { key: "bgColor", label: "Background", def: "#141B2D" },
                    { key: "borderColor", label: "Border", def: "#d4af37" },
                  ] as const
                ).map((c) => (
                  <div key={c.key} className="space-y-0.5 text-center">
                    <span className="block text-[10px] opacity-75">{c.label}</span>
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="color"
                        value={
                          /^#[0-9a-f]{6}$/i.test(saved[c.key] || "")
                            ? saved[c.key]
                            : c.def
                        }
                        onChange={(e) =>
                          void persistCanvas({ [c.key]: e.target.value })
                        }
                        className="w-7 h-7 rounded border-0 bg-transparent p-0 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => void persistCanvas({ [c.key]: undefined })}
                        className="text-[10px] underline opacity-70"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {extraInspectorContent && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                {extraInspectorContent}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    void persistCanvas(
                      {
                        x: 0,
                        y: 0,
                        width: undefined,
                        height: undefined,
                        widthPreset: undefined,
                        layoutWidth: undefined,
                        layoutAlign: undefined,
                        rotation: 0,
                        zIndex: undefined,
                        lockAspectRatio: false,
                        alignSelf: undefined,
                        textColor: undefined,
                        bgColor: undefined,
                        borderColor: undefined,
                        deleted: false,
                      },
                      isFloatingWidget
                        ? { supportWidgetPos: { right: 24, bottom: 24 } }
                        : undefined
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-300 font-bold text-[11px]"
                >
                  {isFloatingWidget ? "↺ Reset Position" : "↺ Reset"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInspectorOpen(false);
                    setSelected(false);
                    void persistCanvas({ deleted: true });
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-red-500/50 bg-red-500/15 text-red-200 font-bold text-[11px]"
                >
                  🗑️ Delete
                </button>
              </div>
              <button
                type="button"
                onClick={() => setInspectorOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold text-[11px]"
              >
                Done ✓
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );

  if (isFloatingWidget && mounted && typeof document !== "undefined") {
    return createPortal(canvasMarkup, document.body);
  }
  return canvasMarkup;
}

export type GodModeBoxProps = SlidePresentationCanvasProps;

export function GodModeBox(props: GodModeBoxProps) {
  return <SlidePresentationCanvas {...props} />;
}

export interface GodModeTopicCardProps {
  id: string;
  pageKey?: string;
  title: string;
  description: string;
  badge?: string;
  gurmukhi?: string;
  icon?: React.ReactNode;
  actionButton?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable standard topic card whose internal icon, badge, heading (h3),
 * body copy (p), and action control are independently draggable micro-elements.
 */
export function GodModeTopicCard({
  id,
  pageKey = "global",
  title,
  description,
  badge,
  gurmukhi,
  icon,
  actionButton,
  className = "",
  style,
}: GodModeTopicCardProps) {
  return (
    <SlidePresentationCanvas
      id={`card-${id}`}
      pageKey={pageKey}
      label={title}
      elementType="Card"
      className={className}
      style={style}
    >
      <div className="space-y-2.5">
        {(icon || badge) && (
          <div className="flex items-center justify-between gap-2">
            {icon && (
              <SlidePresentationCanvas
                id={`${id}-icon`}
                parentId={`card-${id}`}
                pageKey={pageKey}
                label="Icon"
                elementType="Icon"
                isMicroElement={true}
                className="inline-block w-fit"
              >
                {icon}
              </SlidePresentationCanvas>
            )}
            {badge && (
              <SlidePresentationCanvas
                id={`${id}-badge`}
                parentId={`card-${id}`}
                pageKey={pageKey}
                label="Badge"
                elementType="Badge"
                isMicroElement={true}
                className="inline-block w-fit"
              >
                <span className="inline-flex items-center rounded-full border border-[#C59B27]/40 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#C59B27]">
                  {badge}
                </span>
              </SlidePresentationCanvas>
            )}
          </div>
        )}

        {gurmukhi && (
          <SlidePresentationCanvas
            id={`${id}-gurmukhi`}
            parentId={`card-${id}`}
            pageKey={pageKey}
            label="Gurmukhi"
            elementType="Text"
            isMicroElement={true}
          >
            <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">
              {gurmukhi}
            </p>
          </SlidePresentationCanvas>
        )}

        <SlidePresentationCanvas
          id={`${id}-title`}
          parentId={`card-${id}`}
          pageKey={pageKey}
          label="Title"
          elementType="Text"
          isMicroElement={true}
        >
          <h3 className="font-serif text-lg font-bold">{title}</h3>
        </SlidePresentationCanvas>

        <SlidePresentationCanvas
          id={`${id}-description`}
          parentId={`card-${id}`}
          pageKey={pageKey}
          label="Description"
          elementType="Text"
          isMicroElement={true}
        >
          <p className="text-sm leading-relaxed opacity-85">{description}</p>
        </SlidePresentationCanvas>

        {actionButton && (
          <SlidePresentationCanvas
            id={`${id}-action`}
            parentId={`card-${id}`}
            pageKey={pageKey}
            label="Button"
            elementType="Widget"
            isMicroElement={true}
            className="inline-block w-fit"
          >
            {actionButton}
          </SlidePresentationCanvas>
        )}
      </div>
    </SlidePresentationCanvas>
  );
}
