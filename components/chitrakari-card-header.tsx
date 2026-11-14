"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatedModal } from "@/components/animated-modal";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/* ============================================================================
   1. VERIFIED PUBLIC-DOMAIN SIKH PAINTINGS (Wikimedia Commons file names)
   Each entry was confirmed to exist on Commons. Images are loaded through
   Special:FilePath and fall back to the generated oil-style illustration if
   unreachable. Always confirm the licence on the linked file page.
============================================================================ */
export const COMMONS_ART: Record<string, { file: string; caption: string }> = {
  "guru-nanak": {
    file: "Painting of Guru Nanak, Mardana, and Bala.jpg",
    caption: "Guru Nanak with Bhai Mardana & Bhai Bala",
  },
  "guru-gobind-singh": {
    file: "Miniature painting of Guru Gobind Singh on horseback, Punjab Plains, mid-19th century.jpg",
    caption: "Guru Gobind Singh Ji on horseback, mid-19th c.",
  },
  "mai-bhago": {
    file: "Detail from a painting showing Mai Bhago in the Battle of Muktsar, Sikh school, Punjab Plains, late 19th century.jpg",
    caption: "Mai Bhago at the Battle of Muktsar, late 19th c.",
  },
  "maharani-jind-kaur": {
    file: "Maharani Jind Kaur.jpg",
    caption: "Maharani Jind Kaur",
  },
  "darbar-sahib": {
    file: "Painting of the Golden Temple, Amritsar, circa late-19th century.png",
    caption: "Sri Harmandir Sahib, late 19th c.",
  },
  "panj-pyare": {
    file: "Painting of the establishment of the Khalsa order and Panj Piare institution by Guru Gobind Singh and Mata Jito at Anandpur in 1699, circa 19th century.jpg",
    caption: "Founding of the Khalsa & the Panj Pyare, Anandpur 1699",
  },
  "baba-deep-singh": {
    file: "Painting of the Sikh martyr Baba Deep Singh, attributed to Gian Singh 'Naqqash', probably Amritsar, circa early 20th century.jpg",
    caption: "Baba Deep Singh Ji, attributed to Gian Singh Naqqash",
  },
  "guru-arjan": {
    file: "Guru Arjan painting.jpg",
    caption: "Guru Arjan Dev Ji",
  },
  "guru-tegh-bahadur": {
    file: "Portrait of Guru Tegh Bahadur by painter Ahsan.jpg",
    caption: "Guru Tegh Bahadur Ji, portrait by Ahsan",
  },
};

const commonsUrl = (file: string, width = 900) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
const commonsPage = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

/* ============================================================================
   2. COMMUNITY OVERRIDES (localStorage + Supabase public.chitrakari_artworks)
============================================================================ */
const STORAGE_KEY = "learnsikhi_chitrakari_v1";
type OverrideMap = Record<string, string>;
const EMPTY: OverrideMap = {};

let overrides: OverrideMap = EMPTY;
let remoteApproved: OverrideMap = EMPTY;
let localOverrides: OverrideMap = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  overrides = { ...remoteApproved, ...localOverrides };
  listeners.forEach((l) => l());
}

function loadOnce() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) localOverrides = JSON.parse(raw) as OverrideMap;
  } catch {
    localOverrides = EMPTY;
  }
  emit();

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    supabase
      .from("chitrakari_artworks")
      .select("artwork_key,image_url,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .limit(300)
      .then(({ data }) => {
        if (!Array.isArray(data)) return;
        const map: OverrideMap = {};
        data.forEach((row: Record<string, unknown>) => {
          map[String(row.artwork_key)] = String(row.image_url);
        });
        remoteApproved = map;
        emit();
      });
  }
}

function subscribe(cb: () => void) {
  loadOnce();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useChitrakariOverrides(): OverrideMap {
  return useSyncExternalStore(
    subscribe,
    () => overrides,
    () => EMPTY
  );
}

async function saveOverride(artKey: string, imageUrl: string | null, contributor: string) {
  const next = { ...localOverrides };
  if (imageUrl) next[artKey] = imageUrl;
  else delete next[artKey];
  localOverrides = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota — keep in memory for this session */
  }
  emit();

  const supabase = getSupabaseBrowserClient();
  if (supabase && imageUrl) {
    try {
      await supabase.from("chitrakari_artworks").insert({
        artwork_key: artKey,
        image_url: imageUrl,
        contributor_name: contributor,
        status: "pending_review",
      });
    } catch {
      /* local copy already saved */
    }
  }
}

