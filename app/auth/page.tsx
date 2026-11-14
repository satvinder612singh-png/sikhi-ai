import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { LoginForm } from "@/components/login-form";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Sign In • SikhInterest & Vichaar",
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = safeNextPath(next || "/sangat");

  if (await getCurrentUser()) redirect(target);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      className="min-h-screen flex flex-col"
    >
      <Header solid />
      <main className="flex flex-1 min-h-[78vh] items-center justify-center px-5 py-20 sm:px-8">
        <LoginForm next={target} callbackError={error === "callback"} />
      </main>
      <Footer />
    </div>
  );
}
