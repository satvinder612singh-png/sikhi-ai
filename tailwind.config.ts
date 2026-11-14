import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#FAF6EE",
          warm: "#FAF6EE",
          parchment: "#F3ECE0",
        },
        parchment: {
          DEFAULT: "#F3ECE0",
          dark: "#E6DEC8",
        },
        olive: {
          DEFAULT: "#1B2A20",
          deep: "#1B2A20",
          dark: "#121C15",
          light: "#263B2D",
          muted: "#4A554E",
        },
        charcoal: {
          DEFAULT: "#171917",
          muted: "#4A554E",
        },
        saffron: {
          DEFAULT: "#D97706",
          light: "#F59E0B",
          dark: "#B45309",
        },
        midnight: {
          950: "#121C15",
          900: "#1B2A20",
          800: "#213327",
          700: "#2B4032",
        },
        gold: {
          DEFAULT: "#C59B27",
          burnished: "#C59B27",
          light: "#E5C158",
          pale: "#FAF6EE",
          dark: "#9A7418",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        gurmukhi: [
          "var(--font-gurmukhi)",
          "Noto Serif Gurmukhi",
          "Noto Sans Gurmukhi",
          "serif",
        ],
      },
      lineHeight: {
        gurmukhi: "1.85",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(197,155,39,0.4)",
        "glow-strong": "0 0 50px -8px rgba(217,119,6,0.55)",
        parchment: "0 10px 30px -10px rgba(27,42,32,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
