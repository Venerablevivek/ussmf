// Application lifecycle. The allowed transitions are defined once, here, and enforced by the server.
import { formatShortDate } from "./format";

export const STATUSES = [
  "draft",
  "submitted",
  "records_verified",
  "under_review",
  "assessment_required",
  "info_requested",
  "approved",
  "rejected",
];

export const STATUS_META = {
  draft: { label: "Draft", tone: "sun" },
  submitted: { label: "Submitted", tone: "blue" },
  records_verified: { label: "Records verified", tone: "lav" },
  under_review: { label: "Physician review", tone: "blue" },
  assessment_required: { label: "Fitness assessment", tone: "coral" },
  info_requested: { label: "Info requested", tone: "sun" },
  approved: { label: "Approved", tone: "mint" },
  rejected: { label: "Rejected", tone: "coral" },
};

export const TRANSITIONS = {
  draft: ["submitted"],
  submitted: ["records_verified", "info_requested", "rejected"],
  records_verified: ["under_review", "info_requested", "rejected"],
  under_review: ["assessment_required", "info_requested", "approved", "rejected"],
  assessment_required: ["approved", "info_requested", "rejected"],
  info_requested: ["under_review", "rejected"],
  approved: [],
  rejected: [],
};

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

// Statuses in which the athlete may still edit the file and add documents.
export const EDITABLE_STATUSES = ["draft", "info_requested"];

// Statuses still waiting on a physician.
export const OPEN_REVIEW_STATUSES = ["submitted", "records_verified", "under_review", "assessment_required"];

// Physician / admin decisions offered in the review portal.
export const REVIEW_ACTIONS = {
  verify_records: { to: "records_verified", label: "Mark records verified", icon: "check", tone: "lav" },
  start_review: { to: "under_review", label: "Start physician review", icon: "steth", tone: "blue" },
  require_assessment: {
    to: "assessment_required",
    label: "Require fitness assessment",
    icon: "pulse",
    tone: "coral",
    field: "note",
  },
  request_info: {
    to: "info_requested",
    label: "Request more information",
    icon: "mail",
    tone: "sun",
    field: "message",
  },
  approve: { to: "approved", label: "Approve", icon: "medal", tone: "mint" },
  reject: { to: "rejected", label: "Reject", icon: "x", tone: "coral", field: "reason" },
};

export function actionsFor(status) {
  return Object.entries(REVIEW_ACTIONS)
    .filter(([, a]) => canTransition(status, a.to))
    .map(([id, a]) => ({ id, ...a }));
}

export const STAGES = [
  "Submitted",
  "Records verified",
  "Physician review",
  "Fitness assessment",
  "Certificate issued",
];

const STAGE_OF = {
  draft: 0,
  submitted: 1,
  records_verified: 2,
  under_review: 2,
  assessment_required: 3,
  approved: 5,
};

const STAGE_NOTES = {
  1: "Records check usually takes 1–2 business days.",
  2: "Physician review usually takes 3–5 business days.",
  3: "Your physician will contact you to schedule the assessment.",
};

function lastEvent(events, toStatus) {
  for (let i = events.length - 1; i >= 0; i--) if (events[i].toStatus === toStatus) return events[i];
  return null;
}

/**
 * Maps an application onto the five-stage public timeline from the design.
 * `events` are { fromStatus, toStatus, createdAt, message } in chronological order.
 * `detail` controls whether physician messages are shown (owner view) or a generic note (public view).
 */
export function buildTimeline({ status, submittedAt, events = [] }, { detail = false } = {}) {
  let stage = STAGE_OF[status] ?? 0;
  let mode = "current";
  let label = null;
  let note = null;

  if (status === "draft") {
    mode = "warn";
    label = "Not submitted yet";
    note = "Finish and submit your application to start the review.";
  } else if (status === "info_requested") {
    const ev = lastEvent(events, "info_requested");
    stage = STAGE_OF[ev?.fromStatus] ?? 1;
    mode = "warn";
    label = "Additional information needed";
    note =
      detail && ev?.message
        ? ev.message
        : "Sign in to your dashboard to read the physician’s request and respond.";
  } else if (status === "rejected") {
    const ev = lastEvent(events, "rejected");
    stage = STAGE_OF[ev?.fromStatus] ?? 2;
    mode = "stop";
    label = "Not approved";
    note = detail && ev?.message ? ev.message : "We emailed you the reason and your options.";
  }

  const approvedAt = lastEvent(events, "approved")?.createdAt;
  const assessedEvent = lastEvent(events, "assessment_required");
  const doneDates = [
    submittedAt,
    lastEvent(events, "records_verified")?.createdAt,
    (assessedEvent || lastEvent(events, "approved"))?.createdAt,
    assessedEvent ? approvedAt : null,
    approvedAt,
  ];

  return STAGES.map((name, i) => {
    if (i < stage) {
      const sub = i === 3 && !assessedEvent ? "Not required" : formatShortDate(doneDates[i]) || "Done";
      return { label: name, sub, state: "done", icon: "check" };
    }
    if (i === stage) {
      if (mode === "warn") return { label, sub: note, state: "warn", icon: "alert" };
      if (mode === "stop") return { label, sub: note, state: "stop", icon: "x" };
      return {
        label: name,
        sub: `In progress · ${STAGE_NOTES[i] || ""}`.trim(),
        state: "current",
        icon: "clock",
      };
    }
    return { label: name, sub: "Waiting", state: "", icon: null };
  });
}
