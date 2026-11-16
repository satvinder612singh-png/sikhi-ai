"use client";

import React, { useEffect, useState } from "react";
import {
  useAdminEditMode,
  useCmsSiteState,
  checkVerifiedAdminStatus,
  pushAdminCmsPatch,
  resolveCmsFontFamily,
  type CmsFontFamily,
  type CmsFontScale,
  type CmsTopicEdit,
} from "@/components/editable-heritage-image";

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
  const [liveEditMode] = useAdminEditMode();
  const [isAdmin, setIsAdmin] = useState(false);
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
    let active = true;
    const sync = async () => {
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
  }, []);

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

  if (!isAdmin || !liveEditMode) {
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
