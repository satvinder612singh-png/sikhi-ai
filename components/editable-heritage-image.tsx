"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type FrameOrientation =
  | "natural"
  | "auto"
  | "landscape"
  | "portrait"
  | "square";
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
  legacyKeys?: string[];
  defaultSrc: string;
  alt: string;
  defaultOrientation?: FrameOrientation;
  defaultFit?: FrameFitMode;
  className?: string;
  allowUserEdit?: boolean;
  fallbackNode?: React.ReactNode;
  onImageChange?: (newSrc: string) => void;
}

const FRAMES_STORAGE_KEY = "learnsikhi_image_frames_v1";
const ADMIN_STORAGE_KEY = "learnsikhi_founder_admin_v1";
const ADMIN_EMAIL_STORAGE_KEY = "learnsikhi_active_email_v1";
export const ADMIN_VERIFIED_TOKEN_KEY = "learnsikhi_admin_token_v1";
const FRAME_UPDATED_EVENT = "learnsikhi-frame-updated";

export function isStealthAdminEmail(email?: string | null): boolean {
  return Boolean(
    email && email.trim().toLowerCase().endsWith("student1313@learnsikhi.com")
  );
}

let cachedTokenVerification: { token: string; ok: boolean } | null = null;

export async function getVerifiedAdminToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session?.access_token && isStealthAdminEmail(session.user?.email)) {
        return session.access_token;
      }
    }
  } catch {
    // ignore session check errors
  }

  try {
    const token = window.localStorage.getItem(ADMIN_VERIFIED_TOKEN_KEY);
    if (token && token.trim()) {
      return token.trim();
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

export async function checkVerifiedAdminStatus(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session?.user) {
        if (isStealthAdminEmail(session.user.email)) {
          try {
            window.localStorage.setItem(ADMIN_STORAGE_KEY, "true");
          } catch {
            // ignore
          }
          return true;
        }
        // Signed in as a non-admin account -> ensure admin flags are cleared unless server token overrides
        const fallbackToken = window.localStorage.getItem(ADMIN_VERIFIED_TOKEN_KEY);
        if (!fallbackToken) {
          try {
            window.localStorage.removeItem(ADMIN_STORAGE_KEY);
          } catch {
            // ignore
          }
          return false;
        }
      }
    }
  } catch {
    // ignore
  }

  try {
    const storedToken = window.localStorage.getItem(ADMIN_VERIFIED_TOKEN_KEY);
    if (!storedToken) {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
      return false;
    }
    if (cachedTokenVerification?.token === storedToken) {
      return cachedTokenVerification.ok;
    }
    const res = await fetch("/api/site-frames", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify({ action: "verify_admin" }),
      cache: "no-store",
    });
    const ok = res.ok;
    cachedTokenVerification = { token: storedToken, ok };
    if (ok) {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      return true;
    }
    window.localStorage.removeItem(ADMIN_VERIFIED_TOKEN_KEY);
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    return false;
  } catch {
    return false;
  }
}

export function clearAdminAuthTokens(): void {
  cachedTokenVerification = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ADMIN_VERIFIED_TOKEN_KEY);
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.localStorage.removeItem(ADMIN_EMAIL_STORAGE_KEY);
    window.dispatchEvent(new Event("learnsikhi-admin-change"));
  } catch {
    // ignore
  }
}

