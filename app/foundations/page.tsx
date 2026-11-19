import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SikhiFoundationsDeck } from "@/components/sikhi-foundations-deck";

export const metadata: Metadata = {
  title: "Foundations of Sikhi — Traditional Sikh Scholarship & History",
  description:
    "Foundations of Sikhi grounded in Nirmale scholars, Classical Kavis, the Bhagats of Sri Guru Granth Sahib Ji, 19th–20th century Sikh historians, the Five Ks, the Ten Gurus, Panj Pyare, Chaar Sahibzaade, and Shaheeds.",
};

export default function FoundationsPage() {
  return (
    <div style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }} className="flex min-h-screen flex-col">
      <Header solid />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 pb-28 sm:px-6 lg:px-8">
        <SikhiFoundationsDeck headingLevel={1} />
      </main>
      <Footer />
    </div>
  );
}
