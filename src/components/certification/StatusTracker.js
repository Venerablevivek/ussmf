"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { fieldErrors, statusLookupSchema } from "@/lib/validators";
import Entrance from "@/components/motion/Entrance";
import Bubble from "@/components/ui/Bubble";
import StatusTimeline from "./StatusTimeline";

const SHOW_SAMPLES = process.env.NEXT_PUBLIC_DEMO_SAMPLES !== "false";
const SAMPLES = [
  { id: "USSMF-APP-2026-3381", email: "jordan.lee@example.com" },
  { id: "USSMF-APP-2026-2207", email: "morgan.brooks@example.com" },
];

/**
 * Public application tracker. Needs both the application ID and the email used to apply,
 * so applications can't be looked up by guessing IDs. Shows no medical information.
 */
export default function StatusTracker() {
  const [applicationId, setApplicationId] = useState("USSMF-APP-2026-3381");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function lookup(values) {
    const parsed = statusLookupSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setResult(null);
      return;
    }
    setApplicationId(parsed.data.applicationId);
    setErrors({});
    setBusy(true);
    try {
      setResult({ ...(await api("/api/status", { method: "POST", body: parsed.data })), at: Date.now() });
    } catch (err) {
      setErrors({ _: err.message });
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  const message = errors.applicationId || errors.email || errors._ || "";

  return (
    <>
      <div className="tool-head">
        <Bubble icon="clock" tone="blue" />
        <h3>Track your application</h3>
        <p>Enter the application ID from your confirmation email.</p>
      </div>
      <form
        className="inline-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          lookup({ applicationId, email });
        }}
      >
        <label className="sr-only" htmlFor="stId">
          Application ID
        </label>
        <input
          className={errors.applicationId ? "inp bad" : "inp"}
          id="stId"
          placeholder="USSMF-APP-2026-0000"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          autoComplete="off"
          aria-invalid={errors.applicationId ? "true" : undefined}
          aria-describedby="stErr"
        />
        <label className="sr-only" htmlFor="stEmail">
          Email used to apply
        </label>
        <input
          className={errors.email ? "inp bad" : "inp"}
          id="stEmail"
          type="email"
          placeholder="Email used to apply"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby="stErr"
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>
          {busy ? "Checking…" : "Check status"}
        </button>
      </form>
      {SHOW_SAMPLES ? (
        <div className="samples">
          <span className="demo-tag">Demo</span>Try
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setApplicationId(s.id);
                setEmail(s.email);
                lookup({ applicationId: s.id, email: s.email });
              }}
            >
              {s.id}
            </button>
          ))}
        </div>
      ) : null}
      <div className="err" id="stErr" role={message ? "alert" : undefined}>
        {message}
      </div>
      <div aria-live="polite">
        {result && !result.found ? (
          <Entrance key={result.at} variant="result" className="vres t-coral">
            <Bubble icon="search" />
            <div>
              <h4>No application found</h4>
              <p>
                Check the ID and email in your confirmation email. IDs look like{" "}
                <code>USSMF-APP-2026-3381</code>.
              </p>
            </div>
          </Entrance>
        ) : null}
        {result?.found ? (
          <Entrance key={result.at} variant="result">
            <div className="status-head">
              <div>
                <b>{result.name}</b> · <span style={{ color: "var(--ink-2)" }}>{result.discipline}</span>
              </div>
              <code>{result.publicId}</code>
            </div>
            <StatusTimeline stages={result.timeline} style={{ marginTop: 16 }} />
          </Entrance>
        ) : null}
      </div>
    </>
  );
}
