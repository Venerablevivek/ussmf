"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatBytes } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

/** Read-only list of an application's records; each opens through a 60-second signed link. */
export default function DocumentList({ documents }) {
  const toast = useToast();
  const [opening, setOpening] = useState(null);

  async function open(doc) {
    setOpening(doc.id);
    // Open the tab during the click so popup blockers allow it, then point it at the signed URL.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    try {
      const { url } = await api(`/api/documents/${doc.id}/url`);
      if (tab) tab.location.href = url;
      else window.location.href = url;
    } catch (err) {
      tab?.close();
      toast(err.message, { icon: "alert", tone: "bad" });
    } finally {
      setOpening(null);
    }
  }

  if (!documents.length) return <p style={{ color: "var(--ink-2)", fontSize: 14 }}>No records uploaded.</p>;
  return (
    <div className="files">
      {documents.map((doc) => (
        <div key={doc.id} className="fchip t-blue">
          <span className="bubble">
            <Icon name={doc.mimeType === "application/pdf" ? "file" : "doc"} />
          </span>
          <div className="fn">
            <b>{doc.name}</b>
            <span>
              {formatBytes(doc.size)} · {doc.status === "verified" ? "Verified upload" : "Uploading"}
            </span>
          </div>
          {doc.status === "verified" ? (
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={() => open(doc)}
              disabled={opening === doc.id}
            >
              <Icon name="eye" /> {opening === doc.id ? "Opening…" : "View"}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
