"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const SPARKS = [
  { id: 1, x: -110, y: -64, rotate: -38, color: "#D4AF37", size: 8, delay: 0 },
  { id: 2, x: -72, y: -92, rotate: 24, color: "#10B981", size: 7, delay: 0.04 },
  { id: 3, x: -28, y: -102, rotate: -18, color: "#F59E0B", size: 9, delay: 0.02 },
  { id: 4, x: 24, y: -104, rotate: 32, color: "#D4AF37", size: 8, delay: 0.05 },
  { id: 5, x: 74, y: -88, rotate: -26, color: "#34D399", size: 7, delay: 0.03 },
  { id: 6, x: 112, y: -60, rotate: 42, color: "#F59E0B", size: 8, delay: 0.06 },
  { id: 7, x: -94, y: -22, rotate: 50, color: "#34D399", size: 6, delay: 0.07 },
  { id: 8, x: 96, y: -18, rotate: -48, color: "#D4AF37", size: 6, delay: 0.08 },
  { id: 9, x: -48, y: -56, rotate: 14, color: "#FBBF24", size: 7, delay: 0.09 },
  { id: 10, x: 52, y: -54, rotate: -16, color: "#10B981", size: 7, delay: 0.1 },
];

export function CelebrationBurst({ active }: { active: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  if (!active) return null;

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto h-1.5 w-28 rounded-full bg-gradient-to-r from-[#C59B27] via-[#10B981] to-[#D97706] opacity-90"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mx-auto h-8 w-full max-w-sm overflow-visible flex items-center justify-center"
    >
      {/* Soft golden celebratory halo */}
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.55, 0], scale: [0.5, 1.45, 1.7] }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute h-20 w-44 rounded-full bg-gradient-to-r from-[#C59B27]/35 via-[#10B981]/30 to-[#D97706]/35 blur-xl"
      />

      {/* Delicate GPU-composited confetti particles */}
      {SPARKS.map((spark) => (
        <motion.span
          key={spark.id}
          initial={{ opacity: 0, x: 0, y: 12, scale: 0.4, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0.9, 0],
            x: spark.x,
            y: spark.y,
            scale: [0.4, 1.1, 0.95, 0.6],
            rotate: spark.rotate,
          }}
          transition={{
            duration: 1.05,
            delay: spark.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            width: spark.size,
            height: spark.size * 0.65,
            backgroundColor: spark.color,
          }}
          className="absolute rounded-full"
        />
      ))}
    </div>
  );
}
