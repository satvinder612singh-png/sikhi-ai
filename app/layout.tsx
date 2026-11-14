import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Gurmukhi } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { AmbientBackground } from "@/components/ambient-background";
import { SikhiIconDefs } from "@/components/sikhi-icons";
import { KirtanAudioProvider } from "@/components/kirtan-audio-context";
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
        <AuthProvider initialUser={initialUser} configured={isSupabaseConfigured}>
          <AmbientBackground />
          <SikhiIconDefs />
          <KirtanAudioProvider>
            {children}
            <SevaConcierge />
          </KirtanAudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
