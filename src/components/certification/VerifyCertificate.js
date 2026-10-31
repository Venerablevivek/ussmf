"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { certificateIdSchema } from "@/lib/validators";
import Entrance from "@/components/motion/Entrance";
import Bubble from "@/components/ui/Bubble";
import { Icon } from "@/components/ui/Icon";
import VerifyResult from "./VerifyResult";

const SHOW_SAMPLES = process.env.NEXT_PUBLIC_DEMO_SAMPLES !== "false";
const SAMPLES = [
  { id: "USSMF-AS-2026-10482", label: "Valid" },
  { id: "USSMF-AS-2025-00731", label: "Expired" },
  { id: "USSMF-AS-2026-99999", label: "Unknown" },
];

/** Certificate verification for organizers: ID in, live result out (never cached). */
export default function VerifyCertificate({ initialId = "USSMF-AS-2026-10482", showHead = true }) {
  const [id, setId] = useState(initialId);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function verify(value) {
    const parsed = certificateIdSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setResult(null);
      return;
    }
    setId(parsed.data);
    setError("");
    setBusy(true);
    try {
      const data = await api(`/api/verify/${encodeURIComponent(parsed.data)}`);
      setResult({ ...data, at: Date.now() });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {showHead ? (
        <div className="tool-head">
          <Bubble icon="qr" tone="lav" />
          <h3>Verify a certificate</h3>
          <p>For event organizers, clubs and federations. Enter the ID printed under the QR code.</p>
        </div>
      ) : null}
      <form
        className="inline-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          verify(id);
        }}
      >
        <label className="sr-only" htmlFor="vId">
          Certificate ID
        </label>
        <input
          className={error ? "inp bad" : "inp"}
          id="vId"
          placeholder="USSMF-AS-2026-00000"
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoComplete="off"
          aria-invalid={error ? "true" : undefined}
          aria-describedby="vErr"
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>
          <Icon name="search" /> {busy ? "Verifying…" : "Verify"}
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
                setId(s.id);
                verify(s.id);
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="err" id="vErr" role={error ? "alert" : undefined}>
        {error}
      </div>
      <div aria-live="polite">
        {result ? (
          <Entrance key={result.at} variant="result">
            <VerifyResult result={result} />
            {result.result !== "not_found" ? (
              <p style={{ marginTop: 10, fontSize: 13 }}>
                <Link className="link-btn" href={`/verify/${result.certificateId}`}>
                  Open the verification page <Icon name="arrow" />
                </Link>
              </p>
            ) : null}
          </Entrance>
        ) : null}
      </div>
    </>
  );
}
