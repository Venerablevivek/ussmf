import Link from "next/link";
import { formatDate } from "@/lib/format";
import { STATUS_META } from "@/lib/statuses";
import { StatusBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import StatusTimeline from "@/components/certification/StatusTimeline";

/** One application on the athlete dashboard, with the design's clay status timeline. */
export default function ApplicationCard({ app }) {
  const tone = STATUS_META[app.status]?.tone || "blue";
  return (
    <article className={`panel clay t-${tone}`}>
      <div className="status-head">
        <div>
          <b>{app.disciplineName === "—" ? "Discipline not chosen yet" : app.disciplineName}</b>{" "}
          <span style={{ color: "var(--ink-2)" }}>
            ·{" "}
            {app.submittedAt
              ? `Submitted ${formatDate(app.submittedAt)}`
              : `Started ${formatDate(app.createdAt)}`}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <StatusBadge status={app.status} />
          <code>{app.publicId}</code>
        </div>
      </div>
      <StatusTimeline stages={app.timeline} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {app.status === "draft" ? (
          <Link className="btn btn-primary btn-sm" href="/apply">
            Continue application <Icon name="arrow" className="arrow" />
          </Link>
        ) : (
          <Link
            className={app.status === "info_requested" ? "btn btn-primary btn-sm" : "btn btn-glass btn-sm"}
            href={`/dashboard/applications/${app.id}`}
          >
            {app.status === "info_requested" ? "Respond to your physician" : "View details"}{" "}
            <Icon name="arrow" className="arrow" />
          </Link>
        )}
      </div>
    </article>
  );
}
