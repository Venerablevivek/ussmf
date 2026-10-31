import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;
  return (
    <AuthCard
      eyebrow="Account help"
      title="Choose a new password"
      lead={
        token
          ? "Pick something you don’t use anywhere else."
          : "This page needs the link from your reset email."
      }
      footer={
        <>
          Need a new link? <Link href="/forgot-password">Request another</Link>
        </>
      }
    >
      {token ? <ResetPasswordForm token={token} /> : null}
    </AuthCard>
  );
}
