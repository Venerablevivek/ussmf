import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { homeFor } from "@/server/auth/guards";
import AuthCard from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/AuthForms";
import { safeNext } from "@/lib/format";

export const metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next, homeFor(user)));
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  return (
    <AuthCard
      eyebrow="Athlete account"
      title="Create your account"
      lead="Your account keeps your application draft, documents and certificates in one secure place."
      footer={
        <>
          Already have an account? <Link href={loginHref}>Sign in</Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  );
}
