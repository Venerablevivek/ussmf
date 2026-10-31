"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

/** Starts a new application pre-filled from the one behind this certificate, then opens the wizard. */
export default function RenewButton({ applicationId, primary = false }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className={primary ? "btn btn-primary btn-sm" : "btn btn-glass btn-sm"}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api("/api/applications", { method: "POST", body: { renewFrom: applicationId } });
          router.push("/apply");
        } catch (err) {
          toast(err.message, { icon: "alert", tone: "bad" });
          setBusy(false);
        }
      }}
    >
      <Icon name="refresh" /> {busy ? "Starting…" : "Renew"}
    </button>
  );
}
