"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { cx, formatBytes } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

/**
 * Lists the application's records; opening one requests a 60-second signed URL (role-checked and
 * audited on the server). Images show inline, PDFs in an embedded viewer.
 */
export default function DocumentViewer({ documents }) {
  const [active, setActive] = useState(null);
  const [view, setView] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function open(doc) {
    setActive(doc.id);
    setLoading(true);
    setError("");
    setView(null);
    try {
      setView(await api(`/api/documents/${doc.id}/url`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!documents.length)
    return <p style={{ color: "var(--ink-2)", fontSize: 14 }}>No records were uploaded.</p>;

  return (
    <div className="grid gap-4">
      <div className="files">
        {documents.map((doc) => (
          <div key={doc.id} className={cx("fchip", active === doc.id ? "t-lav" : "t-blue")}>
            <span className="bubble">
              <Icon name={doc.mimeType === "application/pdf" ? "file" : "doc"} />
            </span>
            <div className="fn">
              <b>{doc.name}</b>
              <span>
                {formatBytes(doc.size)} ·{" "}
                {doc.mimeType === "application/pdf" ? "PDF" : doc.mimeType === "image/png" ? "PNG" : "JPG"}
                {doc.status !== "verified" ? " · still uploading" : ""}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-glass btn-sm"
              disabled={doc.status !== "verified" || (loading && active === doc.id)}
              onClick={() => open(doc)}
              aria-pressed={active === doc.id}
            >
              <Icon name="eye" /> {loading && active === doc.id ? "Opening…" : "View"}
            </button>
          </div>
        ))}
      </div>
      {error ? (
        <div className="notice t-coral" role="alert">
          <Icon name="alert" />
          <span>{error}</span>
        </div>
      ) : null}
      {view ? (
        <div className="doc-viewer">
          {view.mimeType === "application/pdf" ? (
            <iframe src={view.url} title={view.name} />
          ) : (
            // Signed, short-lived URL: served as-is, never through the image optimizer cache.
            <Image
              src={view.url}
              alt={view.name}
              width={1200}
              height={1600}
              unoptimized
              style={{ width: "auto", height: "auto" }}
            />
          )}
        </div>
      ) : null}
      {view ? (
        <p style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
          This view link expires in {view.expiresIn} seconds and was logged in the audit trail.{" "}
          <a className="link-btn" href={view.url} target="_blank" rel="noopener noreferrer">
            Open in a new tab <Icon name="arrow" />
          </a>
        </p>
      ) : null}
    </div>
  );
}
