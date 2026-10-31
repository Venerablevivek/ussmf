"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { certificateStatusSchema } from "@/lib/validators";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Field, Textarea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

const ACTIONS = {
  suspend: { label: "Suspend", icon: "alert", cls: "btn-glass", from: ["active"] },
  reinstate: { label: "Reinstate", icon: "check", cls: "btn-mint", from: ["suspended"] },
  revoke: { label: "Revoke", icon: "x", cls: "btn-coral", from: ["active", "suspended"] },
};

/** Admin-only suspend / reinstate / revoke with a required reason. The verify page reflects it at once. */
export default function CertificateActions({ certificateId, publicId, status, canManage }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const available = Object.entries(ACTIONS).filter(([, a]) => a.from.includes(status));
  if (!canManage || !available.length) return null;

  async function confirm() {
    const parsed = certificateStatusSchema.safeParse({ action: open, reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      await api(`/api/admin/certificates/${certificateId}/status`, { method: "POST", body: parsed.data });
      toast(
        `${publicId} ${open === "reinstate" ? "reinstated" : open === "suspend" ? "suspended" : "revoked"}`,
      );
      setOpen(null);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {available.map(([id, a]) => (
          <button
            key={id}
            type="button"
            className={`btn btn-sm ${a.cls}`}
            onClick={() => {
              setOpen(id);
              setReason("");
              setError("");
            }}
          >
            <Icon name={a.icon} /> {a.label}
          </button>
        ))}
      </div>
      <Modal
        open={!!open}
        onClose={() => !busy && setOpen(null)}
        title={open ? `${ACTIONS[open].label} ${publicId}` : ""}
        subtitle="The athlete is emailed and the verify page updates immediately."
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={() => setOpen(null)}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-sm ${open ? ACTIONS[open].cls : ""}`}
              onClick={confirm}
              disabled={busy}
            >
              {busy ? "Saving…" : open ? ACTIONS[open].label : ""}
            </button>
          </>
        }
      >
        <div className="m-step" style={{ paddingBottom: 12 }}>
          {open === "revoke" ? (
            <div className="notice t-coral">
              <Icon name="alert" />
              <span>Revoking is permanent. The certificate can’t be reinstated afterwards.</span>
            </div>
          ) : null}
          <Field id="statusReason" label="Reason" error={error}>
            <Textarea
              id="statusReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              error={error}
              data-autofocus
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
