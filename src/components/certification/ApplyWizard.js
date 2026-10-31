"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ApiError, api, uploadToStorage } from "@/lib/api";
import { MAX_PHOTO_BYTES, PHOTO_TYPES, consentSchema, fieldErrors, validateStep } from "@/lib/validators";
import { cx } from "@/lib/format";
import useAutosave from "@/hooks/useAutosave";
import useUpload from "@/hooks/useUpload";
import { EASE, SPRING } from "@/components/motion/easing";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import StepPersonal from "./wizard/StepPersonal";
import StepSport from "./wizard/StepSport";
import StepMedical from "./wizard/StepMedical";
import StepDocuments from "./wizard/StepDocuments";
import StepReview from "./wizard/StepReview";
import StepSuccess from "./wizard/StepSuccess";

const STEP_LABELS = ["Personal", "Sport", "Medical", "Documents", "Review"];
const FIELD_STEP = {
  legalName: 1,
  dateOfBirth: 1,
  phone: 1,
  state: 1,
  discipline: 2,
  level: 2,
  federation: 2,
  memberNumber: 2,
  yearsExperience: 2,
  conditions: 3,
  medications: 3,
  injuries: 3,
  lastPhysicalDate: 3,
  documents: 4,
};
const FIRST_FIELD_ID = {
  legalName: "aName",
  dateOfBirth: "aDob",
  phone: "aPhone",
  state: "aState",
  discipline: "aDisc",
  level: "aLevel",
  lastPhysicalDate: "aLast",
  conditions: "cond0",
};

/**
 * The five-step Medical Fitness Certificate application. The draft is created on the first
 * save and every change autosaves (debounced 800 ms). Each step is validated with the same zod
 * schemas the server uses. Files go straight to storage with presigned URLs.
 */
