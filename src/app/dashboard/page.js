import Link from "next/link";
import { requirePageRole } from "@/server/auth/guards";
import { listMyApplications } from "@/server/services/applicationService";
import { listMyCertificates } from "@/server/services/certificateService";
import Reveal from "@/components/motion/Reveal";
import FloatBob from "@/components/motion/FloatBob";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import { Icon } from "@/components/ui/Icon";
import { CertificateStateBadge } from "@/components/ui/Badge";
import ApplicationCard from "@/components/dashboard/ApplicationCard";
import { formatDate } from "@/lib/format";

export const metadata = { title: "My applications" };

export default async function DashboardPage() {
  const user = await requirePageRole(["athlete"], "/dashboard");
  const [applications, certificates] = await Promise.all([
    listMyApplications(user),
    listMyCertificates(user),
  ]);
  const needsAction = applications.filter((a) => a.status === "info_requested");
  const hasDraft = applications.some((a) => a.status === "draft");

  return (
    <>
      <div className="page-head">
        <div>
          <Eyebrow tone="blue">Athlete dashboard</Eyebrow>
          <h1 style={{ marginTop: 12 }}>Hi, {user.first_name}.</h1>
          <p>Track your applications and keep your certificates close at hand.</p>
        </div>
        <Link className="btn btn-primary" href="/apply">
          {hasDraft ? "Continue your application" : "Start a new application"}{" "}
          <Icon name="arrow" className="arrow" />
        </Link>
      </div>

      {needsAction.length ? (
        <div className="notice t-sun" role="status" style={{ marginBottom: 22 }}>
          <Icon name="alert" />
          <span>
            <b>Your physician needs more information</b> on {needsAction.map((a) => a.publicId).join(", ")}.
            Open the application to read the request and reply.
          </span>
        </div>
      ) : null}

      <div className="grid-2">
        <div className="stack">
          {applications.length ? (
            applications.map((app) => <ApplicationCard key={app.id} app={app} />)
          ) : (
            <Reveal className="panel clay empty">
              <FloatBob>
                <Bubble icon="doc" large tone="blue" />
              </FloatBob>
              <h3>No applications yet</h3>
              <p>
                Apply for your U.S.S.M.F. Medical Fitness Certificate. It takes about 10 minutes and saves as
                you go.
              </p>
              <Link className="btn btn-primary" href="/apply">
                Start application <Icon name="arrow" className="arrow" />
              </Link>
            </Reveal>
          )}
        </div>
        <aside className="stack">
          <Reveal className="panel clay t-mint">
            <h2>
              My certificates
              <Link className="link-btn" href="/dashboard/certificates">
                View all <Icon name="arrow" />
              </Link>
            </h2>
            {certificates.length ? (
              <ul className="audit">
                {certificates.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Bubble
                      icon="medal"
                      tone={
                        c.state === "valid"
                          ? "mint"
                          : c.state === "expiring" || c.state === "expired"
                            ? "sun"
                            : "coral"
                      }
                    />
                    <div>
                      <b>{c.disciplineName}</b> · {c.certificateClass}
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                          marginTop: 4,
                        }}
                      >
                        <CertificateStateBadge state={c.state} />
                        <time>Valid until {formatDate(c.expiresAt)}</time>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--ink-2)", fontSize: 14.5 }}>
                Your certificate appears here as soon as a physician approves your application.
              </p>
            )}
          </Reveal>
          <Reveal className="panel clay t-lav" delay={0.06}>
            <h2>How review works</h2>
            <ol className="audit">
              {[
                ["upload", "Records check", "1–2 business days after you submit."],
                ["steth", "Physician review", "Usually 3–5 business days."],
                ["pulse", "Fitness assessment", "Only when your physician asks for one."],
                ["medal", "Certificate issued", "Download the PDF and share the QR code."],
              ].map(([icon, title, text]) => (
                <li key={title}>
                  <Bubble icon={icon} />
                  <div>
                    <b>{title}</b>
                    <time>{text}</time>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </aside>
      </div>
    </>
  );
}
