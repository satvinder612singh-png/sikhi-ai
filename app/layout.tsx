import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Gurmukhi } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { AmbientBackground } from "@/components/ambient-background";
import { SikhiIconDefs } from "@/components/sikhi-icons";
import { KirtanAudioProvider } from "@/components/kirtan-audio-context";
import { KirtanPlayerProvider } from "@/components/kirtan-player";
import { SevaConcierge } from "@/components/seva-concierge";
import { getCurrentUser } from "@/lib/supabase/server";
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
    default: "Learn Sikhi — Explore the depths of Sikhi.",
    template: "%s | Learn Sikhi",
  },
  description:
    "Explore the depths of Sikhi. A warm, source-first sanctuary for Gurbani, Nitnem, Puratan Kirtan, Historical Granths, Unsung Sikh Women, and interactive Abhiyaas.",
  applicationName: "Learn Sikhi",
};

export const viewport: Viewport = {
  themeColor: "#FAF7F0",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const initialUser = user ? { id: user.id, email: user.email ?? null } : null;

  return (
    <html
      lang="en"
      data-theme="ivory"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${gurmukhi.variable}`}
    >
      <body className="bg-[#FAF7F0] text-[#18181B] antialiased selection:bg-[#C59B27]/20 selection:text-[#18181B]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100000] focus:rounded-xl focus:bg-[#090d16] focus:px-4 focus:py-2.5 focus:text-xs focus:font-extrabold focus:text-amber-300 focus:border focus:border-amber-400 focus:shadow-2xl"
        >
          Skip to main content
        </a>
        <AuthProvider initialUser={initialUser} configured={isSupabaseConfigured}>
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