export default function ApplyWizard({ initial }) {
  const toast = useToast();
  const [values, setValues] = useState(initial.values);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [consents, setConsents] = useState({ review: false, accurate: false, suspension: false });
  const [photo, setPhoto] = useState({ url: initial.photoUrl, busy: false, error: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [savedVisible, setSavedVisible] = useState(false);
  const signatureRef = useRef(null);
  const draftRef = useRef(initial.draft);
  const creating = useRef(null);
  const savedTimer = useRef(null);
  const cardRef = useRef(null);

  // Creates the draft the first time anything needs saving, exactly once.
  const ensureDraft = useCallback(async () => {
    if (draftRef.current) return draftRef.current.id;
    if (!creating.current) {
      creating.current = api("/api/applications", { method: "POST", body: {} })
        .then(({ application }) => {
          draftRef.current = application;
          return application.id;
        })
        .finally(() => {
          creating.current = null;
        });
    }
    return creating.current;
  }, []);

  const save = useCallback(
    async (patch) => {
      const id = await ensureDraft();
      await api(`/api/applications/${id}`, { method: "PATCH", body: patch });
      setSavedVisible(true);
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSavedVisible(false), 1800);
    },
    [ensureDraft],
  );
  const autosave = useAutosave(save, { delay: 800 });

  const upload = useUpload({
    getApplicationId: ensureDraft,
    initial: initial.documents,
    onError: (message) => toast(message, { icon: "alert", tone: "bad" }),
  });

  function update(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
    autosave.queue({ [key]: value });
  }

  async function onPhoto(file) {
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setPhoto((p) => ({ ...p, error: "Choose a JPG or PNG image for your photo." }));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhoto((p) => ({ ...p, error: "Photos must be 5 MB or smaller." }));
      return;
    }
    const previous = photo.url;
    const reader = new FileReader();
    reader.onload = () => setPhoto({ url: reader.result, busy: true, error: "" });
    reader.readAsDataURL(file);
    try {
      const id = await ensureDraft();
      const { key, uploadUrl } = await api(`/api/applications/${id}/photo/presign`, {
        method: "POST",
        body: { contentType: file.type, size: file.size },
      });
      await uploadToStorage(uploadUrl, file, file.type);
      await api(`/api/applications/${id}`, { method: "PATCH", body: { photoKey: key } });
      setPhoto((p) => ({ ...p, busy: false, error: "" }));
      toast("Photo saved");
    } catch (err) {
      setPhoto({ url: previous, busy: false, error: err.message });
    }
  }

  function focusFirstError(errs) {
    const first = Object.keys(errs)[0];
    const id = FIRST_FIELD_ID[first];
    setTimeout(() => document.getElementById(id)?.focus(), 60);
  }

  function validate(n) {
    if (n <= 3) {
      const { ok, errors: errs } = validateStep(n, values);
      setErrors(errs);
      if (!ok) focusFirstError(errs);
      return ok;
    }
    if (n === 4) {
      let message = "";
      if (!upload.items.length) message = "Upload at least one medical record.";
      else if (upload.busy) message = "Wait for uploads to finish.";
      else if (upload.failed) message = "Remove the files that failed, then try again.";
      setErrors(message ? { documents: message } : {});
      return !message;
    }
    if (n === 5) {
      const errs = {};
      const all = consents.review && consents.accurate && consents.suspension;
      if (!all) errs.consents = "Tick all three boxes to continue.";
      if (signatureRef.current?.isEmpty() !== false) errs.signature = "Add your signature.";
      setErrors(errs);
      return !Object.keys(errs).length;
    }
    return true;
  }

  function goTo(n) {
    setStep(n);
    cardRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  async function next() {
    if (!validate(step)) return;
    try {
      await autosave.flush();
    } catch (err) {
      toast(err.message || "We couldn’t save your draft. Check your connection.", {
        icon: "alert",
        tone: "bad",
      });
      return;
    }
    if (step < 5) {
      goTo(step + 1);
      return;
    }
    submit();
  }

  async function submit() {
    const body = { consents, signature: signatureRef.current.toDataURL() };
    const parsed = consentSchema.safeParse(body);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setSubmitting(true);
    try {
      const id = await ensureDraft();
      const { application } = await api(`/api/applications/${id}/submit`, {
        method: "POST",
        body: parsed.data,
      });
      setSubmitted(application);
      setStep(6);
      cardRef.current?.scrollIntoView({ block: "start" });
    } catch (err) {
      if (err instanceof ApiError && err.fields && Object.keys(err.fields).length) {
        const target = Math.min(...Object.keys(err.fields).map((f) => FIELD_STEP[f] || 5));
        setErrors(err.fields);
        goTo(target);
        focusFirstError(err.fields);
      }
      toast(err.message, { icon: "alert", tone: "bad" });
    } finally {
      setSubmitting(false);
    }
  }

  const progress = step >= 6 ? 1 : (step * 20 - 6) / 100;

  return (
    <div className="modal-card page" ref={cardRef} aria-labelledby="applyTitle">
      <div className="m-head">
        <div className="m-title">
          <h1
            id="applyTitle"
            className="m-title-h"
            style={{ fontSize: "clamp(20px,2.4vw,26px)", fontWeight: 800 }}
          >
            Medical Fitness Certificate
            <small>Air Sports Division · Application</small>
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AnimatePresence>
              {savedVisible ? (
                <motion.span
                  className="saved"
                  role="status"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon name="check" />
                  Draft saved
                </motion.span>
              ) : null}
            </AnimatePresence>
            {autosave.status === "error" ? (
              <span className="saved" style={{ color: "var(--coral-d)" }} role="alert">
                <Icon name="alert" />
                Not saved
              </span>
            ) : null}
            <Link
              className="round"
              href="/dashboard"
              aria-label="Save and exit"
              style={{ width: 44, height: 44 }}
            >
              <Icon name="x" />
            </Link>
          </div>
        </div>
        <div className="pbar">
          <motion.i
            initial={false}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.7, ease: SPRING }}
          />
        </div>
        <div className="steps-mini" aria-label={`Step ${Math.min(step, 5)} of 5`}>
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={cx(i + 1 < step && "ok", i + 1 === step && "on")}
              aria-current={i + 1 === step ? "step" : undefined}
            >
              {i + 1} · {label}
            </span>
          ))}
        </div>
      </div>

      <form
        className="m-body"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {step === 6 && submitted ? (
            <StepSuccess key="success" application={submitted} />
          ) : (
            <motion.div
              key={step}
              className="m-step"
              initial={{ opacity: 0.2, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15, ease: EASE } }}
              transition={{ duration: 0.5, ease: SPRING }}
            >
              {step === 1 ? (
                <StepPersonal
                  values={values}
                  errors={errors}
                  update={update}
                  photo={photo}
                  onPhoto={onPhoto}
                />
              ) : null}
              {step === 2 ? <StepSport values={values} errors={errors} update={update} /> : null}
              {step === 3 ? <StepMedical values={values} errors={errors} update={update} /> : null}
              {step === 4 ? <StepDocuments upload={upload} error={errors.documents} /> : null}
              {step === 5 ? (
                <StepReview
                  values={values}
                  documentCount={upload.ready}
                  consents={consents}
                  setConsent={(key, v) => {
                    setConsents((c) => ({ ...c, [key]: v }));
                    setErrors((e) => ({ ...e, consents: "" }));
                  }}
                  errors={errors}
                  signatureRef={signatureRef}
                  onSignature={() => setErrors((e) => ({ ...e, signature: "" }))}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>

      {step <= 5 ? (
        <div className="m-foot">
          <button
            type="button"
            className="btn btn-glass btn-sm"
            style={{ visibility: step === 1 ? "hidden" : "visible" }}
            onClick={() => goTo(step - 1)}
          >
            Back
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={next} disabled={submitting}>
            {step === 5 ? (
              <>
                {submitting ? "Submitting…" : "Submit application"} <Icon name="check" />
              </>
            ) : (
              <>
                Continue <Icon name="arrow" className="arrow" />
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
