import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requirePageRole } from "@/server/auth/guards";
import { getApplicationForReview } from "@/server/services/applicationService";
import { auditTrailForApplication } from "@/server/services/auditService";
import { HttpError } from "@/server/http/errors";
import { federationName, levelName } from "@/lib/disciplines";
import { STATUS_META, buildTimeline } from "@/lib/statuses";
import { suggestedClassForApplication } from "@/lib/eligibility";
import { formatDate, formatDateTime, initials } from "@/lib/format";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import { CertificateStateBadge, StatusBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import StatusTimeline from "@/components/certification/StatusTimeline";
import DocumentViewer from "@/components/admin/DocumentViewer";
import DecisionPanel from "@/components/admin/DecisionPanel";
import AuditTrail from "@/components/admin/AuditTrail";
import { certificateState } from "@/server/services/certificateService";

export const metadata = { title: "Application review" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Kv({ items }) {
  return (
    <div className="kv">
      {items.map(([label, value]) => (
        <div key={label}>
          <small>{label}</small>
          <b>{value || "—"}</b>
        </div>
      ))}
    </div>
  );
}

export default async function ReviewApplicationPage({ params }) {
  const { id } = await params;
  await requirePageRole(["physician", "admin"], `/admin/applications/${id}`);
  if (!UUID.test(id)) notFound();
  let app;
  try {
    app = await getApplicationForReview(id);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) notFound();
    throw err;
  }
  const audit = await auditTrailForApplication(id);
  const a = app.athlete;
  const timeline = buildTimeline(
    { status: app.status, submittedAt: app.submittedAt, events: app.events },
    { detail: true },
  );
  const consents = app.consents || {};

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="link-btn" href="/admin/applications">
            <Icon name="arrow" style={{ transform: "scaleX(-1)" }} /> Review queue
          </Link>
          <h1 style={{ marginTop: 10 }}>
            {a.name} · {app.disciplineName}
          </h1>
          <p>
            <code style={{ fontFamily: "var(--f-mono)", fontWeight: 600 }}>{app.publicId}</code> · Submitted{" "}
            {formatDateTime(app.submittedAt)}
            {app.physician ? ` · ${app.physician}` : ""}
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid-2">
        <div className="stack">
          <section className="panel clay t-blue" aria-labelledby="athlete-h">
            <h2 id="athlete-h">Athlete</h2>
            <div className="verify-person">
              <span className="avatar">
                {initials(a.name)}
                {a.photoUrl ? (
                  <Image src={a.photoUrl} alt={`Photo of ${a.name}`} fill sizes="84px" unoptimized />
                ) : null}
              </span>
              <div>
                <b style={{ fontSize: 18 }}>{a.name}</b>
                <div style={{ color: "var(--ink-2)", fontSize: 14 }}>{a.email}</div>
              </div>
            </div>
            <Kv
              items={[
                ["Date of birth", `${formatDate(a.dateOfBirth)}${a.age !== null ? ` · age ${a.age}` : ""}`],
                ["Phone", a.phone],
                ["State", a.state],
                [
                  "Federation",
                  `${federationName(a.federation)}${a.memberNumber ? ` · ${a.memberNumber}` : ""}`,
                ],
                ["Level", levelName(app.level)],
                ["Experience", app.yearsExperience !== null ? `${app.yearsExperience} years` : null],
              ]}
            />
          </section>

          <section className="panel clay t-coral" aria-labelledby="medical-h">
            <h2 id="medical-h">
              Medical history{" "}
              <Eyebrow tone="coral" icon="lock">
                Confidential
              </Eyebrow>
            </h2>
            <div className="field">
              <span className="flabel">Conditions</span>
              <div className="chips-check">
                {app.conditions.length ? (
                  app.conditions.map((c) => (
                    <span
                      key={c}
                      className={c === "None" ? "tag t-mint" : "tag t-coral"}
                      style={{ fontSize: 13 }}
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
            <Kv
              items={[
                ["Current medications", app.medications],
                ["Past injuries or surgeries", app.injuries],
                ["Last full physical", formatDate(app.lastPhysicalDate)],
              ]}
            />
          </section>

          <section className="panel clay t-lav" aria-labelledby="docs-h">
            <h2 id="docs-h">Medical records</h2>
            <DocumentViewer documents={app.documents} />
          </section>

          <section className="panel clay" aria-labelledby="consent-h">
            <h2 id="consent-h">Consent &amp; signature</h2>
            <ul className="checklist">
              {[
                ["review", "Consents to physicians reviewing records"],
                ["accurate", "Confirms information is accurate and complete"],
                ["suspension", "Understands a certificate can be suspended"],
              ].map(([key, label]) => (
                <li key={key}>
                  <Bubble icon={consents[key] ? "check" : "x"} tone={consents[key] ? "mint" : "coral"} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            {app.signature ? (
              <Image
                className="sig-img"
                src={app.signature}
                alt={`Signature of ${a.name}`}
                width={320}
                height={90}
                unoptimized
              />
            ) : null}
            {consents.acceptedAt ? (
              <p style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                Signed {formatDateTime(consents.acceptedAt)}
              </p>
            ) : null}
          </section>
        </div>

        <aside className="stack">
          <section className="panel clay t-mint" aria-labelledby="decision-h">
            <h2 id="decision-h">Decision</h2>
            <DecisionPanel
              applicationId={app.id}
              status={app.status}
              suggestedClass={suggestedClassForApplication(app.discipline, app.level)}
              defaultValidityMonths={app.defaultValidityMonths}
            />
          </section>

          <section className="panel clay" aria-labelledby="progress-h">
            <h2 id="progress-h">Progress</h2>
            <StatusTimeline stages={timeline} />
          </section>

          <section className="panel clay t-sun" aria-labelledby="history-h">
            <h2 id="history-h">Athlete history</h2>
            {app.history.length || app.certificates.length ? (
              <ul className="audit">
                {app.certificates.map((c) => (
                  <li key={c.id}>
                    <Bubble icon="medal" tone="mint" />
                    <div>
                      <b>{c.public_id}</b> · {c.disciplineName} · {c.class}
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                        <CertificateStateBadge state={certificateState(c)} />
                        <time>
                          {formatDate(c.issued_at)} – {formatDate(c.expires_at)}
                        </time>
                      </div>
                    </div>
                  </li>
                ))}
                {app.history.map((h) => (
                  <li key={h.id}>
                    <Bubble icon="doc" tone={STATUS_META[h.status]?.tone} />
                    <div>
                      <Link href={`/admin/applications/${h.id}`}>
                        <b>{h.public_id}</b>
                      </Link>{" "}
                      · {h.disciplineName}
                      <time>
                        {STATUS_META[h.status]?.label} · submitted {formatDate(h.submitted_at)}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--ink-2)", fontSize: 14 }}>First application from this athlete.</p>
            )}
          </section>

          <section className="panel clay t-lav" aria-labelledby="events-h">
            <h2 id="events-h">Messages &amp; notes</h2>
            {app.events.some((e) => e.message) ? (
              <ul className="audit">
                {app.events
                  .filter((e) => e.message)
                  .reverse()
                  .map((e) => (
                    <li key={e.id}>
                      <Bubble
                        icon={e.actorRole === "athlete" ? "user" : "steth"}
                        tone={e.actorRole === "athlete" ? "blue" : "lav"}
                      />
                      <div>
                        <b>{e.actorName || "System"}</b> · {STATUS_META[e.toStatus]?.label}
                        <p style={{ margin: "4px 0 0", color: "var(--ink-2)" }}>{e.message}</p>
                        <time>{formatDateTime(e.createdAt)}</time>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p style={{ color: "var(--ink-2)", fontSize: 14 }}>No messages on this application.</p>
            )}
          </section>

          <section className="panel clay" aria-labelledby="audit-h">
            <h2 id="audit-h">Audit trail</h2>
            <AuditTrail entries={audit} />
          </section>
        </aside>
      </div>
    </>
  );
}
