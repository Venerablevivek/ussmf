import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Account help"
      title="Forgot your password?"
      lead="Enter your account email. We’ll send a single-use link that expires in 1 hour."
      footer={
        <>
          Remembered it? <Link href="/login">Sign in</Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
