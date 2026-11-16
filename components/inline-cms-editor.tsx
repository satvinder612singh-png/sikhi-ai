"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  useAdminEditMode,
  useCmsSiteState,
  checkVerifiedAdminStatus,
  isStealthAdminEmail,
  pushAdminCmsPatch,
  resolveCmsFontFamily,
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

  return (
    <div
      className="inline-flex flex-wrap items-center gap-1 rounded-full bg-black/85 border border-[#C59B27]/60 px-1.5 py-0.5 text-[10px] font-bold text-[#FAF7F0] shadow-md z-30"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={busy || idx === 0}
        onClick={(e) => applyReorder(e, "first")}
        title="Pin / Move to First"
        className="px-1.5 py-0.5 rounded-full hover:bg-[#C59B27]/25 text-[#E5C158] disabled:opacity-35 transition"
      >
        ⭐ First
      </button>
      <button
        type="button"
        disabled={busy || !canMovePrev}
        onClick={(e) => applyReorder(e, "prev")}
        title="Move Previous / Left"
        aria-label="Move card earlier"
        className="px-1.5 py-0.5 rounded-full hover:bg-white/15 disabled:opacity-35 transition"
      >
        ◀
      </button>
      <button
        type="button"
        disabled={busy || !canMoveNext}
        onClick={(e) => applyReorder(e, "next")}
        title="Move Next / Right"
        aria-label="Move card later"
        className="px-1.5 py-0.5 rounded-full hover:bg-white/15 disabled:opacity-35 transition"
      >
        ▶
      </button>
      <button
        type="button"
        disabled={busy || idx === allIds.length - 1}
        onClick={(e) => applyReorder(e, "last")}
        title="Move to End of List"
        className="px-1.5 py-0.5 rounded-full hover:bg-white/15 disabled:opacity-35 transition"
      >
        📥 Last
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => applyReorder(e, "hide")}
        title="Hide / Archive Card"
        className="px-1.5 py-0.5 rounded-full hover:bg-red-500/25 text-red-300 disabled:opacity-35 transition"
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
  const align = sec.titleAlign || "left";
  const widthMode = sec.widthMode || "full";

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
      className="rounded-2xl border-2 border-dashed border-[#C59B27]/70 bg-[#111318]/95 text-[#FAF7F0] px-4 py-3 shadow-lg space-y-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-[#C59B27]/20 border border-[#C59B27]/50 text-[#E5C158] font-extrabold uppercase tracking-wider text-[10px]">
            📍 Section Locator
          </span>
          <span className="font-bold text-[#FAF7F0]">{defaultTitle}</span>
          <span className="text-[11px] opacity-65 font-mono">
            ({pageKey} • #{sectionId})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
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
                    ? "bg-[#C59B27] text-[#18181B]"
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
                    ? "bg-[#C59B27] text-[#18181B]"
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
            + Add New Topic Card to This Page
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
