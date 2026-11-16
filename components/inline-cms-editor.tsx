"use client";

import React, { useEffect, useRef, useState } from "react";
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
  type CmsTopicEdit,
} from "@/components/editable-heritage-image";

type SectionLayoutInfo = {
  titleAlign?: "left" | "center" | "right";
  widthMode?: "full" | "contained" | "compact";
  customTitle?: string;
  customSubtitle?: string;
  hidden?: boolean;
};

function useVerifiedLiveEdit(): boolean {
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
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
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

  if (!canEdit) return null;

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
      await pushAdminCmsPatch({
        archivedIds: Array.from(new Set([...existingArchived, itemId])),
        pinnedIds: existingPinned.filter((id) => id !== itemId),
      });
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
        title="Hide / Archive Card"
        className="px-1.5 py-0.5 rounded hover:bg-red-500/25 text-red-300 disabled:opacity-35 transition"
      >
        👁️ Hide
      </button>
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

interface GodModeTextRecord {
  text?: string;
  fontFamily?: CmsFontFamily;
  textSize?: GodModeTextSize;
  textColor?: string;
  bgColor?: string;
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
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 80, left: 24 });

  const elRecord = (cms.topicEdits?.[id] || {}) as CmsTopicEdit & GodModeTextRecord;
  const pageScope = (
    (cms.sectionLayoutMap || {})[`__god_page_${pageKey}`] || {}
  ) as GodModePageScopeRecord;

  const resolvedText = elRecord.text ?? elRecord.title ?? defaultText;
  const resolvedFont = elRecord.fontFamily || pageScope.fontFamily;
  const resolvedSize = elRecord.textSize || pageScope.textSize;
  const resolvedTextColor = elRecord.textColor || pageScope.textColor;
  const resolvedBgColor = elRecord.bgColor || pageScope.bgColor;

  const [draftText, setDraftText] = useState(resolvedText);
  const [draftFont, setDraftFont] = useState<CmsFontFamily | "">("");
  const [draftSize, setDraftSize] = useState<GodModeTextSize | "">("");
  const [draftTextColor, setDraftTextColor] = useState("");
  const [draftBgColor, setDraftBgColor] = useState("");
  const [scope, setScope] = useState<GodModeScope>("element");

  useEffect(() => {
    if (!open) return;
    setDraftText(resolvedText);
    setDraftFont(resolvedFont || "");
    setDraftSize(resolvedSize || "");
    setDraftTextColor(resolvedTextColor || "");
    setDraftBgColor(resolvedBgColor || "");
    setScope("element");
  }, [open, resolvedText, resolvedFont, resolvedSize, resolvedTextColor, resolvedBgColor]);

  const openToolbar = (e: React.MouseEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    const target = elRef.current || (e.currentTarget as HTMLElement);
    const rect = target.getBoundingClientRect();
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;
    const desiredLeft = Math.max(12, Math.min(rect.left, vw - 372));
    const desiredTop =
      rect.bottom + 340 < vh ? rect.bottom + 8 : Math.max(12, rect.top - 340);
    setPos({ top: desiredTop, left: desiredLeft });
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);

    const textPayload = {
      text: draftText,
      title: draftText,
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
        } as CmsTopicEdit,
      },
    });
    setSaving(false);
    setOpen(false);
  };

  const mergedClassName = [
    className,
    resolveGodModeSizeClass(resolvedSize),
    canEdit ? "god-mode-text-editable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(resolvedFont ? { fontFamily: resolveCmsFontFamily(resolvedFont) } : {}),
    ...(resolvedTextColor ? { color: resolvedTextColor } : {}),
    ...(resolvedBgColor
      ? {
          backgroundColor: resolvedBgColor,
          paddingLeft: style?.paddingLeft ?? "0.35em",
          paddingRight: style?.paddingRight ?? "0.35em",
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
        style={mergedStyle}
        className={mergedClassName}
        onClick={canEdit ? openToolbar : undefined}
        title={canEdit ? `Click to edit "${id}" (God Mode)` : undefined}
      >
        {resolvedText}
      </Tag>

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

export interface GodModeBoxProps {
  id: string;
  pageKey?: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GodModeBox({
  id,
  label,
  children,
  className = "",
  style,
}: GodModeBoxProps) {
  const cms = useCmsSiteState();
  const canEdit = useVerifiedLiveEdit();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [liveDrag, setLiveDrag] = useState<{ x: number; y: number } | null>(null);
  const [liveSize, setLiveSize] = useState<{ w: number; h: number } | null>(null);

  const saved = (
    (cms.sectionLayoutMap || {})[`__god_box_${id}`] || {}
  ) as GodModeBoxRecord;

  const persistBox = async (patch: Partial<GodModeBoxRecord>) => {
    await pushAdminCmsPatch({
      sectionLayoutMap: {
        ...(cms.sectionLayoutMap || {}),
        [`__god_box_${id}`]: {
          ...saved,
          ...patch,
        },
      },
    });
  };

  const handleDragStart = (e: React.PointerEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const baseX = saved.offsetX || 0;
    const baseY = saved.offsetY || 0;
    let latestX = baseX;
    let latestY = baseY;
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      latestX = Math.round(baseX + (ev.clientX - startX));
      latestY = Math.round(baseY + (ev.clientY - startY));
      setLiveDrag({ x: latestX, y: latestY });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragging(false);
      setLiveDrag(null);
      void persistBox({ offsetX: latestX, offsetY: latestY });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    const el = boxRef.current;
    const rect = el ? el.getBoundingClientRect() : { width: 400, height: 120 };
    const startX = e.clientX;
    const startY = e.clientY;
    const baseW = saved.customWidthPx || Math.round(rect.width);
    const baseH = saved.minHeightPx || Math.round(rect.height);
    let latestW = baseW;
    let latestH = baseH;
    setResizing(true);

    const onMove = (ev: PointerEvent) => {
      latestW = Math.max(180, Math.round(baseW + (ev.clientX - startX)));
      latestH = Math.max(48, Math.round(baseH + (ev.clientY - startY)));
      setLiveSize({ w: latestW, h: latestH });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setResizing(false);
      setLiveSize(null);
      void persistBox({
        widthPreset: "custom",
        customWidthPx: latestW,
        minHeightPx: latestH,
      });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const ox = liveDrag ? liveDrag.x : saved.offsetX || 0;
  const oy = liveDrag ? liveDrag.y : saved.offsetY || 0;

  const presetWidthCls =
    saved.widthPreset === "1/3"
      ? "w-full md:w-1/3"
      : saved.widthPreset === "1/2"
        ? "w-full md:w-1/2"
        : saved.widthPreset === "3/4"
          ? "w-full md:w-3/4"
          : saved.widthPreset === "full"
            ? "w-full"
            : "";

  const alignCls =
    saved.alignSelf === "center"
      ? "mx-auto"
      : saved.alignSelf === "right"
        ? "ml-auto"
        : saved.alignSelf === "left"
          ? "mr-auto"
          : "";

  const customW =
    liveSize?.w ?? (saved.widthPreset === "custom" ? saved.customWidthPx : undefined);
  const customH = liveSize?.h ?? saved.minHeightPx;

  const boxStyle: React.CSSProperties = {
    ...style,
    ...(customW ? { width: `${customW}px`, maxWidth: "100%" } : {}),
    ...(customH ? { minHeight: `${customH}px` } : {}),
    ...(ox !== 0 || oy !== 0
      ? { transform: `translate3d(${ox}px, ${oy}px, 0)` }
      : {}),
  };

  return (
    <div
      ref={boxRef}
      style={boxStyle}
      className={[
        "god-mode-box",
        presetWidthCls,
        alignCls,
        canEdit ? "god-mode-box-active" : "",
        dragging || resizing ? "god-mode-box-dragging" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {canEdit && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5 rounded-lg bg-black/85 border border-[#d4af37]/55 px-2 py-1 text-[10px] font-bold text-[#FAF7F0] shadow-md"
        >
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onPointerDown={handleDragStart}
              title="Drag to move anywhere on screen"
              className="cursor-grab active:cursor-grabbing px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#E5C158] border border-[#d4af37]/40 select-none"
            >
              ⋮⋮ Drag {label || id}
            </button>
            {(["1/3", "1/2", "3/4", "full"] as const).map((wp) => (
              <button
                key={wp}
                type="button"
                onClick={() =>
                  void persistBox({ widthPreset: wp, customWidthPx: undefined })
                }
                className={`px-1.5 py-0.5 rounded ${
                  saved.widthPreset === wp
                    ? "bg-[#d4af37] text-[#18181B]"
                    : "hover:bg-white/15 opacity-80"
                }`}
              >
                {wp === "full" ? "w-full" : `w-${wp}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {(["left", "center", "right"] as const).map((al) => (
              <button
                key={al}
                type="button"
                onClick={() => void persistBox({ alignSelf: al })}
                className={`px-1.5 py-0.5 rounded capitalize ${
                  saved.alignSelf === al
                    ? "bg-[#d4af37] text-[#18181B]"
                    : "hover:bg-white/15 opacity-80"
                }`}
              >
                {al}
              </button>
            ))}
            {(ox !== 0 || oy !== 0 || saved.widthPreset || saved.minHeightPx) && (
              <button
                type="button"
                onClick={() =>
                  void persistBox({
                    offsetX: 0,
                    offsetY: 0,
                    widthPreset: undefined,
                    customWidthPx: undefined,
                    minHeightPx: undefined,
                    alignSelf: undefined,
                  })
                }
                className="px-1.5 py-0.5 rounded text-red-300 hover:bg-red-500/20"
              >
                ↺ Reset
              </button>
            )}
          </div>
        </div>
      )}

      {children}

      {canEdit && (
        <span
          role="slider"
          aria-label={`Resize ${label || id}`}
          aria-valuenow={customW || 100}
          tabIndex={0}
          onPointerDown={handleResizeStart}
          title="Drag corner to resize box"
          className="god-mode-resize-handle"
        >
          ↘
        </span>
      )}
    </div>
  );
}
