"use client";

import React, { useId } from "react";

export type BrandLogoSize = "sm" | "md" | "lg" | "xl";

export interface BrandLogoProps {
  size?: BrandLogoSize;
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<BrandLogoSize, string> = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-28 w-28 sm:h-32 sm:w-32",
};

const TEXT_SIZE_CLASSES: Record<BrandLogoSize, string> = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-3xl sm:text-4xl",
  xl: "text-4xl sm:text-5xl",
};

/**
 * Learn Sikhi martial heritage emblem (Shastarvidya / Miri-Piri):
 * - Two curved Talwar swords with traditional disc-hilts crossed diagonally in the background
 * - Central circular Dhaal (shield) with ornate double-ring border, geometric inner rim, and four circular bosses
 * - Vertical Kataar (H-grip dagger) centered in the foreground
 */
export function BrandLogo({
  size = "md",
  showText = false,
  animated = false,
  className = "",
}: BrandLogoProps) {
  const uid = useId().replace(/:/g, "");
  const goldGradId = `ls-gold-${uid}`;
  const saffronGradId = `ls-saffron-${uid}`;
  const bladeGradId = `ls-blade-${uid}`;
  const shieldGradId = `ls-shield-${uid}`;

  return (
    <span
      className={`group/logo inline-flex items-center gap-3 select-none ${className}`}
    >
      <span
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-out group-hover/logo:scale-105 ${SIZE_CLASSES[size]}`}
      >
        {/* Subtle ambient saffron/gold aura on hover or when animated */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.28)_0%,rgba(197,155,39,0.12)_55%,transparent_75%)] transition-opacity duration-500 ${
            animated
              ? "opacity-90 animate-pulse"
              : "opacity-0 group-hover/logo:opacity-100"
          }`}
        />

        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Learn Sikhi emblem: crossed Talwar swords, Dhaal shield, and Kataar dagger"
          className="relative h-full w-full drop-shadow-[0_2px_10px_rgba(197,155,39,0.3)]"
        >
          <defs>
            {/* Burnished Gold to Warm Gold Gradient */}
            <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E5C158" />
              <stop offset="50%" stopColor="#C59B27" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Saffron & Burnished Gold Highlight Gradient */}
            <linearGradient id={saffronGradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C59B27" />
              <stop offset="55%" stopColor="#E5C158" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Kataar & Talwar Blade Metallic Gold-Ivory Sheen */}
            <linearGradient id={bladeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF6EE" />
              <stop offset="35%" stopColor="#E5C158" />
              <stop offset="75%" stopColor="#C59B27" />
              <stop offset="100%" stopColor="#9A7418" />
            </linearGradient>

            {/* Deep Olive Dhaal Shield Fill */}
            <radialGradient id={shieldGradId} cx="50%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#263B2D" />
              <stop offset="65%" stopColor="#1B2A20" />
              <stop offset="100%" stopColor="#111B14" />
            </radialGradient>
          </defs>

          {/* ==============================================================
              1. BACKGROUND: TWO CROSSED CURVED TALWAR SWORDS WITH DISC-HILTS
          ============================================================== */}
          <g className="transition-transform duration-500 ease-out group-hover/logo:scale-[1.02] origin-center">
            {/* Left-to-Right Curved Talwar Blade (Hilt bottom-left -> Tip top-right) */}
            <path
              d="M26 94 C44 74, 68 46, 104 14 C96 28, 72 58, 31 98 Z"
              fill={`url(#${bladeGradId})`}
              stroke="#C59B27"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Fuller blood-groove on Left-to-Right Talwar */}
            <path
              d="M30 95 C50 73, 74 46, 99 19"
              stroke="#1B2A20"
              strokeWidth="0.75"
              strokeOpacity="0.65"
              strokeLinecap="round"
            />
            {/* Disc-Hilt (Bottom-Left Talwar: Quillons, Grip, andIndo-Sikh Disc Pommel) */}
            <path
              d="M23 90 L35 102"
              stroke={`url(#${goldGradId})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M28 96 L19 105"
              stroke={`url(#${goldGradId})`}
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <ellipse
              cx="16.5"
              cy="107.5"
              rx="5.5"
              ry="2.6"
              transform="rotate(45 16.5 107.5)"
              fill={`url(#${saffronGradId})`}
              stroke="#1B2A20"
              strokeWidth="0.9"
            />
            {/* Knuckle-bow guard arc (Bottom-Left) */}
            <path
              d="M24 91 C19 95, 17 100, 20 104"
              stroke="#E5C158"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Right-to-Left Curved Talwar Blade (Hilt bottom-right -> Tip top-left) */}
            <path
              d="M94 94 C76 74, 52 46, 16 14 C24 28, 48 58, 89 98 Z"
              fill={`url(#${bladeGradId})`}
              stroke="#C59B27"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Fuller blood-groove on Right-to-Left Talwar */}
            <path
              d="M90 95 C70 73, 46 46, 21 19"
              stroke="#1B2A20"
              strokeWidth="0.75"
              strokeOpacity="0.65"
              strokeLinecap="round"
            />
            {/* Disc-Hilt (Bottom-Right Talwar: Quillons, Grip, and Disc Pommel) */}
            <path
              d="M97 90 L85 102"
              stroke={`url(#${goldGradId})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M92 96 L101 105"
              stroke={`url(#${goldGradId})`}
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <ellipse
              cx="103.5"
              cy="107.5"
              rx="5.5"
              ry="2.6"
              transform="rotate(-45 103.5 107.5)"
              fill={`url(#${saffronGradId})`}
              stroke="#1B2A20"
              strokeWidth="0.9"
            />
            {/* Knuckle-bow guard arc (Bottom-Right) */}
            <path
              d="M96 91 C101 95, 103 100, 100 104"
              stroke="#E5C158"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* ==============================================================
              2. MIDDLE: CENTRAL CIRCULAR DHAAL (SHIELD) WITH 4 BOSSES
          ============================================================== */}
          {/* Outer Shimmer / Animated Decorative Filigree Ring */}
          <g
            className={
              animated
                ? "origin-center animate-[spin_28s_linear_infinite]"
                : "origin-center transition-transform duration-700 group-hover/logo:rotate-12"
            }
          >
            <circle
              cx="60"
              cy="60"
              r="38"
              stroke={`url(#${saffronGradId})`}
              strokeWidth="1.1"
              strokeDasharray="3 3.5"
              opacity="0.85"
            />
          </g>

          {/* Dhaal Base Body (Deep Olive #1B2A20 with Burnished Gold Outer Rim) */}
          <circle
            cx="60"
            cy="60"
            r="34"
            fill={`url(#${shieldGradId})`}
            stroke={`url(#${goldGradId})`}
            strokeWidth="2.6"
          />

          {/* Ornate Second Concentric Ring Border */}
          <circle
            cx="60"
            cy="60"
            r="30.5"
            stroke="#E5C158"
            strokeWidth="0.9"
            strokeOpacity="0.7"
          />

          {/* Subtle Geometric Inner Rim (8-Pointed Floral/Octagonal Rosette) */}
          <circle
            cx="60"
            cy="60"
            r="24.5"
            stroke="#C59B27"
            strokeWidth="0.85"
            strokeDasharray="2 2"
            strokeOpacity="0.65"
          />
          <polygon
            points="60,36 69,40 77,43 80,52 84,60 80,68 77,77 69,80 60,84 51,80 43,77 40,68 36,60 40,52 43,43 51,40"
            stroke="#C59B27"
            strokeWidth="0.6"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* Four Traditional Circular Shield Bosses (Phul / Studs) */}
          {[
            { cx: 45, cy: 47 },
            { cx: 75, cy: 47 },
            { cx: 45, cy: 73 },
            { cx: 75, cy: 73 },
          ].map((boss, idx) => (
            <g key={idx}>
              <circle
                cx={boss.cx}
                cy={boss.cy}
                r="4.2"
                fill="#1B2A20"
                stroke={`url(#${goldGradId})`}
                strokeWidth="1.4"
              />
              <circle cx={boss.cx} cy={boss.cy} r="1.7" fill="#E5C158" />
            </g>
          ))}

          {/* ==============================================================
              3. FOREGROUND: VERTICAL KATAAR (H-GRIP PUNCH DAGGER)
          ============================================================== */}
          <g className="transition-transform duration-500 ease-out group-hover/logo:-translate-y-0.5">
            {/* Dark Halo Outline behind Kataar for Crisp Contrast */}
            <path
              d="M60 11 L68.5 58 H51.5 Z"
              fill="#1B2A20"
              stroke="#1B2A20"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />

            {/* Kataar Symmetrical Double-Edged Blade */}
            <path
              d="M60 12 L67.5 58 H52.5 Z"
              fill={`url(#${bladeGradId})`}
              stroke={`url(#${goldGradId})`}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            {/* Central Reinforced Blade Ridge & Fuller */}
            <line
              x1="60"
              y1="15"
              x2="60"
              y2="57"
              stroke="#1B2A20"
              strokeWidth="1.1"
              strokeOpacity="0.75"
            />
            {/* Inner Bevel Lines on Kataar Blade */}
            <path
              d="M60 22 L64 56 H56 Z"
              stroke="#FAF6EE"
              strokeWidth="0.6"
              strokeOpacity="0.6"
              fill="none"
            />

            {/* Kataar Blade Base Guard / Kothi */}
            <rect
              x="50"
              y="56.5"
              width="20"
              height="3.5"
              rx="1.5"
              fill={`url(#${saffronGradId})`}
              stroke="#1B2A20"
              strokeWidth="0.8"
            />

            {/* H-Grip Parallel Side Bars */}
            <rect
              x="51.5"
              y="59.5"
              width="3.2"
              height="29"
              rx="1.5"
              fill={`url(#${goldGradId})`}
              stroke="#1B2A20"
              strokeWidth="0.7"
            />
            <rect
              x="65.3"
              y="59.5"
              width="3.2"
              height="29"
              rx="1.5"
              fill={`url(#${goldGradId})`}
              stroke="#1B2A20"
              strokeWidth="0.7"
            />

            {/* H-Grip Twin Center Crossbars (Swelled Baluster Bars) */}
            <rect
              x="54"
              y="69.5"
              width="12"
              height="2.5"
              rx="1.2"
              fill="#E5C158"
              stroke="#1B2A20"
              strokeWidth="0.6"
            />
            <rect
              x="54"
              y="74"
              width="12"
              height="2.5"
              rx="1.2"
              fill={`url(#${saffronGradId})`}
              stroke="#1B2A20"
              strokeWidth="0.6"
            />

            {/* H-Grip Bottom Pommel Caps */}
            <circle cx="53.1" cy="89" r="2.3" fill="#E5C158" stroke="#1B2A20" strokeWidth="0.6" />
            <circle cx="66.9" cy="89" r="2.3" fill="#E5C158" stroke="#1B2A20" strokeWidth="0.6" />
          </g>
        </svg>
      </span>

      {showText && (
        <span
          className={`font-serif font-semibold tracking-wide text-charcoal dark:text-ivory ${TEXT_SIZE_CLASSES[size]}`}
        >
          Learn <span className="text-saffron">Sikhi</span>
        </span>
      )}
    </span>
  );
}

export default BrandLogo;