export function compressImageFile(
  file: File,
  maxDim = 1000,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(file.name))) {
      reject(new Error("Unsupported file type. Please select an image (JPG, PNG, or WebP)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file from device."));
    reader.onload = () => {
      const rawUrl = typeof reader.result === "string" ? reader.result : "";
      if (!rawUrl) {
        reject(new Error("Image file was empty."));
        return;
      }
      const img = new Image();
      img.onerror = () =>
        reject(
          new Error(
            "Could not decode this image format (e.g. HEIC). Please convert to JPG, PNG, or WebP."
          )
        );
      img.onload = () => {
        try {
          const largest = Math.max(img.width || 1, img.height || 1);
          const scale = largest > maxDim ? maxDim / largest : 1;
          const targetW = Math.max(1, Math.round(img.width * scale));
          const targetH = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas 2D context is unavailable in this browser."));
            return;
          }
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          if (!compressed || compressed === "data:,") {
            reject(new Error("Image compression produced an empty result."));
            return;
          }
          resolve(compressed);
        } catch (err) {
          reject(
            err instanceof Error
              ? err
              : new Error("Failed to compress image on canvas.")
          );
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}

let memoryFramesCache: Record<string, HeritageFrameSettings> = {};
let remoteSyncPromise: Promise<void> | null = null;
let legacyMigrationRan = false;

export function migrateLegacyChitrakariFramesOnce(): void {
  if (typeof window === "undefined" || legacyMigrationRan) return;
  legacyMigrationRan = true;

  try {
    const legacyEntries: Record<string, string> = {};
    const knownMapKeys = ["learnsikhi_chitrakari_v1", "learnsikhi_custom_chitrakari_v1"];

    for (const mapKey of knownMapKeys) {
      const raw = window.localStorage.getItem(mapKey);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (parsed && typeof parsed === "object") {
          for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === "string" && (v.startsWith("data:image/") || v.startsWith("http"))) {
              legacyEntries[k] = v;
            }
          }
        }
      } catch {
        // ignore malformed JSON
      }
    }

    for (let i = 0; i < window.localStorage.length; i++) {
      const storageKey = window.localStorage.key(i);
      if (!storageKey) continue;
      if (
        storageKey === FRAMES_STORAGE_KEY ||
        knownMapKeys.includes(storageKey)
      ) {
        continue;
      }
      if (
        storageKey.startsWith("sikhi_custom_chitrakari_") ||
        storageKey.includes("chitrakari")
      ) {
        const rawVal = window.localStorage.getItem(storageKey);
        if (!rawVal) continue;
        if (rawVal.startsWith("data:image/") || rawVal.startsWith("http")) {
          const cleanKey = storageKey.replace(/^sikhi_custom_chitrakari_/, "");
          legacyEntries[cleanKey] = rawVal;
        }
      }
    }

    const keys = Object.keys(legacyEntries);
    if (keys.length === 0) return;

    const existing = readAllFrames();
    const migratedFrames: Record<string, HeritageFrameSettings> = {};

    for (const rawKey of keys) {
      const src = legacyEntries[rawKey];
      const baseKey = rawKey.replace(/^(chitrakari-|matriarch-|foundations-card-)/, "");
      const targets = [
        `chitrakari-${baseKey}`,
        `matriarch-${baseKey}`,
        `foundations-card-${baseKey}`,
      ];
      for (const targetKey of targets) {
        if (!existing[targetKey]?.src) {
          const frame: HeritageFrameSettings = {
            src,
            orientation: "natural",
            fitMode: "contain-museum",
            posX: 50,
            posY: 35,
            zoom: 100,
            hidden: false,
          };
          existing[targetKey] = frame;
          migratedFrames[targetKey] = frame;
        }
      }
    }

    if (Object.keys(migratedFrames).length === 0) return;

    memoryFramesCache = existing;
    try {
      window.localStorage.setItem(FRAMES_STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // ignore quota errors
    }
    window.dispatchEvent(new CustomEvent(FRAME_UPDATED_EVENT, { detail: {} }));

    void (async () => {
      const token = await getVerifiedAdminToken();
      if (!token) return;
      await fetch("/api/site-frames", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ frames: migratedFrames }),
        cache: "no-store",
      }).catch(() => {
        // ignore offline errors
      });
    })();
  } catch {
    // ignore storage read errors
  }
}

