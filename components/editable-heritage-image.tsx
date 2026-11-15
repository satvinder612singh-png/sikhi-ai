"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export type FrameOrientation = "auto" | "landscape" | "portrait" | "square";
export type FrameFitMode = "contain-museum" | "cover";

export interface HeritageFrameSettings {
  src: string;
  orientation: FrameOrientation;
  fitMode: FrameFitMode;
  posX: number;
  posY: number;
  zoom: number;
  hidden: boolean;
}

export interface EditableHeritageImageProps {
  imageKey: string;
  defaultSrc: string;
  alt: string;
  defaultOrientation?: FrameOrientation;
  defaultFit?: FrameFitMode;
  className?: string;
  onImageChange?: (newSrc: string) => void;
}

const FRAMES_STORAGE_KEY = "learnsikhi_image_frames_v1";
const ADMIN_STORAGE_KEY = "learnsikhi_founder_admin_v1";
const ADMIN_EMAIL_STORAGE_KEY = "learnsikhi_active_email_v1";
const FRAME_UPDATED_EVENT = "learnsikhi-frame-updated";

export function compressImageFile(
  file: File,
  maxWidth = 1400,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const rawUrl = typeof reader.result === "string" ? reader.result : "";
      if (!rawUrl) {
        reject(new Error("Empty file"));
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(rawUrl);
      img.onload = () => {
        try {
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const targetW = Math.max(1, Math.round(img.width * scale));
          const targetH = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(rawUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed.length < rawUrl.length ? compressed : rawUrl);
        } catch {
          resolve(rawUrl);
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}

let remoteSyncPromise: Promise<void> | null = null;

function syncRemoteFramesOnce(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (remoteSyncPromise) return remoteSyncPromise;

  remoteSyncPromise = fetch("/api/site-frames", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data || typeof data !== "object" || !data.frames) return;
      const remoteFrames = data.frames as Record<string, HeritageFrameSettings>;
      const merged = { ...readAllFrames(), ...remoteFrames };
      try {
        window.localStorage.setItem(FRAMES_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore quota errors
      }
      window.dispatchEvent(new CustomEvent(FRAME_UPDATED_EVENT, { detail: {} }));
    })
    .catch(() => {
      // ignore network errors offline
    });

  return remoteSyncPromise;
}

const framePushTimers: Record<string, number> = {};

function pushFrameToServer(
  imageKey: string,
  next: HeritageFrameSettings | null
) {
  if (typeof window === "undefined") return;
  if (framePushTimers[imageKey]) {
    window.clearTimeout(framePushTimers[imageKey]);
  }
  framePushTimers[imageKey] = window.setTimeout(() => {
    void fetch("/api/site-frames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frameUpdate: { imageKey, settings: next },
      }),
    }).catch(() => {
      // ignore offline errors
    });
  }, 220);
}

function isStealthAdminEmail(email?: string | null): boolean {
  return Boolean(email && email.trim().toLowerCase().endsWith("student1313@learnsikhi.com"));
}

