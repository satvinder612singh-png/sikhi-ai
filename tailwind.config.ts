import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#070b17",
          900: "#0b1020",
          800: "#0e1426",
          700: "#151d38",
        },
        gold: {
          DEFAULT: "#d4a94c",
          light: "#f0d58a",
          pale: "#fbf1d3",
          dark: "#b88a2e",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        gurmukhi: ["var(--font-gurmukhi)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(212,169,76,0.45)",
        "glow-strong": "0 0 50px -8px rgba(212,169,76,0.7)",
      },
    },
  },
  plugins: [],
};

export default config;