function fileToScaledDataUrl(file: File, maxSide = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/* ============================================================================
   3. LAYERED OIL-STYLE SVG SCENES (original illustrations, used as defaults)
============================================================================ */
export type ChitrakariVariant =
  | "darbar"
  | "anandpur"
  | "guru"
  | "woman"
  | "warrior"
  | "child"
  | "horse"
  | "manuscript"
  | "board"
  | "khanda";

type Palette = { sky1: string; sky2: string; ground: string; cloth: string; turban: string; accent: string };

const PALETTES: Palette[] = [
  { sky1: "#1E3A8A", sky2: "#F59E0B", ground: "#0F3D2E", cloth: "#BE123C", turban: "#F8FAFC", accent: "#FFD25A" },
  { sky1: "#4C1D95", sky2: "#FB7185", ground: "#1E293B", cloth: "#2563EB", turban: "#FDE68A", accent: "#FFC933" },
  { sky1: "#064E3B", sky2: "#FCD34D", ground: "#14301F", cloth: "#7C2D12", turban: "#FFF7ED", accent: "#FFB800" },
  { sky1: "#7F1D1D", sky2: "#FDBA74", ground: "#2A1608", cloth: "#1D4ED8", turban: "#E0F2FE", accent: "#FFD25A" },
  { sky1: "#0C4A6E", sky2: "#FDE68A", ground: "#112B3C", cloth: "#047857", turban: "#FFFBEB", accent: "#FFC933" },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function Scene({ variant, seed }: { variant: ChitrakariVariant; seed: string }) {
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9]/g, "");
  const p = PALETTES[hash(seed) % PALETTES.length];
  const skin = "#C98E5A";

  const portrait = (kind: "guru" | "woman" | "warrior" | "child") => {
    const faceRy = kind === "child" ? 34 : 42;
    const faceY = kind === "child" ? 140 : 118;
    return (
      <g>
        <path d="M170 280V130a150 150 0 0 1 300 0V280z" fill="rgba(0,0,0,0.28)" stroke={p.accent} strokeWidth="3" />
        <circle cx="320" cy={faceY - 6} r="88" fill={`url(#${id}halo)`} />
        <path d="M190 280C200 208 250 190 320 190S440 208 450 280z" fill={p.cloth} />
        <path d="M292 192l28 46 28-46z" fill="#FFF4D6" />
        {kind === "woman" ? (
          <>
            <path d="M268 132C256 52 384 52 372 132C376 190 414 214 446 262H194C226 214 264 190 268 132z" fill={p.cloth} stroke={p.accent} strokeWidth="2" />
            <path d="M268 132C256 52 384 52 372 132" fill="none" stroke={p.accent} strokeWidth="4" opacity="0.8" />
          </>
        ) : null}
        <rect x="305" y={faceY + 28} width="30" height="30" fill={skin} />
        <ellipse cx="320" cy={faceY} rx="34" ry={faceRy} fill={skin} />
        {kind !== "woman" && kind !== "child" ? (
          <path d="M287 124C289 178 351 178 353 124C341 152 299 152 287 124z" fill={kind === "guru" ? "#E5E7EB" : "#1F1612"} />
        ) : null}
        {kind === "child" ? (
          <path d="M286 112C288 64 352 64 354 112C340 96 300 96 286 112z" fill={p.turban} />
        ) : kind !== "woman" ? (
          <>
            <ellipse cx="320" cy="78" rx="54" ry="32" fill={kind === "warrior" ? "#1D4ED8" : p.turban} />
            <path d="M270 80C300 56 340 56 370 80M274 92C304 68 336 68 366 92" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="3" />
            {kind === "warrior" ? <circle cx="320" cy="70" r="9" fill="none" stroke={p.accent} strokeWidth="3" /> : null}
          </>
        ) : null}
        <path d="M302 112l12 2M326 114l12-2" stroke="#2B1B10" strokeWidth="3" strokeLinecap="round" />
        <path d="M312 138q8 5 16 0" stroke="#7A3E22" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    );
  };

  const scene = (() => {
    switch (variant) {
      case "darbar":
        return (
          <g>
            <circle cx="470" cy="70" r="34" fill="#FFF1B8" opacity="0.9" />
            <rect y="150" width="640" height="130" fill={`url(#${id}water)`} />
            <path d="M0 150h640" stroke={p.accent} strokeWidth="2" opacity="0.6" />
            <rect x="240" y="120" width="160" height="40" fill="#FFF4D6" />
            <path d="M255 120a65 70 0 0 1 130 0z" fill={`url(#${id}gold)`} />
            <path d="M320 40v-16" stroke={p.accent} strokeWidth="4" />
            {[260, 292, 324, 356].map((x) => (
              <path key={x} d={`M${x} 160v-28a12 14 0 0 1 24 0v28`} fill="rgba(0,0,0,0.35)" />
            ))}
            <path d="M320 160v120" stroke="#FFF4D6" strokeWidth="26" opacity="0.5" />
            <g opacity="0.45" transform="translate(0 310) scale(1 -1)">
              <path d="M255 120a65 70 0 0 1 130 0z" fill={p.accent} />
            </g>
          </g>
        );
      case "anandpur":
        return (
          <g>
            <circle cx="140" cy="86" r="34" fill="#FFF1B8" opacity="0.92" />
            <path d="M0 190L120 110L220 170L330 90L450 168L560 100L640 160V280H0z" fill={p.ground} opacity="0.75" />
            <path d="M0 230L90 170L200 220L320 150L430 215L560 160L640 210V280H0z" fill={p.ground} />
            <rect x="250" y="170" width="140" height="70" fill="#E7C98B" stroke="#8A5A00" strokeWidth="2" />
            {[262, 292, 322, 352, 372].map((x) => (
              <rect key={x} x={x} y="160" width="14" height="14" fill="#E7C98B" stroke="#8A5A00" />
            ))}
            <path d="M320 170v-96" stroke="#E5E7EB" strokeWidth="4" />
            <path d="M320 76l58 18-58 18z" fill="#1D4ED8" stroke={p.accent} strokeWidth="2" />
          </g>
        );
      case "horse":
        return (
          <g>
            <circle cx="520" cy="80" r="30" fill="#FFF1B8" opacity="0.9" />
            <path d="M0 200C120 150 220 210 330 170S540 160 640 200V280H0z" fill={p.ground} />
            <ellipse cx="320" cy="190" rx="92" ry="34" fill="#F8FAFC" />
            <path d="M236 200l-6 62M268 218l-4 48M368 218l4 48M398 200l6 62" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
            <path d="M396 176C428 150 442 138 448 112l24 12-10 30c-4 16-26 34-54 34z" fill="#F8FAFC" />
            <path d="M230 186C204 176 190 188 186 214" fill="none" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
            <rect x="296" y="124" width="48" height="62" rx="18" fill={p.cloth} />
            <circle cx="320" cy="104" r="17" fill={skin} />
            <ellipse cx="320" cy="90" rx="24" ry="14" fill="#1D4ED8" />
            <path d="M348 150L470 40" stroke="#E5E7EB" strokeWidth="4" />
            <path d="M470 40l44 10-30 22z" fill={p.accent} />
          </g>
        );
      case "manuscript":
        return (
          <g>
            <path d="M120 232L320 202l200 30V96L320 70 120 96z" fill="rgba(0,0,0,0.35)" />
            <path d="M130 84C210 68 270 76 320 100C370 76 430 68 510 84V214C430 198 370 204 320 224C270 204 210 198 130 214z" fill="#FFF4D6" stroke="#8A5A00" strokeWidth="3" />
            <path d="M320 100V224" stroke="#8A5A00" strokeWidth="3" />
            {[110, 130, 150, 170, 190].map((y, i) => (
              <g key={y} stroke={i % 2 ? "#1D4ED8" : "#7F1233"} strokeWidth="3" strokeLinecap="round" opacity="0.85">
                <path d={`M160 ${y}H296`} />
                <path d={`M344 ${y}H480`} />
              </g>
            ))}
            <circle cx="320" cy="58" r="14" fill={`url(#${id}gold)`} />
          </g>
        );
      case "board":
        return (
          <g>
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 6 }).map((__, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={170 + c * 50}
                  y={-10 + r * 50}
                  width="50"
                  height="50"
                  fill={(r + c) % 2 ? p.cloth : "#FFF4D6"}
                  opacity="0.92"
                />
              ))
            )}
            <circle cx="345" cy="115" r="22" fill={`url(#${id}gold)`} stroke="#7A4B00" strokeWidth="2" />
            <path d="M345 98v34M334 112h22" stroke="#7A4B00" strokeWidth="3" />
            <circle cx="245" cy="65" r="18" fill="#1D4ED8" stroke="#E5E7EB" strokeWidth="2" />
          </g>
        );
      case "khanda":
        return (
          <g>
            {Array.from({ length: 16 }).map((_, i) => (
              <path
                key={i}
                d="M320 140L306 -20h28z"
                fill={p.accent}
                opacity="0.16"
                transform={`rotate(${i * 22.5} 320 140)`}
              />
            ))}
            <circle cx="320" cy="140" r="70" fill="none" stroke={p.cloth} strokeWidth="14" />
            <circle cx="320" cy="140" r="70" fill="none" stroke={`url(#${id}gold)`} strokeWidth="4" />
            <path d="M320 22l22 46v140l-22 18-22-18V68z" fill={`url(#${id}gold)`} stroke="#8A5A00" strokeWidth="2" />
            <path d="M246 214C214 160 232 100 270 72M394 214C426 160 408 100 370 72" fill="none" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" />
          </g>
        );
      default:
        return portrait(variant);
    }
  })();

  return (
    <svg
      viewBox="0 0 640 280"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky1} />
          <stop offset="1" stopColor={p.sky2} />
        </linearGradient>
        <linearGradient id={`${id}water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="1" stopColor={p.sky1} />
        </linearGradient>
        <linearGradient id={`${id}gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE08A" />
          <stop offset="1" stopColor="#D68A00" />
        </linearGradient>
        <radialGradient id={`${id}halo`}>
          <stop offset="0" stopColor="#FFE9A0" stopOpacity="0.95" />
          <stop offset="0.6" stopColor={p.accent} stopOpacity="0.4" />
          <stop offset="1" stopColor={p.accent} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}paint`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
        </filter>
        <filter id={`${id}weave`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" result="t" />
          <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0 0.05  0 0 0 0.6 0" />
        </filter>
        <radialGradient id={`${id}vig`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width="640" height="280" fill={`url(#${id}sky)`} />
      <g filter={`url(#${id}paint)`}>{scene}</g>
      <rect width="640" height="280" filter={`url(#${id}weave)`} opacity="0.38" />
      <rect width="640" height="280" fill={`url(#${id}vig)`} />
    </svg>
  );
}