function readAllFrames(): Record<string, HeritageFrameSettings> {
  try {
    const raw = window.localStorage.getItem(FRAMES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeFrame(imageKey: string, next: HeritageFrameSettings | null) {
  try {
    const all = readAllFrames();
    if (next === null) {
      delete all[imageKey];
    } else {
      all[imageKey] = next;
    }
    window.localStorage.setItem(FRAMES_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(
      new CustomEvent(FRAME_UPDATED_EVENT, { detail: { imageKey } })
    );
  } catch {
    // ignore storage quota errors
  }
}

export function EditableHeritageImage({
  imageKey,
  defaultSrc,
  alt,
  defaultOrientation = "auto",
  defaultFit = "contain-museum",
  className = "",
  onImageChange,
}: EditableHeritageImageProps) {
  const { user } = useAuth();

  const buildDefaults = (): HeritageFrameSettings => ({
    src: defaultSrc,
    orientation: defaultOrientation,
    fitMode: defaultFit,
    posX: 50,
    posY: 35,
    zoom: 100,
    hidden: false,
  });

  const [settings, setSettings] = useState<HeritageFrameSettings>(buildDefaults);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const [isStealthAdmin, setIsStealthAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync stealth admin status
  useEffect(() => {
    const syncAdmin = () => {
      try {
        const flag = window.localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
        const storedEmail = window.localStorage.getItem(ADMIN_EMAIL_STORAGE_KEY);
        setIsStealthAdmin(
          flag || isStealthAdminEmail(user?.email) || isStealthAdminEmail(storedEmail)
        );
      } catch {
        setIsStealthAdmin(isStealthAdminEmail(user?.email));
      }
    };
    syncAdmin();
    window.addEventListener("storage", syncAdmin);
    window.addEventListener("focus", syncAdmin);
    window.addEventListener("learnsikhi-admin-change", syncAdmin);
    return () => {
      window.removeEventListener("storage", syncAdmin);
      window.removeEventListener("focus", syncAdmin);
      window.removeEventListener("learnsikhi-admin-change", syncAdmin);
    };
  }, [user?.email]);

  // Sync persisted frame settings for imageKey
  useEffect(() => {
    const syncFrame = () => {
      const all = readAllFrames();
      const saved = all[imageKey];
      if (saved) {
        setSettings({
          src: saved.src ?? defaultSrc,
          orientation: saved.orientation ?? defaultOrientation,
          fitMode: saved.fitMode ?? defaultFit,
          posX: typeof saved.posX === "number" ? saved.posX : 50,
          posY: typeof saved.posY === "number" ? saved.posY : 35,
          zoom: typeof saved.zoom === "number" ? saved.zoom : 100,
          hidden: Boolean(saved.hidden),
        });
      } else {
        setSettings({
          src: defaultSrc,
          orientation: defaultOrientation,
          fitMode: defaultFit,
          posX: 50,
          posY: 35,
          zoom: 100,
          hidden: false,
        });
      }
    };

    syncFrame();
    void syncRemoteFramesOnce();
    const onFrameUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ imageKey?: string }>).detail;
      if (!detail?.imageKey || detail.imageKey === imageKey) {
        syncFrame();
      }
    };
    window.addEventListener("storage", syncFrame);
    window.addEventListener(FRAME_UPDATED_EVENT, onFrameUpdated);
    return () => {
      window.removeEventListener("storage", syncFrame);
      window.removeEventListener(FRAME_UPDATED_EVENT, onFrameUpdated);
    };
  }, [imageKey, defaultSrc, defaultOrientation, defaultFit]);

  const effectiveSrc = (settings.src || "").trim();

  if ((settings.hidden || !effectiveSrc) && !isEditing) {
    return null;
  }

  const updateSettings = (patch: Partial<HeritageFrameSettings>) => {
    const next: HeritageFrameSettings = { ...settings, ...patch };
    setSettings(next);
    writeFrame(imageKey, next);
    if (isStealthAdmin) {
      pushFrameToServer(imageKey, next);
    }
    if (patch.src !== undefined && onImageChange) {
      onImageChange(patch.src);
    }
  };

  const handleReset = () => {
    const fresh = buildDefaults();
    setSettings(fresh);
    writeFrame(imageKey, null);
    if (isStealthAdmin) {
      pushFrameToServer(imageKey, null);
    }
    setNaturalRatio(null);
    if (onImageChange) {
      onImageChange(defaultSrc);
    }
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const compressed = await compressImageFile(file, 1400, 0.82);
      setNaturalRatio(null);
      updateSettings({ src: compressed, hidden: false });
    } catch {
      // ignore read errors
    }
  };

  // Resolve effective orientation & fit mode
  const isAutoPortrait =
    settings.orientation === "auto" && naturalRatio !== null && naturalRatio < 1.05;
  const resolvedOrientation: Exclude<FrameOrientation, "auto"> =
    settings.orientation === "auto"
      ? isAutoPortrait
        ? "portrait"
        : "landscape"
      : settings.orientation;

  const resolvedFit: FrameFitMode =
    settings.orientation === "auto" && isAutoPortrait
      ? "contain-museum"
      : settings.fitMode;

  const aspectClass =
    resolvedOrientation === "portrait"
      ? "aspect-[3/4] sm:aspect-[4/5] max-h-[460px] mx-auto"
      : resolvedOrientation === "square"
        ? "aspect-square max-h-[380px] mx-auto"
        : "aspect-[16/10] sm:aspect-[16/9]";

  const zoomScale = Math.max(100, Math.min(150, settings.zoom)) / 100;

  return (
    <div className={`relative w-full group/frame ${className}`}>
      <div
        key={effectiveSrc || "empty-frame"}
        className={`relative w-full overflow-hidden rounded-xl bg-[#111318] flex items-center justify-center ${aspectClass}`}
      >
        {effectiveSrc ? (
          resolvedFit === "contain-museum" ? (
            <>
              <img
                src={effectiveSrc}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-35 pointer-events-none select-none"
              />
              <img
                src={effectiveSrc}
                alt={alt}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    setNaturalRatio(img.naturalWidth / img.naturalHeight);
                  }
                }}
                style={{
                  objectPosition: `${settings.posX}% ${settings.posY}%`,
                  transform: `scale(${zoomScale})`,
                }}
                className="relative z-10 w-full h-full object-contain transition-transform duration-150"
              />
            </>
          ) : (
            <img
              src={effectiveSrc}
              alt={alt}
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setNaturalRatio(img.naturalWidth / img.naturalHeight);
                }
              }}
              style={{
                objectPosition: `${settings.posX}% ${settings.posY}%`,
                transform: `scale(${zoomScale})`,
              }}
              className="w-full h-full object-cover transition-transform duration-150"
            />
          )
        ) : (
          <div className="p-6 text-center text-xs text-[#FAF7F0]/70">
            No image set. Paste a URL or upload a painting below.
          </div>
        )}

        {/* Stealth Admin Pill Button */}
        {isStealthAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing((v) => !v);
            }}
            className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full bg-black/80 text-[#E5C158] border border-[#C59B27]/60 text-[11px] font-bold shadow-md hover:bg-black transition"
          >
            ⚙️ Frame / Edit Painting
          </button>
        )}
      </div>

      {/* Stealth Admin Inline Frame Editor Popover */}
      {isStealthAdmin && isEditing && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-11 right-2 z-30 w-72 sm:w-80 max-h-[75vh] overflow-y-auto rounded-2xl border border-[#C59B27]/50 bg-[#111318] text-[#FAF7F0] p-4 shadow-2xl space-y-3.5 text-xs"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <span className="font-extrabold text-[#E5C158]">Frame &amp; Painting Editor</span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2 py-0.5 rounded-md border border-white/20 text-[11px] hover:border-[#C59B27]"
            >
              Done ✕
            </button>
          </div>

          {/* Orientation Toggle */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
              Orientation
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "auto", label: "Auto" },
                  { id: "landscape", label: "Landscape (16:9)" },
                  { id: "portrait", label: "Portrait (3:4)" },
                  { id: "square", label: "Square (1:1)" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateSettings({ orientation: opt.id })}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                    settings.orientation === opt.id
                      ? "border-[#C59B27] bg-[#C59B27]/20 text-[#E5C158]"
                      : "border-white/15 opacity-80 hover:opacity-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Display Mode */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
              Display Mode
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateSettings({ fitMode: "contain-museum" })}
                className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                  settings.fitMode === "contain-museum"
                    ? "border-[#C59B27] bg-[#C59B27]/20 text-[#E5C158]"
                    : "border-white/15 opacity-80 hover:opacity-100"
                }`}
              >
                Full Painting (Zero Crop)
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ fitMode: "cover" })}
                className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                  settings.fitMode === "cover"
                    ? "border-[#C59B27] bg-[#C59B27]/20 text-[#E5C158]"
                    : "border-white/15 opacity-80 hover:opacity-100"
                }`}
              >
                Fill Frame (Cover)
              </button>
            </div>
          </div>

          {/* Position & Zoom Sliders */}
          <div className="space-y-2">
            <label className="block">
              <span className="flex justify-between text-[11px] opacity-80 mb-0.5">
                <span>Horizontal (X)</span>
                <span>{settings.posX}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.posX}
                onChange={(e) => updateSettings({ posX: Number(e.target.value) })}
                className="w-full accent-[#C59B27]"
              />
            </label>

            <label className="block">
              <span className="flex justify-between text-[11px] opacity-80 mb-0.5">
                <span>Vertical (Y)</span>
                <span>{settings.posY}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.posY}
                onChange={(e) => updateSettings({ posY: Number(e.target.value) })}
                className="w-full accent-[#C59B27]"
              />
            </label>

            <label className="block">
              <span className="flex justify-between text-[11px] opacity-80 mb-0.5">
                <span>Zoom</span>
                <span>{settings.zoom}%</span>
              </span>
              <input
                type="range"
                min={100}
                max={140}
                value={settings.zoom}
                onChange={(e) => updateSettings({ zoom: Number(e.target.value) })}
                className="w-full accent-[#C59B27]"
              />
            </label>
          </div>

          {/* Replace Painting */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
              Replace Painting
            </span>
            <label className="block cursor-pointer text-center px-2.5 py-1.5 rounded-lg border border-[#C59B27]/50 bg-[#C59B27]/10 text-[#E5C158] font-semibold hover:border-[#C59B27]">
              <span>Upload File from PC</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
              />
            </label>
            <input
              type="url"
              value={effectiveSrc.startsWith("data:") ? "" : effectiveSrc}
              onChange={(e) => {
                setNaturalRatio(null);
                updateSettings({ src: e.target.value, hidden: false });
              }}
              placeholder="Or paste image URL (https://...)"
              className="w-full rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-[11px] text-[#FAF7F0] focus:outline-none focus:border-[#C59B27]"
            />
          </div>

          {/* Remove / Reset */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                updateSettings({ hidden: !settings.hidden });
                if (!settings.hidden) setIsEditing(false);
              }}
              className="flex-1 px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-300 font-semibold hover:bg-red-500/15"
            >
              {settings.hidden ? "Show Image" : "Hide Image"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-2.5 py-1.5 rounded-lg border border-white/20 font-semibold hover:border-[#C59B27]"
            >
              Reset Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
