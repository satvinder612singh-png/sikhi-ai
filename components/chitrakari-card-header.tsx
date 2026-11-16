"use client";

import React, { useEffect, useId } from "react";
import {
  EditableHeritageImage,
  migrateLegacyChitrakariFramesOnce,
} from "@/components/editable-heritage-image";

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

/* ============================================================================
   2. LEGACY HOOK COMPATIBILITY
============================================================================ */
type OverrideMap = Record<string, string>;
const EMPTY: OverrideMap = {};

export function useChitrakariOverrides(): OverrideMap {
  useEffect(() => {
    migrateLegacyChitrakariFramesOnce();
  }, []);
  return EMPTY;
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
  useEffect(() => {
    migrateLegacyChitrakariFramesOnce();
  }, []);

  const commons = COMMONS_ART[commonsKey ?? artKey];
  const defaultSrc = commons ? commonsUrl(commons.file, 1000) : "";

  return (
    <EditableHeritageImage
      imageKey={`chitrakari-${artKey}`}
      legacyKeys={[artKey, `matriarch-${artKey}`, `foundations-card-${artKey}`]}
      defaultSrc={defaultSrc}
      alt={commons?.caption || title}
      defaultOrientation="natural"
      defaultFit="contain-museum"
      allowUserEdit={false}
      className={className}
      fallbackNode={
        <div
          className={`relative w-full overflow-hidden rounded-xl ${heightClass}`}
          style={{
            border: "3px double var(--accent-primary)",
            boxShadow:
              "inset 0 0 0 2px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.22)",
            background: "#0B1020",
          }}
        >
          <Scene variant={variant} seed={artKey} />
        </div>
      }
    />
  );
}
