import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { homeFor } from "@/server/auth/guards";
import AuthCard from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/AuthForms";
import { safeNext } from "@/lib/format";

export const metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next, homeFor(user)));
  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";
  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in to U.S.S.M.F."
      lead="Track your application, download certificates, or review files in the physician portal."
      footer={
        <>
          New here? <Link href={registerHref}>Create an athlete account</Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}
