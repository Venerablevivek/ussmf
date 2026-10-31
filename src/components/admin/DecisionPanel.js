"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CERTIFICATE_CLASSES } from "@/lib/disciplines";
import { actionsFor } from "@/lib/statuses";
import { fieldErrors, transitionSchema } from "@/lib/validators";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Field, Select, Textarea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

const FIELD_LABELS = {
  note: "Note for the athlete",
  message: "Message to the athlete (emailed)",
  reason: "Reason (emailed to the athlete)",
};

const BUTTON_CLASS = { mint: "btn-mint", coral: "btn-coral" };

/** Physician decisions for an application. Only actions legal from the current status are offered. */
export default function DecisionPanel({ applicationId, status, suggestedClass, defaultValidityMonths }) {
  const router = useRouter();
  const toast = useToast();
  const actions = actionsFor(status);
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function start(action) {
    setOpen(action);
    setErrors({});
    setForm(
      action.id === "approve"
        ? { certificateClass: suggestedClass, validityMonths: String(defaultValidityMonths), notes: "" }
        : { [action.field]: "" },
    );
  }

  async function confirm() {
    const body = { action: open.id, ...form };
    const parsed = transitionSchema.safeParse(body);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    try {
      const res = await api(`/api/admin/applications/${applicationId}/transition`, {
        method: "POST",
        body: parsed.data,
      });
      toast(
        res.certificateId ? `Approved · certificate ${res.certificateId} issued` : `${open.label} · done`,
      );
      setOpen(null);
      router.refresh();
    } catch (err) {
      setErrors({ ...(err.fields || {}), _: err.message });
    } finally {
      setBusy(false);
    }
  }

  if (!actions.length) {
    return (
      <p style={{ color: "var(--ink-2)", fontSize: 14 }}>
        {status === "info_requested"
          ? "Waiting for the athlete to respond. The file returns to review when they do."
          : "This application is closed. No further decisions are possible."}
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-3">
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`btn btn-sm ${BUTTON_CLASS[a.tone] || (a.id === "verify_records" || a.id === "start_review" ? "btn-primary" : "btn-glass")}`}
            onClick={() => start(a)}
            style={{ justifyContent: "flex-start" }}
          >
            <Icon name={a.icon} /> {a.label}
          </button>
        ))}
      </div>

      <Modal
        open={!!open}
        onClose={() => !busy && setOpen(null)}
        title={open?.label || ""}
        subtitle="Every decision is recorded in the audit trail."
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
              className={`btn btn-sm ${BUTTON_CLASS[open?.tone] || "btn-primary"}`}
              onClick={confirm}
              disabled={busy}
              data-autofocus={open?.id === "verify_records" || open?.id === "start_review" ? true : undefined}
            >
              {busy ? "Saving…" : open?.label}
            </button>
          </>
        }
      >
        {open ? (
          <div className="m-step" style={{ paddingBottom: 12 }}>
            {errors._ ? (
              <div className="notice t-coral" role="alert">
                <Icon name="alert" />
                <span>{errors._}</span>
              </div>
            ) : null}
            {open.id === "approve" ? (
              <>
                <div className="grid2">
                  <Field id="certificateClass" label="Certificate class" error={errors.certificateClass}>
                    <Select
                      id="certificateClass"
                      value={form.certificateClass}
                      onChange={(e) => setForm((f) => ({ ...f, certificateClass: e.target.value }))}
                      data-autofocus
                    >
                      {CERTIFICATE_CLASSES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    id="validityMonths"
                    label="Validity"
                    hint={
                      defaultValidityMonths === 6
                        ? "Athlete is 60 or over: 6 months by default."
                        : "12 months by default."
                    }
                    error={errors.validityMonths}
                  >
                    <Select
                      id="validityMonths"
                      value={form.validityMonths}
                      onChange={(e) => setForm((f) => ({ ...f, validityMonths: e.target.value }))}
                      hint
                    >
                      {[3, 6, 12, 24].map((m) => (
                        <option key={m} value={m}>
                          {m} months
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field id="notes" label="Notes (internal)" error={errors.notes}>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </Field>
                <p style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
                  Approving issues the certificate now, emails the athlete, and makes it verifiable by QR
                  code.
                </p>
              </>
            ) : open.field ? (
              <Field id="decisionField" label={FIELD_LABELS[open.field]} error={errors[open.field]}>
                <Textarea
                  id="decisionField"
                  value={form[open.field] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [open.field]: e.target.value }))}
                  error={errors[open.field]}
                  data-autofocus
                  placeholder={
                    open.id === "request_info"
                      ? "e.g. Upload a vision test dated within the last 12 months"
                      : undefined
                  }
                />
              </Field>
            ) : (
              <p style={{ color: "var(--ink-2)" }}>
                {open.id === "verify_records"
                  ? "Confirm the uploaded records are complete, legible and belong to this athlete."
                  : "You’ll be assigned as the reviewing physician for this application."}
              </p>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
