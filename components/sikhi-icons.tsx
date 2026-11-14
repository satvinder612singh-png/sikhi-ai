import React from "react";

export type SikhiIconName =
  | "khanda"
  | "ikonkar"
  | "rabab"
  | "dhaal"
  | "lotus-dome"
  | "scroll";

type IconProps = { size?: number; className?: string; title?: string };

const GOLD_A = "#FFD25A";
const GOLD_B = "#E59A00";
const BLUE = "#2563EB";
const BLUE_L = "#60A5FA";
const CRIMSON = "#F43F5E";
const EMERALD = "#10B981";
const IVORY = "#FFF4D6";
const INK = "#1E293B";

function Svg({
  size = 28,
  className,
  title,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
     {children}
    </svg>
  );
}


/**
 * Render ONCE near the root (see app/layout.tsx). Icons reference these shared
 * gradients; keeping them in a zero-size (not display:none) SVG guarantees they
 * resolve even when an icon lives inside a hidden menu.
 */
export function SikhiIconDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <linearGradient id="si-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD_A} />
          <stop offset="1" stopColor={GOLD_B} />
        </linearGradient>
        <linearGradient id="si-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BLUE_L} />
          <stop offset="1" stopColor={BLUE} />
        </linearGradient>
        <linearGradient id="si-crimson" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FB7185" />
          <stop offset="1" stopColor="#BE123C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
/** Golden Khanda with chakkar and twin kirpans */
export function KhandaIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 38C4 26 8 14 16 8" fill="none" stroke="url(#si-blue)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M39 38c5-12 1-24-7-30" fill="none" stroke="url(#si-blue)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 3l4.2 8.5v21L24 36l-4.2-3.5v-21z" fill="url(#si-gold)" stroke="#8A5A00" strokeWidth="0.8" />
      <path d="M24 5v29" stroke="#FFF1B8" strokeWidth="1.2" />
      <rect x="21.4" y="36" width="5.2" height="8" rx="1.2" fill="url(#si-crimson)" />
      <circle cx="24" cy="23" r="9.5" fill="none" stroke={CRIMSON} strokeWidth="3.2" />
      <circle cx="24" cy="23" r="9.5" fill="none" stroke="url(#si-gold)" strokeWidth="1.2" />
      <circle cx="24" cy="23" r="3.2" fill={EMERALD} />
    </Svg>
  );
}

/** Ik Onkar medallion */
export function IkOnkarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="24" cy="24" r="21" fill="url(#si-gold)" stroke="#8A5A00" strokeWidth="1" />
      <circle cx="24" cy="24" r="17" fill={INK} />
      <circle cx="24" cy="24" r="17" fill="none" stroke={BLUE_L} strokeWidth="1.4" strokeDasharray="2 3" />
      <text
        x="24"
        y="31.5"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill={GOLD_A}
        style={{ fontFamily: "var(--font-gurmukhi), 'Noto Sans Gurmukhi', serif" }}
      >
        ੴ
      </text>
      <circle cx="24" cy="5.5" r="1.6" fill={CRIMSON} />
      <circle cx="24" cy="42.5" r="1.6" fill={EMERALD} />
    </Svg>
  );
}

/** Rabab / Taus-style stringed instrument */
export function RababIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M33 4l7 7-3 3-3-1-8 8 1 2-4 4" fill="none" stroke="url(#si-gold)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="17" cy="31" rx="12" ry="11" transform="rotate(-35 17 31)" fill="url(#si-crimson)" stroke="#7F1233" strokeWidth="0.9" />
      <ellipse cx="17" cy="31" rx="7" ry="6.3" transform="rotate(-35 17 31)" fill={IVORY} opacity="0.92" />
      <circle cx="17" cy="31" r="2.3" fill={INK} />
      <path d="M22 26L34 14M24 29L37 16" stroke={BLUE} strokeWidth="1" />
      <circle cx="38" cy="9" r="2" fill={EMERALD} />
    </Svg>
  );
}

/** Dhaal (shield) with chakkar boss */
export function DhaalIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="24" cy="24" r="21" fill="url(#si-blue)" stroke="#1E3A8A" strokeWidth="1" />
      <circle cx="24" cy="24" r="16" fill="none" stroke="url(#si-gold)" strokeWidth="3" />
      <circle cx="24" cy="24" r="10" fill={INK} stroke={GOLD_A} strokeWidth="1" />
      <circle cx="24" cy="24" r="5" fill="url(#si-crimson)" />
      <circle cx="24" cy="24" r="1.6" fill={GOLD_A} />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <circle
          key={deg}
          cx={24 + 18.5 * Math.cos((deg * Math.PI) / 180)}
          cy={24 + 18.5 * Math.sin((deg * Math.PI) / 180)}
          r="1.7"
          fill={EMERALD}
        />
      ))}
    </Svg>
  );
}

/** Lotus beneath the Darbar Sahib dome */
export function LotusDomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M24 3v4" stroke={GOLD_B} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 22c0-9 6-14 14-14s14 5 14 14z" fill="url(#si-gold)" stroke="#8A5A00" strokeWidth="0.9" />
      <rect x="10" y="22" width="28" height="5" fill={IVORY} stroke="#C59B27" strokeWidth="0.6" />
      <path d="M24 44c-7-1-11-6-12-12 5 0 9 3 12 8 3-5 7-8 12-8-1 6-5 11-12 12z" fill={CRIMSON} />
      <path d="M24 44c-3-3-5-7-5-12 3 1 5 4 5 7 0-3 2-6 5-7 0 5-2 9-5 12z" fill="#FDA4AF" />
      <path d="M4 36q5-3 8 0t8 0 8 0 8 0 8 0" fill="none" stroke={BLUE_L} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="24" cy="15" r="2.4" fill={EMERALD} />
    </Svg>
  );
}

/** Illustrated scroll (pothi) */
export function ScrollIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9" y="6" width="30" height="36" rx="3" fill={IVORY} stroke="#C59B27" strokeWidth="1.4" />
      <rect x="6" y="4" width="36" height="5" rx="2.5" fill="url(#si-gold)" />
      <rect x="6" y="39" width="36" height="5" rx="2.5" fill="url(#si-gold)" />
      <path d="M14 15h20M14 20h20M14 25h14" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 30h20" stroke={CRIMSON} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="32" cy="26" r="2.2" fill={EMERALD} />
    </Svg>
  );
}

const MAP: Record<SikhiIconName, (p: IconProps) => React.ReactElement> = {
  khanda: KhandaIcon,
  ikonkar: IkOnkarIcon,
  rabab: RababIcon,
  dhaal: DhaalIcon,
  "lotus-dome": LotusDomeIcon,
  scroll: ScrollIcon,
};

export function SikhiIcon({ name, ...rest }: IconProps & { name: SikhiIconName }) {
  const Cmp = MAP[name];
  return <Cmp {...rest} />;
}

