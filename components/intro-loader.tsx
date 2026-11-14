"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/brand-logo";

export default function IntroLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("sikhi_ai_intro_seen");
    if (hasSeenIntro) {
      setIsVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("sikhi_ai_intro_seen", "true");
    }, 3400);

    return () => clearTimeout(timer);
  }, []);

  const skipIntro = () => {
    setIsVisible(false);
    sessionStorage.setItem("sikhi_ai_intro_seen", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="intro-curtain"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
          onClick={skipIntro}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1B2A20] text-[#FAF6EE] cursor-pointer overflow-hidden"
        >
          {/* Ambient Gold & Saffron Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,155,39,0.22)_0%,rgba(217,119,6,0.08)_40%,transparent_70%)]" />

          {/* Decorative Arch SVG Frame */}
          <motion.svg
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute w-[340px] h-[460px] md:w-[460px] md:h-[580px] stroke-[#C59B27]"
            viewBox="0 0 200 260"
            fill="none"
          >
            <motion.path
              d="M10 250 V110 C10 50 100 10 100 10 C100 10 190 50 190 110 V250 Z"
              strokeWidth="1.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            />
            <motion.path
              d="M20 242 V114 C20 60 100 22 100 22 C100 22 180 60 180 114 V242 Z"
              strokeWidth="0.5"
              strokeDasharray="3 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </motion.svg>

          {/* Central Brand Emblem & Gurmukhi Invocation */}
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2 }}
            className="relative z-10 flex flex-col items-center text-center px-6"
          >
            <div className="mb-3">
              <BrandLogo size="xl" animated={true} />
            </div>

            <div
              lang="pa"
              className="font-gurmukhi text-4xl md:text-5xl text-[#E5C158] drop-shadow-[0_0_20px_rgba(197,155,39,0.45)] mb-2"
            >
              ੴ
            </div>

            <motion.p
              lang="pa"
              initial={{ opacity: 0, letterSpacing: "0.05em" }}
              animate={{ opacity: 1, letterSpacing: "0.18em" }}
              transition={{ duration: 1.4, delay: 0.7 }}
              className="font-gurmukhi text-lg md:text-xl text-[#E5C158] font-medium"
            >
              ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ
            </motion.p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "180px" }}
              transition={{ duration: 1.2, delay: 1.0 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#C59B27] to-transparent mx-auto my-5"
            />

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="text-2xl md:text-3xl font-serif tracking-wide text-[#FAF6EE]"
            >
              LEARN <span className="text-[#E5C158]">SIKHI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 1, delay: 1.7 }}
              className="mt-2 text-xs md:text-sm text-[#F3ECE0]/80 max-w-md mx-auto italic"
            >
              Explore the depths of Sikhi.
            </motion.p>
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            transition={{ delay: 2.2 }}
            className="absolute bottom-8 text-xs tracking-widest uppercase text-[#E5C158]"
          >
            Click anywhere to enter
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
