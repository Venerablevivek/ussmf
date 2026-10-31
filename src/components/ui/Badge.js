import { cx, toneClass } from "@/lib/format";
import { STATUS_META } from "@/lib/statuses";

export default function Badge({ tone = "blue", className, children }) {
  return <span className={cx("badge", toneClass(tone), className)}>{children}</span>;
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, tone: "blue" };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

const CERT_STATES = {
  valid: { label: "Active", tone: "mint" },
  expiring: { label: "Expires soon", tone: "sun" },
  expired: { label: "Expired", tone: "sun" },
  suspended: { label: "Suspended", tone: "coral" },
  revoked: { label: "Revoked", tone: "coral" },
};

export function CertificateStateBadge({ state }) {
  const meta = CERT_STATES[state] || CERT_STATES.valid;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
