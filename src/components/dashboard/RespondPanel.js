"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { respondSchema } from "@/lib/validators";
import useUpload from "@/hooks/useUpload";
import { useToast } from "@/components/ui/Toast";
import { Field, Textarea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import FileDropzone from "@/components/certification/FileDropzone";

/** Answer a physician's information request: add records, reply, and send the file back to review. */
export default function RespondPanel({ applicationId, documents }) {
  const router = useRouter();
  const toast = useToast();
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [docError, setDocError] = useState("");
  const [busy, setBusy] = useState(false);
  const getApplicationId = useCallback(async () => applicationId, [applicationId]);
  const upload = useUpload({
    getApplicationId,
    initial: documents,
    onError: (message) => toast(message, { icon: "alert", tone: "bad" }),
  });

  async function send() {
    const parsed = respondSchema.safeParse({ response });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (upload.busy) {
      setDocError("Wait for uploads to finish.");
      return;
    }
    setBusy(true);
    try {
      await api(`/api/applications/${applicationId}`, { method: "PATCH", body: parsed.data });
      toast("Sent. Your file is back with your physician.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="field">
        <span className="flabel">Add records</span>
        <FileDropzone upload={upload} error={docError} id="respondFiles" />
      </div>
      <Field id="response" label="Reply to your physician" error={error}>
        <Textarea
          id="response"
          placeholder="Tell your physician what you uploaded or answer their question."
          value={response}
          onChange={(e) => {
            setResponse(e.target.value);
            setError("");
          }}
          error={error}
        />
      </Field>
      <button
        type="button"
        className="btn btn-primary"
        onClick={send}
        disabled={busy}
        style={{ justifySelf: "start" }}
      >
        {busy ? "Sending…" : "Send response & resubmit"} <Icon name="arrow" className="arrow" />
      </button>
    </div>
  );
}
