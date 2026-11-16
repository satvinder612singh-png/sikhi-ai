"use client";

import React from "react";
import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
} from "framer-motion";
import { usePathname } from "next/navigation";
import {
  useCmsSiteState,
  type CmsPageTransition,
} from "@/components/editable-heritage-image";

const ROUTE_TRANSITION_EASE: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

interface RouteAnimationPreset {
  initial: TargetAndTransition | false;
  animate: TargetAndTransition;
  duration: number;
}

const ROUTE_ANIMATION_MAP: Record<CmsPageTransition, RouteAnimationPreset> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    duration: 0.6,
  },
  "slide-up": {
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    duration: 0.6,
  },
  "scale-zoom": {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    duration: 0.6,
  },
  "blur-reveal": {
    initial: { filter: "blur(10px)", opacity: 0 },
    animate: {
      filter: "blur(0px)",
      opacity: 1,
      transitionEnd: { filter: "none" },
    },
    duration: 0.6,
  },
  none: {
    initial: false,
    animate: { opacity: 1 },
    duration: 0,
  },
};

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cms = useCmsSiteState();
  const prefersReducedMotion = useReducedMotion();

  const rawChoice = cms.layoutConfig?.pageTransition;
  const transitionKey: CmsPageTransition = prefersReducedMotion
    ? "none"
    : rawChoice && rawChoice in ROUTE_ANIMATION_MAP
      ? rawChoice
      : "fade";

  const preset = ROUTE_ANIMATION_MAP[transitionKey];

  return (
    <motion.div
      key={pathname}
      initial={preset.initial}
      animate={preset.animate}
      transition={{
        ease: ROUTE_TRANSITION_EASE,
        duration: preset.duration,
      }}
    >
      {children}
    </motion.div>
  );
}
