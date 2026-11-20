import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Gurmukhi } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { AmbientBackground } from "@/components/ambient-background";
import { SikhiIconDefs } from "@/components/sikhi-icons";
import { KirtanAudioProvider } from "@/components/kirtan-audio-context";
import { KirtanPlayerProvider } from "@/components/kirtan-player";
import { SevaConcierge } from "@/components/seva-concierge";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const gurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi"],
  variable: "--font-gurmukhi",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Learn Sikhi — SikhStacks, SikhInterest & Gurmat Study",
    template: "%s | Learn Sikhi",
  },
  description:
    "A safe space for Sikhs and scholars to share knowledge, sources, books, and work together.",
  applicationName: "Learn Sikhi",
};

export const viewport: Viewport = {
  themeColor: "#0F1115",
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = window.localStorage.getItem("learn_sikhi_theme_v2");
    var theme = (saved === "indigo" || saved === "obsidian" || saved === "ivory") ? saved : "ivory";
    var root = document.documentElement;
    root.setAttribute("data-theme", theme);
    var isDark = theme === "indigo" || theme === "obsidian";
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="ivory"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${gurmukhi.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
        className="min-h-screen antialiased selection:bg-[#C59B27]/20"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100000] focus:rounded-lg focus:bg-[#0A0A0A] focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-amber-300 focus:border focus:border-amber-400"
        >
          Skip to main content
        </a>
        <AuthProvider initialUser={null} configured={isSupabaseConfigured}>
          <AmbientBackground />
          <SikhiIconDefs />
          <KirtanAudioProvider>
            <KirtanPlayerProvider>
              <div id="main-content" tabIndex={-1} className="outline-none">
                {children}
              </div>
              <SevaConcierge />
            </KirtanPlayerProvider>
          </KirtanAudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