/* ============================================================================
   4. CARD HEADER (framed painting + credit + upload control)
============================================================================ */
export function ChitrakariCardHeader({
  artKey,
  variant = "guru",
  title,
  heightClass = "h-40",
  editable = false,
  compact = false,
  commonsKey,
  className = "",
}: {
  artKey: string;
  variant?: ChitrakariVariant;
  title: string;
  heightClass?: string;
  editable?: boolean;
  compact?: boolean;
  commonsKey?: string;
  className?: string;
}) {
  const store = useChitrakariOverrides();
  const override = store[artKey];
  const commons = COMMONS_ART[commonsKey ?? artKey];
  const [overrideFailed, setOverrideFailed] = useState(false);
  const [commonsFailed, setCommonsFailed] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  useEffect(() => setOverrideFailed(false), [override]);

  const showOverride = !!override && !overrideFailed;
  const showCommons = !showOverride && !!commons && !commonsFailed;

  return (
    <>
      <figure
        className={`relative m-0 w-full overflow-hidden rounded-xl ${heightClass} ${className}`}
        style={{
          border: "3px double var(--accent-primary)",
          boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.22)",
          background: "#0B1020",
        }}
      >
        {showOverride ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={override}
            alt={`${title} — community painting`}
            loading="lazy"
            decoding="async"
            onError={() => setOverrideFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : showCommons ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={commonsUrl(commons.file)}
            alt={commons.caption}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setCommonsFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <Scene variant={variant} seed={artKey} />
        )}

        {/* Caption + credit */}
        <figcaption
          className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-3 pb-2 pt-8"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.86), rgba(0,0,0,0))" }}
        >
          <span className="text-[11px] font-semibold leading-tight text-white">
            {showOverride
              ? "Community Chitrakari"
              : showCommons
              ? (
                <>
                  {commons.caption}{" "}
                  <a
                    href={commonsPage(commons.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: "#FFD25A" }}
                  >
                    Wikimedia Commons ↗
                  </a>
                </>
              )
              : "Chitrakari-style illustration"}
          </span>

          {editable && (
            <button
              type="button"
              onClick={() => setUploaderOpen(true)}
              aria-label={`Add custom painting or Chitrakari for ${title}`}
              title="Add Custom Painting / Chitrakari"
              className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold"
              style={{ background: "#FFB800", color: "#000" }}
            >
              {compact ? "🎨 Add Painting" : "🎨 Add Custom Painting / Chitrakari"}
            </button>
          )}
        </figcaption>
      </figure>

      {editable && (
        <ChitrakariUploader
          open={uploaderOpen}
          onClose={() => setUploaderOpen(false)}
          artKey={artKey}
          title={title}
          hasOverride={!!override}
        />
      )}
    </>
  );
}

