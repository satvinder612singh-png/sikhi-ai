"use client";

import React, { useEffect, useRef } from "react";

/**
 * Scroll-reactive ambient canvas.
 * - One passive scroll listener writes to a ref; a single requestAnimationFrame
 *   per scroll burst applies translate3d to a handful of GPU layers.
 * - No React state, no layout reads inside the frame, transform/opacity only,
 *   so it stays in lockstep with the display refresh rate (60/120/144/240Hz).
 */

const GLYPHS: { ch: string; x: number; y: number; size: number; speed: number; rot: number; dur: number }[] = [
  { ch: "ੴ", x: 6, y: 12, size: 150, speed: 0.12, rot: -6, dur: 18 },
  { ch: "ੳ", x: 84, y: 22, size: 120, speed: 0.2, rot: 8, dur: 22 },
  { ch: "੧", x: 72, y: 62, size: 140, speed: 0.08, rot: -4, dur: 20 },
  { ch: "ਖ", x: 12, y: 70, size: 110, speed: 0.16, rot: 5, dur: 24 },
  { ch: "ਸ", x: 46, y: 38, size: 90, speed: 0.26, rot: -9, dur: 26 },
];

const ORBS: { x: number; y: number; size: number; speed: number; color: string }[] = [
  { x: 8, y: 18, size: 520, speed: 0.1, color: "var(--accent-primary)" },
  { x: 78, y: 48, size: 620, speed: 0.18, color: "var(--vivid-blue, #3B82F6)" },
  { x: 38, y: 82, size: 460, speed: 0.06, color: "var(--vivid-crimson, #F43F5E)" },
];

export function AmbientBackground() {
  const layersRef = useRef<(HTMLElement | null)[]>([]);
  const speedsRef = useRef<number[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let ticking = false;
    let lastY = -1;
    let raf = 0;

    const apply = () => {
      ticking = false;
      const y = window.scrollY;
      if (y === lastY) return;
      lastY = y;
      const layers = layersRef.current;
      const speeds = speedsRef.current;
      for (let i = 0; i < layers.length; i++) {
        const el = layers[i];
        if (!el) continue;
        el.style.transform = `translate3d(0, ${(-y * speeds[i]).toFixed(1)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  let idx = 0;
  speedsRef.current = [];
  const register = (speed: number) => {
    const i = idx++;
    speedsRef.current[i] = speed;
    return (el: HTMLElement | null) => {
      layersRef.current[i] = el;
    };
  };

  return (
    <div
      aria-hidden="true"
      className="ambient-layer pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity: "var(--ambient-opacity, 0.2)" }}
    >
      {/* Soft parallax light orbs */}
      {ORBS.map((o, i) => (
        <div
          key={`orb-${i}`}
          ref={register(o.speed)}
          className="ambient-gpu absolute rounded-full"
          style={{
            left: `${o.x}%`,
            top: `${o.y}%`,
            width: o.size,
            height: o.size,
            marginLeft: -o.size / 2,
            marginTop: -o.size / 2,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 68%)`,
            opacity: 0.62,
          }}
        />
      ))}

      {/* Floating golden Gurmukhi calligraphic geometry */}
      {GLYPHS.map((g, i) => (
        <div
          key={`glyph-${i}`}
          ref={register(g.speed)}
          className="ambient-gpu absolute"
          style={{ left: `${g.x}%`, top: `${g.y}%` }}
        >
          <span
            lang="pa"
            className="ambient-float font-gurmukhi block select-none"
            style={
              {
                fontSize: g.size,
                lineHeight: 1,
                color: "var(--accent-primary)",
                "--rot": `${g.rot}deg`,
                "--dur": `${g.dur}s`,
              } as React.CSSProperties
            }
          >
            {g.ch}
          </span>
        </div>
      ))}

      {/* Crisp Darbar arch, celestial meridian & Phulkari lattice watermarks */}
      <div ref={register(0.05)} className="ambient-gpu absolute inset-x-0 top-0">
        <svg
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMin slice"
          className="w-full h-[140vh]"
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="1.75"
        >
          <path d="M120 780V420a110 110 0 0 1 220 0v360M150 780V425a80 80 0 0 1 160 0v355" strokeOpacity="0.85" />
          <path d="M860 780V380a140 140 0 0 1 280 0v400M892 780V385a108 108 0 0 1 216 0v395" strokeOpacity="0.85" />
          {/* Subtle golden meridian compass ring */}
          <g strokeOpacity="0.65">
            <circle cx="600" cy="240" r="148" strokeDasharray="6 8" />
            <ellipse cx="600" cy="240" rx="72" ry="148" />
            <ellipse cx="600" cy="240" rx="148" ry="48" />
          </g>
          <g opacity="0.9">
            <path d="M600 72l36 36-36 36-36-36zM600 90l18 18-18 18-18-18z" />
            <path d="M680 180l28 28-28 28-28-28zM520 180l28 28-28 28-28-28z" />
            <circle cx="600" cy="108" r="6" fill="var(--accent-primary)" fillOpacity="0.45" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default AmbientBackground;
