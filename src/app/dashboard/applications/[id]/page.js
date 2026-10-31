import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageRole } from "@/server/auth/guards";
import { getMyApplication } from "@/server/services/applicationService";
import { HttpError } from "@/server/http/errors";
import { disciplineName, federationName, levelName } from "@/lib/disciplines";
import { STATUS_META } from "@/lib/statuses";
import { formatDate, formatDateTime } from "@/lib/format";
import Reveal from "@/components/motion/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import { StatusBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import StatusTimeline from "@/components/certification/StatusTimeline";
import RespondPanel from "@/components/dashboard/RespondPanel";
import DocumentList from "@/components/dashboard/DocumentList";

export const metadata = { title: "Application" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ApplicationPage({ params }) {
  const { id } = await params;
  const user = await requirePageRole(["athlete"], `/dashboard/applications/${id}`);
  if (!UUID.test(id)) notFound();
  let app;
  try {
    app = await getMyApplication(user, id);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) notFound();
    throw err;
  }
  const v = app.values;
  const tone = STATUS_META[app.status]?.tone || "blue";

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="link-btn" href="/dashboard">
            <Icon name="arrow" style={{ transform: "scaleX(-1)" }} /> All applications
          </Link>
          <h1 style={{ marginTop: 10 }}>{app.discipline ? disciplineName(app.discipline) : "Application"}</h1>
          <p>
            <code style={{ fontFamily: "var(--f-mono)", fontWeight: 600 }}>{app.publicId}</code>
            {app.submittedAt ? ` · Submitted ${formatDate(app.submittedAt)}` : " · Draft"}
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid-2">
        <div className="stack">
          {app.infoRequest ? (
            <Reveal className="panel clay t-sun">
              <h2>
                Your physician needs more information
                <Eyebrow tone="sun">Action needed</Eyebrow>
              </h2>
              <div className="notice t-sun">
                <Icon name="steth" />
                <span>
                  <b>“{app.infoRequest.message}”</b>
                  <br />
                  <small>Requested {formatDateTime(app.infoRequest.createdAt)}</small>
                </span>
              </div>
              <RespondPanel applicationId={app.id} documents={app.documents} />
            </Reveal>
          ) : null}

          <Reveal className={`panel clay t-${tone}`}>
            <h2>Progress</h2>
            <StatusTimeline stages={app.timeline} />
            {app.status === "draft" ? (
              <Link className="btn btn-primary btn-sm" href="/apply" style={{ justifySelf: "start" }}>
                Continue application <Icon name="arrow" className="arrow" />
              </Link>
            ) : null}
            {app.certificate ? (
              <Link
                className="btn btn-mint btn-sm"
                href="/dashboard/certificates"
                style={{ justifySelf: "start" }}
              >
                <Icon name="medal" /> View certificate {app.certificate.publicId}
              </Link>
            ) : null}
          </Reveal>

          {!app.infoRequest ? (
            <Reveal className="panel clay">
              <h2>Medical records</h2>
              <DocumentList documents={app.documents} />
            </Reveal>
          ) : null}
        </div>

        <aside className="stack">
          <Reveal className="panel clay">
            <h2>Your details</h2>
            <div className="kv">
              <div>
                <small>Name</small>
                <b>{v.legalName || "—"}</b>
              </div>
              <div>
                <small>Date of birth</small>
                <b>{formatDate(v.dateOfBirth)}</b>
              </div>
              <div>
                <small>State</small>
                <b>{v.state || "—"}</b>
              </div>
              <div>
                <small>Level</small>
                <b>{v.level ? levelName(v.level) : "—"}</b>
              </div>
              <div>
                <small>Federation</small>
                <b>
                  {federationName(v.federation)}
                  {v.memberNumber ? ` · ${v.memberNumber}` : ""}
                </b>
              </div>
              <div>
                <small>Experience</small>
                <b>{v.yearsExperience} years</b>
              </div>
            </div>
          </Reveal>
          <Reveal className="panel clay t-lav" delay={0.06}>
            <h2>Messages</h2>
            {app.events.some((e) => e.message) ? (
              <ul className="audit">
                {app.events
                  .filter((e) => e.message)
                  .reverse()
                  .map((e) => (
                    <li key={e.id}>
                      <Bubble icon={e.byAthlete ? "user" : "steth"} tone={e.byAthlete ? "blue" : "lav"} />
                      <div>
                        <b>{e.byAthlete ? "You" : "Your physician"}</b> · {STATUS_META[e.toStatus]?.label}
                        <p style={{ margin: "4px 0 0", color: "var(--ink-2)" }}>{e.message}</p>
                        <time>{formatDateTime(e.createdAt)}</time>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p style={{ color: "var(--ink-2)", fontSize: 14 }}>No messages yet.</p>
            )}
          </Reveal>
        </aside>
      </div>
    </>
  );
}
