"use client";

import Link from "next/link";
import { useCopy } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

/** "Download PDF" and "Copy verify link" for a certificate. The sample sends athletes to their dashboard. */
export default function CertCopyActions({ certificateId, pdfHref = "/dashboard/certificates" }) {
  const copy = useCopy();
  return (
    <div className="btns">
      {pdfHref.startsWith("/api/") ? (
        <a className="btn btn-primary" href={pdfHref} download>
          <Icon name="download" /> Download PDF
        </a>
      ) : (
        <Link className="btn btn-primary" href={pdfHref}>
          <Icon name="download" /> Download PDF
        </Link>
      )}
      <button
        type="button"
        className="btn btn-glass"
        onClick={() => copy(`${window.location.origin}/verify/${certificateId}`, "Verification link")}
      >
        <Icon name="share" /> Copy verify link
      </button>
    </div>
  );
}
