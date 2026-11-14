"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Symmetric enter + exit animation wrapper for any existing modal/drawer.
 *
 *   <AnimatedModal open={!!active}>
 *     {active && <div role="dialog" ...><div className="panel">…</div></div>}
 *   </AnimatedModal>
 *
 * The last open children are kept mounted while the exit transition runs, and
 * state flips happen inside requestAnimationFrame so the browser promotes the
 * layers to the GPU and the motion runs at the display's native refresh rate.
 * Styling lives in globals.css (.modal-anim-root, cubic-bezier(0.22, 1, 0.36, 1)).
 */
export function AnimatedModal({
  open,
  children,
  exitMs = 280,
}: {
  open: boolean;
  children: React.ReactNode;
  exitMs?: number;
}) {
  const [mounted, setMounted] = useState(open);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  const [state, setState] = useState<"open" | "closed">(open ? "open" : "closed");
  const snapshot = useRef<React.ReactNode>(children);
  if (open) snapshot.current = children;

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timer: number | undefined;

    if (open) {
      setMounted(true);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setState("open"));
      });
    } else if (mounted) {
      raf1 = requestAnimationFrame(() => setState("closed"));
      timer = window.setTimeout(() => setMounted(false), exitMs);
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exitMs]);

  // Lock background scroll only while visible
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted || !isClient) return null;

  // Portal to <body> so ancestor transforms (hover lifts, animations) can never
  // re-anchor position:fixed overlays.
  return createPortal(
    <div className="modal-anim-root" data-state={state}>
      {snapshot.current}
    </div>,
    document.body
  );
}

export default AnimatedModal;