/* ============================================================================
   5. UPLOADER MODAL (file upload or pasted URL → localStorage + Supabase)
============================================================================ */
function ChitrakariUploader({
  open,
  onClose,
  artKey,
  title,
  hasOverride,
}: {
  open: boolean;
  onClose: () => void;
  artKey: string;
  title: string;
  hasOverride: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [contributor, setContributor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const reset = useCallback(() => {
    setPreview(null);
    setUrlInput("");
    setError(null);
  }, []);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WebP).");
      return;
    }
    try {
      setError(null);
      setPreview(await fileToScaledDataUrl(file));
    } catch {
      setError("That image could not be read. Try another file.");
    }
  };

  const onUrl = (value: string) => {
    setUrlInput(value);
    setError(null);
    if (!value.trim()) return setPreview(null);
    if (/^https:\/\/\S+$/i.test(value.trim())) setPreview(value.trim());
    else setPreview(null);
  };

  const save = async () => {
    if (!preview) {
      setError("Add an image file or paste a valid https:// artwork URL first.");
      return;
    }
    setSaving(true);
    await saveOverride(artKey, preview, contributor.trim() || "Sangat contributor");
    setSaving(false);
    reset();
    onClose();
  };

  const clear = async () => {
    await saveOverride(artKey, null, "");
    reset();
    onClose();
  };

  return (
    <AnimatedModal open={open}>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Add custom painting for ${title}`}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="my-6 w-full max-w-lg space-y-4 rounded-3xl border-2 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                  Chitrakari Contribution
                </span>
                <h3 className="font-serif text-xl font-bold">{title}</h3>
                <p style={{ color: "var(--theme-text-muted)" }} className="text-xs leading-relaxed">
                  Upload your own painting or paste a link to an artwork you have the right to share.
                  It appears for you immediately and is sent for review before it is shown to everyone.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#C59B27]/45 px-3 py-1.5 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#C59B27]/45 bg-black/40">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="h-full w-full object-cover" onError={() => setError("That link did not load as an image.")} />
              ) : (
                <div className="flex h-full items-center justify-center text-xs" style={{ color: "var(--theme-text-muted)" }}>
                  Preview appears here
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-2 text-xs font-bold"
              >
                Upload Image File
              </button>
              {hasOverride && (
                <button type="button" onClick={() => void clear()} className="rounded-xl border border-[#C59B27]/45 px-4 py-2 text-xs font-bold">
                  Remove my painting
                </button>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold">…or paste an artwork URL (https only)</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => onUrl(e.target.value)}
                placeholder="https://…/painting.jpg"
                style={{ backgroundColor: "var(--bg-primary)" }}
                className="w-full rounded-xl border px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold">Artist / contributor name (optional)</label>
              <input
                type="text"
                value={contributor}
                onChange={(e) => setContributor(e.target.value)}
                style={{ backgroundColor: "var(--bg-primary)" }}
                className="w-full rounded-xl border px-3.5 py-2 text-sm"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--vivid-crimson, #F43F5E)", color: "var(--text-primary)" }}>
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-[#C59B27]/30 pt-3">
              <button type="button" onClick={onClose} className="rounded-xl border border-[#C59B27]/45 px-4 py-2 text-xs font-bold">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-2 text-xs font-bold disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Painting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedModal>
  );
}

