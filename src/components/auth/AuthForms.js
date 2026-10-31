"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  fieldErrors,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validators";
import { safeNext } from "@/lib/format";
import useAuth from "@/hooks/useAuth";
import Entrance from "@/components/motion/Entrance";
import { Field, Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

const homeFor = (user) => (user?.role === "physician" || user?.role === "admin" ? "/admin" : "/dashboard");

function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const bind = (key) => ({
    value: values[key],
    error: errors[key],
    onChange: (e) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
    },
  });
  return { values, errors, setErrors, message, setMessage, busy, setBusy, bind };
}

async function run(form, schema, request) {
  const parsed = schema.safeParse(form.values);
  if (!parsed.success) {
    form.setErrors(fieldErrors(parsed.error));
    form.setMessage("");
    return null;
  }
  form.setBusy(true);
  form.setMessage("");
  try {
    return await request(parsed.data);
  } catch (err) {
    form.setErrors(err.fields || {});
    form.setMessage(err.message);
    return null;
  } finally {
    form.setBusy(false);
  }
}

function FormError({ message }) {
  if (!message) return null;
  return (
    <div className="notice t-coral" role="alert">
      <Icon name="alert" />
      <span>{message}</span>
    </div>
  );
}

export function LoginForm({ next }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const form = useForm({ email: "", password: "" });
  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await run(form, loginSchema, (body) => api("/api/auth/login", { method: "POST", body }));
        if (!res) return;
        await refresh();
        router.replace(safeNext(next, homeFor(res.user)));
        router.refresh();
      }}
    >
      <FormError message={form.message} />
      <Field id="email" label="Email" error={form.errors.email}>
        <Input id="email" type="email" autoComplete="email" {...form.bind("email")} />
      </Field>
      <Field id="password" label="Password" error={form.errors.password}>
        <Input id="password" type="password" autoComplete="current-password" {...form.bind("password")} />
      </Field>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button className="btn btn-primary" type="submit" disabled={form.busy}>
          {form.busy ? "Signing in…" : "Sign in"} <Icon name="arrow" className="arrow" />
        </button>
        <Link className="link-btn" href="/forgot-password">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm({ next }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const form = useForm({ firstName: "", lastName: "", email: "", password: "" });
  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await run(form, registerSchema, (body) =>
          api("/api/auth/register", { method: "POST", body }),
        );
        if (!res) return;
        await refresh();
        router.replace(safeNext(next, "/apply"));
        router.refresh();
      }}
    >
      <FormError message={form.message} />
      <div className="row2">
        <Field id="firstName" label="First name" error={form.errors.firstName}>
          <Input id="firstName" autoComplete="given-name" {...form.bind("firstName")} />
        </Field>
        <Field id="lastName" label="Last name" error={form.errors.lastName}>
          <Input id="lastName" autoComplete="family-name" {...form.bind("lastName")} />
        </Field>
      </div>
      <Field id="email" label="Email" error={form.errors.email}>
        <Input id="email" type="email" autoComplete="email" {...form.bind("email")} />
      </Field>
      <Field id="password" label="Password" hint="At least 10 characters." error={form.errors.password}>
        <Input id="password" type="password" autoComplete="new-password" hint {...form.bind("password")} />
      </Field>
      <button className="btn btn-primary" type="submit" disabled={form.busy} style={{ justifySelf: "start" }}>
        {form.busy ? "Creating account…" : "Create account"} <Icon name="arrow" className="arrow" />
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const form = useForm({ email: "" });
  const [sent, setSent] = useState("");
  if (sent) {
    return (
      <Entrance variant="result" className="notice t-mint" role="status">
        <Icon name="mail" />
        <span>{sent}</span>
      </Entrance>
    );
  }
  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await run(form, forgotPasswordSchema, (body) =>
          api("/api/auth/forgot-password", { method: "POST", body }),
        );
        if (res) setSent(res.message);
      }}
    >
      <FormError message={form.message} />
      <Field id="email" label="Email" error={form.errors.email}>
        <Input id="email" type="email" autoComplete="email" {...form.bind("email")} />
      </Field>
      <button className="btn btn-primary" type="submit" disabled={form.busy} style={{ justifySelf: "start" }}>
        {form.busy ? "Sending…" : "Email me a reset link"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const form = useForm({ token: token || "", password: "", confirm: "" });
  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (form.values.password !== form.values.confirm) {
          form.setErrors({ confirm: "The two passwords don’t match." });
          return;
        }
        const res = await run(form, resetPasswordSchema, (body) =>
          api("/api/auth/reset-password", { method: "POST", body }),
        );
        if (!res) return;
        const user = await refresh();
        router.replace(user ? homeFor(user) : "/login");
        router.refresh();
      }}
    >
      <FormError message={form.message || form.errors.token} />
      <Field id="password" label="New password" hint="At least 10 characters." error={form.errors.password}>
        <Input id="password" type="password" autoComplete="new-password" hint {...form.bind("password")} />
      </Field>
      <Field id="confirm" label="Confirm new password" error={form.errors.confirm}>
        <Input id="confirm" type="password" autoComplete="new-password" {...form.bind("confirm")} />
      </Field>
      <button className="btn btn-primary" type="submit" disabled={form.busy} style={{ justifySelf: "start" }}>
        {form.busy ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
