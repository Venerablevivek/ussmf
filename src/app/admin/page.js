import Link from "next/link";
import { requirePageRole } from "@/server/auth/guards";
import { listApplications, reviewStats } from "@/server/services/applicationService";
import { STATUS_META } from "@/lib/statuses";
import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";
import Eyebrow from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import ReviewQueue from "@/components/admin/ReviewQueue";

export const metadata = { title: "Overview" };

const TILES = [
  "submitted",
  "records_verified",
  "under_review",
  "assessment_required",
  "info_requested",
  "approved",
  "rejected",
];

function formatHours(hours) {
  if (hours === null) return "—";
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${(hours / 24).toFixed(1)} days`;
}

export default async function AdminOverviewPage() {
  const user = await requirePageRole(["physician", "admin"], "/admin");
  const [stats, queue] = await Promise.all([
    reviewStats(),
    listApplications({ status: "open", sort: "submitted_asc", page: 1, pageSize: 8 }),
  ]);

  return (
    <>
      <div className="page-head">
        <div>
          <Eyebrow tone="blue" icon="steth">
            Review portal
          </Eyebrow>
          <h1 style={{ marginTop: 12 }}>
            Good to see you, {user.role === "physician" ? `Dr. ${user.last_name}` : user.first_name}.
          </h1>
          <p>
            {queue.total
              ? `${queue.total} application${queue.total === 1 ? "" : "s"} waiting on a physician.`
              : "The review queue is clear."}
          </p>
        </div>
        <Link className="btn btn-primary" href="/admin/applications?status=open&sort=submitted_asc">
          Open the queue <Icon name="arrow" className="arrow" />
        </Link>
      </div>

      <div className="stat-tiles" style={{ marginBottom: 28 }}>
        {TILES.map((status, i) => (
          <Reveal key={status} delay={i * 0.04}>
            <Link
              href={`/admin/applications?status=${status}`}
              className={`stat-tile clay t-${STATUS_META[status].tone}`}
              style={{ display: "grid" }}
            >
              <CountUp to={stats.byStatus[status] || 0} />
              <span>{STATUS_META[status].label}</span>
            </Link>
          </Reveal>
        ))}
        <Reveal delay={0.3}>
          <div className="stat-tile clay t-lav">
            <b>{formatHours(stats.averageReviewHours)}</b>
            <span>Average review time</span>
          </div>
        </Reveal>
        <Reveal delay={0.34}>
          <Link
            href="/admin/certificates?state=active"
            className="stat-tile clay t-mint"
            style={{ display: "grid" }}
          >
            <CountUp to={stats.activeCertificates} />
            <span>Active certificates</span>
          </Link>
        </Reveal>
      </div>

      <div className="page-head" style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Review queue · oldest first</h2>
        <Link className="link-btn" href="/admin/applications">
          All applications <Icon name="arrow" />
        </Link>
      </div>
      <ReviewQueue items={queue.items} empty="Nothing is waiting for review right now." />
    </>
  );
}
