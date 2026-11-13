import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { LoginForm } from "@/components/login-form";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = safeNextPath(next);

  if (await getCurrentUser()) redirect(target);

  return (
    <>
      <Navbar solid />
      <main className="flex min-h-[80vh] items-center justify-center px-5 py-28 sm:px-8">
        <LoginForm next={target} callbackError={error === "callback"} />
      </main>
      <Footer />
    </>
  );
}
