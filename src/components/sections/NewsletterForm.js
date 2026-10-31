"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { newsletterSchema } from "@/lib/validators";
import Entrance from "@/components/motion/Entrance";
import { Icon } from "@/components/ui/Icon";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/api/newsletter", { method: "POST", body: parsed.data });
      setDone(parsed.data.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Entrance variant="result" className="join-ok" role="status">
        <Icon name="check" />
        <span>You’re on the list. We’ll email {done} at launch.</span>
      </Entrance>
    );
  }

  return (
    <div>
      <form className="join-form" noValidate onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="joinEmail">
          Email address
        </label>
        <input
          id="joinEmail"
          type="email"
          placeholder="Enter your email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby="joinErr"
        />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Adding you…" : "Notify me at launch"}
        </button>
      </form>
      <div className="err" id="joinErr" role={error ? "alert" : undefined}>
        {error}
      </div>
    </div>
  );
}
