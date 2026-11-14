import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Gurmukhi } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import "./globals.css";

// Editorial headings (Cormorant Garamond), clean UI body text (Inter / Plus Jakarta Sans),
// and Gurmukhi scripture typography (Noto Serif Gurmukhi / Noto Sans Gurmukhi) with 1.85 line-height.
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
    "Explore the depths of Sikhi. A study companion for Sikh philosophy, history and Gurbani, with answers that point back to their sources.",
};

export const viewport: Viewport = {
  themeColor: "#1B2A20",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verified on the server so the first client render matches the HTML.
  const user = await getCurrentUser();
  const initialUser = user ? { id: user.id, email: user.email ?? null } : null;

  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${gurmukhi.variable}`}
    >
      <body className="bg-[#FAF6EE] text-[#171917] antialiased selection:bg-[#D97706]/20 selection:text-[#171917]">
        <AuthProvider initialUser={initialUser} configured={isSupabaseConfigured}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
