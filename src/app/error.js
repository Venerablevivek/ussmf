"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function ErrorPage({ error, reset }) {
  return (
    <div className="app-main">
      <div className="wrap">
        <div
          className="panel clay empty t-coral"
          style={{ maxWidth: 640, marginInline: "auto" }}
          role="alert"
        >
          <span className="bubble lg t-coral">
            <Icon name="alert" />
          </span>
          <h1 style={{ fontSize: "clamp(26px,3vw,34px)", fontWeight: 800 }}>Something went wrong.</h1>
          <p>
            We couldn’t load this page. Try again in a moment. If it keeps happening, contact info@ussmf.org
            {error?.digest ? ` and mention reference ${error.digest}` : ""}.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" className="btn btn-primary" onClick={() => reset()}>
              <Icon name="refresh" /> Try again
            </button>
            <Link className="btn btn-glass" href="/">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
