"use client";

import React from "react";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Centered Learn Sikhi emblem watermark background.
 * Displays the Learn Sikhi logo in the center of the viewport with the
 * "Learn Sikhi" wordmark directly below it at a whisper-quiet opacity so
 * Light (#FAF8F5), Dark (#0F1115), and OLED (#000000) readability stays crisp.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 flex flex-col items-center justify-center overflow-hidden select-none"
    >
      <div className="flex flex-col items-center justify-center gap-3 opacity-[0.045] dark:opacity-[0.06] scale-125 sm:scale-150">
        <BrandLogo size="xl" />
        <span
          style={{ color: "var(--text-primary)" }}
          className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.14em] uppercase"
        >
          Learn <span style={{ color: "var(--accent-primary)" }}>Sikhi</span>
        </span>
      </div>
    </div>
  );
}
