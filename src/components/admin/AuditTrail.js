import { formatDateTime } from "@/lib/format";
import { STATUS_META } from "@/lib/statuses";
import Bubble from "@/components/ui/Bubble";

const ACTION_LOOK = {
  "document.viewed": { icon: "eye", tone: "lav", label: "Viewed a document" },
  "document.uploaded": { icon: "upload", tone: "blue", label: "Uploaded a document" },
  "document.deleted": { icon: "x", tone: "coral", label: "Removed a document" },
  "document.upload_started": { icon: "upload", tone: "blue", label: "Started an upload" },
  "certificate.downloaded": { icon: "download", tone: "mint", label: "Downloaded the certificate PDF" },
  "certificate.suspend": { icon: "alert", tone: "sun", label: "Suspended the certificate" },
  "certificate.reinstate": { icon: "check", tone: "mint", label: "Reinstated the certificate" },
  "certificate.revoke": { icon: "x", tone: "coral", label: "Revoked the certificate" },
  "application.created": { icon: "doc", tone: "blue", label: "Started the application" },
  "application.renewal_started": { icon: "refresh", tone: "blue", label: "Started a renewal" },
  "application.submitted": { icon: "check", tone: "blue", label: "Submitted the application" },
  "application.info_provided": { icon: "mail", tone: "blue", label: "Responded to the information request" },
};

function describe(entry) {
  const known = ACTION_LOOK[entry.action];
  if (known) return known;
  const to = entry.metadata?.to;
  if (entry.action.startsWith("application.") && to) {
    return {
      icon: "steth",
      tone: STATUS_META[to]?.tone || "blue",
      label: `Moved to “${STATUS_META[to]?.label || to}”`,
    };
  }
  return { icon: "clock", tone: "blue", label: entry.action };
}

/** Who did what, when, and from which IP — status changes, decisions, document views, certificate actions. */
export default function AuditTrail({ entries }) {
  if (!entries.length)
    return <p style={{ color: "var(--ink-2)", fontSize: 14 }}>No activity recorded yet.</p>;
  return (
    <ol className="audit">
      {entries.map((e) => {
        const look = describe(e);
        const who = e.first_name
          ? `${e.role === "physician" ? "Dr. " : ""}${e.first_name} ${e.last_name}`
          : "System";
        return (
          <li key={e.id}>
            <Bubble icon={look.icon} tone={look.tone} />
            <div>
              <b>{who}</b> {look.label.charAt(0).toLowerCase() + look.label.slice(1)}
              {e.metadata?.certificateId ? ` · ${e.metadata.certificateId}` : ""}
              <time>
                {formatDateTime(e.created_at)}
                {e.ip ? ` · ${e.ip}` : ""}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