function syncRemoteFramesOnce(force = false): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (remoteSyncPromise && !force) return remoteSyncPromise;

  remoteSyncPromise = fetch(`/api/site-frames?t=${Date.now()}`, {
    cache: "no-store",
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data || typeof data !== "object" || !data.frames) return;
      const remoteFrames = data.frames as Record<string, HeritageFrameSettings>;
      const merged = { ...readAllFrames(), ...remoteFrames };
      memoryFramesCache = merged;
      try {
        window.localStorage.setItem(FRAMES_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // QuotaExceededError must not abort state sync
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
  next: HeritageFrameSettings | null,
  onStatus?: (status: "syncing" | "synced" | "error", msg?: string) => void
) {
  if (typeof window === "undefined") return;
  if (framePushTimers[imageKey]) {
    window.clearTimeout(framePushTimers[imageKey]);
  }
  onStatus?.("syncing");
  framePushTimers[imageKey] = window.setTimeout(async () => {
    try {
      const token = await getVerifiedAdminToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/site-frames", {
        method: "POST",
        headers,
        body: JSON.stringify({
          frames: { [imageKey]: next },
        }),
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        storageMode?: "supabase" | "fallback";
        error?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Sync failed (${res.status})`);
      }
      if (data.storageMode === "supabase") {
        onStatus?.("synced", "✓ Image saved & synced globally (Supabase)");
      } else {
        onStatus?.("synced", "✓ Image synced to server");
      }
    } catch (err) {
      onStatus?.(
        "error",
        err instanceof Error ? err.message : "Failed to sync image globally."
      );
    }
  }, 150);
}

export function saveAndSyncFrame(
  imageKey: string,
  settings: HeritageFrameSettings
) {
  if (typeof window === "undefined") return;
  writeFrame(imageKey, settings);
  pushFrameToServer(imageKey, settings);
}

function readAllFrames(): Record<string, HeritageFrameSettings> {
  try {
    const raw = window.localStorage.getItem(FRAMES_STORAGE_KEY);
    if (!raw) return { ...memoryFramesCache };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? { ...(parsed as Record<string, HeritageFrameSettings>), ...memoryFramesCache }
      : { ...memoryFramesCache };
  } catch {
    return { ...memoryFramesCache };
  }
}

function writeFrame(imageKey: string, next: HeritageFrameSettings | null) {
  const all = readAllFrames();
  if (next === null) {
    delete all[imageKey];
  } else {
    all[imageKey] = next;
  }
  memoryFramesCache = all;
  try {
    window.localStorage.setItem(FRAMES_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // QuotaExceededError must not abort React state or server POST
  }
  try {
    window.dispatchEvent(
      new CustomEvent(FRAME_UPDATED_EVENT, { detail: { imageKey } })
    );
  } catch {
    // ignore
  }
}

export function EditableHeritageImage({
  imageKey,
  legacyKeys = [],
  defaultSrc,
  alt,
  defaultOrientation = "auto",
  defaultFit = "contain-museum",
  className = "",
  allowUserEdit = false,
  fallbackNode,
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
  const [dragOrigin, setDragOrigin] = useState<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const canEdit = isStealthAdmin || allowUserEdit;

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

  // Sync persisted frame settings for imageKey (and legacyKeys)
  useEffect(() => {
    migrateLegacyChitrakariFramesOnce();
    const legacyKeySignature = legacyKeys.join("|");
    const syncFrame = () => {
      const all = readAllFrames();
      let saved = all[imageKey];
      if (!saved && legacyKeySignature) {
        for (const lk of legacyKeySignature.split("|")) {
          if (lk && all[lk]) {
            saved = all[lk];
            break;
          }
        }
      }
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
    const onFocusSync = () => {
      void syncRemoteFramesOnce(true);
    };
    const onFrameUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ imageKey?: string }>).detail;
      if (!detail?.imageKey || detail.imageKey === imageKey) {
        syncFrame();
      }
    };
    window.addEventListener("storage", syncFrame);
    window.addEventListener("focus", onFocusSync);
    window.addEventListener(FRAME_UPDATED_EVENT, onFrameUpdated);
    return () => {
      window.removeEventListener("storage", syncFrame);
      window.removeEventListener("focus", onFocusSync);
      window.removeEventListener(FRAME_UPDATED_EVENT, onFrameUpdated);
    };
  }, [imageKey, defaultSrc, defaultOrientation, defaultFit]);

  const effectiveSrc = (settings.src || "").trim();
  const hasVisibleImage = Boolean(effectiveSrc) && !settings.hidden;

  if (!hasVisibleImage && !isEditing && !fallbackNode) {
    return null;
  }

  const handleSyncFeedback = (status: "syncing" | "synced" | "error", msg?: string) => {
    setSyncStatus(status);
    if (status === "syncing") {
      setSyncMessage("Uploading & syncing image...");
    } else if (status === "synced") {
      setSyncMessage(msg || "✓ Image saved & synced globally");
      window.setTimeout(() => {
        setSyncStatus((curr) => (curr === "synced" ? "idle" : curr));
      }, 3500);
    } else {
      setSyncMessage(msg || "Failed to sync image globally.");
    }
  };

  const updateSettings = (patch: Partial<HeritageFrameSettings>) => {
    const next: HeritageFrameSettings = { ...settings, ...patch };
    setSettings(next);
    writeFrame(imageKey, next);
    pushFrameToServer(imageKey, next, handleSyncFeedback);
    if (patch.src !== undefined && onImageChange) {
      onImageChange(patch.src);
    }
  };

  const handleReset = () => {
    const fresh = buildDefaults();
    setSettings(fresh);
    writeFrame(imageKey, null);
    pushFrameToServer(imageKey, null, handleSyncFeedback);
    setNaturalRatio(null);
    if (onImageChange) {
      onImageChange(defaultSrc);
    }
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setSyncStatus("syncing");
    setSyncMessage("Uploading & syncing image...");
    try {
      const compressed = await compressImageFile(file, 1000, 0.72);
      setNaturalRatio(null);
      updateSettings({
        src: compressed,
        orientation: "natural",
        fitMode: "contain-museum",
        hidden: false,
      });
    } catch (err) {
      setSyncStatus("error");
      setSyncMessage(
        err instanceof Error ? err.message : "Failed to process uploaded image."
      );
    }
  };

  // Resolve effective orientation & fit mode
  const isAutoPortrait =
    settings.orientation === "auto" && naturalRatio !== null && naturalRatio < 1.05;
  const resolvedOrientation: Exclude<FrameOrientation, "auto"> =
    settings.orientation === "auto"
      ? isAutoPortrait
        ? "natural"
        : "landscape"
      : settings.orientation;

  const resolvedFit: FrameFitMode =
    resolvedOrientation === "natural"
      ? "contain-museum"
      : settings.orientation === "auto" && isAutoPortrait
        ? "contain-museum"
        : settings.fitMode;

  const aspectClass =
    resolvedOrientation === "natural"
      ? ""
      : resolvedOrientation === "portrait"
        ? "aspect-[3/4] w-full"
        : resolvedOrientation === "square"
          ? "aspect-square w-full"
          : "aspect-[16/9] w-full";

  const zoomScale = Math.max(100, Math.min(150, settings.zoom)) / 100;

  return (
    <div className={`relative w-full group/frame ${className}`}>
      <div
        key={effectiveSrc || "empty-frame"}
        className={`relative w-full overflow-hidden rounded-xl bg-[#111318] flex items-center justify-center ${aspectClass}`}
      >
        {hasVisibleImage ? (
          resolvedOrientation === "natural" ? (
            <img
              src={effectiveSrc}
              alt={alt}
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setNaturalRatio(img.naturalWidth / img.naturalHeight);
                }
              }}
              className="w-full h-auto max-h-[520px] object-contain block mx-auto"
            />
          ) : resolvedFit === "contain-museum" ? (
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
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setNaturalRatio(img.naturalWidth / img.naturalHeight);
                }
              }}
              onPointerDown={(e) => {
                if (!canEdit || !isEditing) return;
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragOrigin({
                  x: e.clientX,
                  y: e.clientY,
                  posX: settings.posX,
                  posY: settings.posY,
                });
              }}
              onPointerMove={(e) => {
                if (!dragOrigin) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const dx = ((e.clientX - dragOrigin.x) / Math.max(1, rect.width)) * 100;
                const dy = ((e.clientY - dragOrigin.y) / Math.max(1, rect.height)) * 100;
                updateSettings({
                  posX: Math.round(Math.max(0, Math.min(100, dragOrigin.posX - dx))),
                  posY: Math.round(Math.max(0, Math.min(100, dragOrigin.posY - dy))),
                });
              }}
              onPointerUp={() => setDragOrigin(null)}
              onPointerCancel={() => setDragOrigin(null)}
              style={{
                objectPosition: `${settings.posX}% ${settings.posY}%`,
                transform: `scale(${zoomScale})`,
              }}
              className={`w-full h-full object-cover transition-transform duration-150 touch-none ${
                canEdit && isEditing ? "cursor-grab active:cursor-grabbing select-none" : ""
              }`}
            />
          )
        ) : fallbackNode && !isEditing ? (
          <div className="w-full">{fallbackNode}</div>
        ) : (
          <div className="p-6 text-center text-xs text-[#FAF7F0]/70">
            No image set. Paste a URL or upload a painting below.
          </div>
        )}

        {/* Frame / Reposition Pill Button */}
        {canEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEditing((v) => !v);
            }}
            className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full bg-black/80 text-[#E5C158] border border-[#C59B27]/60 text-[11px] font-bold shadow-md hover:bg-black transition"
          >
            {hasVisibleImage ? "⚙️ Frame / Reposition" : "⚙️ Upload / Frame Painting"}
          </button>
        )}
      </div>

      {/* Inline Frame Editor Popover */}
      {canEdit && isEditing && (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-11 right-2 z-30 w-72 sm:w-80 max-h-[75vh] overflow-y-auto rounded-2xl border border-[#C59B27]/50 bg-[#111318] text-[#FAF7F0] p-4 shadow-2xl space-y-3.5 text-xs"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <span className="font-extrabold text-[#E5C158]">Frame &amp; Painting Editor</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditing(false);
              }}
              className="px-2 py-0.5 rounded-md border border-white/20 text-[11px] hover:border-[#C59B27]"
            >
              Done ✕
            </button>
          </div>

          {syncStatus !== "idle" && syncMessage && (
            <div
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                syncStatus === "error"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : syncStatus === "synced"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-[#C59B27]/20 text-[#E5C158] border border-[#C59B27]/40"
              }`}
            >
              {syncMessage}
            </div>
          )}

          {/* Sizing Mode Buttons */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
              Sizing &amp; Orientation
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "natural", label: "Natural Size (Full Picture)" },
                  { id: "portrait", label: "Portrait (3:4)" },
                  { id: "landscape", label: "Landscape (16:9)" },
                  { id: "square", label: "Square (1:1)" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateSettings({
                      orientation: opt.id,
                      fitMode: opt.id === "natural" ? "contain-museum" : "cover",
                    });
                  }}
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
          {resolvedOrientation !== "natural" && (
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                Display Mode
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateSettings({ fitMode: "contain-museum" });
                  }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateSettings({ fitMode: "cover" });
                  }}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                    settings.fitMode === "cover"
                      ? "border-[#C59B27] bg-[#C59B27]/20 text-[#E5C158]"
                      : "border-white/15 opacity-80 hover:opacity-100"
                  }`}
                >
                  Fill Frame (Drag to Pan)
                </button>
              </div>
            </div>
          )}

          {/* Position, Nudge & Zoom Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] opacity-80">Nudge Position</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateSettings({ posX: Math.max(0, settings.posX - 5) });
                  }}
                  className="px-2 py-0.5 rounded border border-white/20 hover:border-[#C59B27]"
                >
                  ⬅
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateSettings({ posY: Math.max(0, settings.posY - 5) });
                  }}
                  className="px-2 py-0.5 rounded border border-white/20 hover:border-[#C59B27]"
                >
                  ⬆
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateSettings({ posY: Math.min(100, settings.posY + 5) });
                  }}
                  className="px-2 py-0.5 rounded border border-white/20 hover:border-[#C59B27]"
                >
                  ⬇
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateSettings({ posX: Math.min(100, settings.posX + 5) });
                  }}
                  className="px-2 py-0.5 rounded border border-white/20 hover:border-[#C59B27]"
                >
                  ➡
                </button>
              </div>
            </div>

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

            <div className="block">
              <span className="flex items-center justify-between text-[11px] opacity-80 mb-0.5">
                <span>Zoom ({settings.zoom}%)</span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateSettings({ zoom: Math.max(100, settings.zoom - 5) });
                    }}
                    className="px-1.5 py-0 rounded border border-white/20 hover:border-[#C59B27]"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateSettings({ zoom: Math.min(150, settings.zoom + 5) });
                    }}
                    className="px-1.5 py-0 rounded border border-white/20 hover:border-[#C59B27]"
                  >
                    +
                  </button>
                </span>
              </span>
              <input
                type="range"
                min={100}
                max={150}
                value={settings.zoom}
                onChange={(e) => updateSettings({ zoom: Number(e.target.value) })}
                className="w-full accent-[#C59B27]"
              />
            </div>
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
