import Link from "next/link";
import { requirePageRole } from "@/server/auth/guards";
import { listMyCertificates } from "@/server/services/certificateService";
import { formatDate } from "@/lib/format";
import Reveal from "@/components/motion/Reveal";
import FloatBob from "@/components/motion/FloatBob";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import { CertificateStateBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import CertificatePaper from "@/components/certification/CertificatePaper";
import CertCopyActions from "@/components/certification/CertCopyActions";
import RenewButton from "@/components/dashboard/RenewButton";

export const metadata = { title: "My certificates" };

const NOTES = {
  valid: null,
  expiring: {
    tone: "sun",
    icon: "clock",
    text: "This certificate expires within 30 days. Renew now to avoid a gap.",
  },
  expired: {
    tone: "sun",
    icon: "clock",
    text: "This certificate has expired. Start a renewal to keep flying.",
  },
  suspended: {
    tone: "coral",
    icon: "alert",
    text: "This certificate is suspended. Verification shows it as not valid.",
  },
  revoked: { tone: "coral", icon: "x", text: "This certificate was revoked and is no longer valid." },
};

export default async function CertificatesPage() {
  const user = await requirePageRole(["athlete"], "/dashboard/certificates");
  const certificates = await listMyCertificates(user);

  return (
    <>
      <div className="page-head">
        <div>
          <Eyebrow tone="mint">My certificates</Eyebrow>
          <h1 style={{ marginTop: 12 }}>Your credentials</h1>
          <p>Download the PDF, share the verify link, or renew before expiry.</p>
        </div>
      </div>

      {certificates.length ? (
        <div className="stack" style={{ gap: 40 }}>
          {certificates.map((c) => {
            const note = NOTES[c.state];
            return (
              <div key={c.id} className="cert-show" style={{ marginTop: 0 }}>
                <Reveal className="paper-wrap">
                  <CertificatePaper
                    publicId={c.publicId}
                    athleteName={c.athleteName}
                    disciplineName={c.disciplineName}
                    certificateClass={c.certificateClass}
                    issuedAt={c.issuedAt}
                    expiresAt={c.expiresAt}
                    verifyUrl={c.verifyUrl}
                    label={`Certificate ${c.publicId}`}
                  />
                </Reveal>
                <Reveal className="cert-copy" delay={0.06}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <CertificateStateBadge state={c.state} />
                    <code style={{ fontFamily: "var(--f-mono)", fontSize: 13, fontWeight: 600 }}>
                      {c.publicId}
                    </code>
                  </div>
                  <h2 className="h2" style={{ fontSize: "clamp(26px,3vw,36px)" }}>
                    {c.disciplineName} · {c.certificateClass}
                  </h2>
                  <ul className="checklist">
                    <li>
                      <Bubble icon="cal" tone="lav" />
                      <span>
                        <b>Issued {formatDate(c.issuedAt)}.</b> Valid until {formatDate(c.expiresAt)}.
                      </span>
                    </li>
                    <li>
                      <Bubble icon="qr" tone="blue" />
                      <span>
                        <b>Verify link.</b> Organizers can scan the QR code or open the link to confirm
                        validity.
                      </span>
                    </li>
                  </ul>
                  {note ? (
                    <div className={`notice t-${note.tone}`}>
                      <Icon name={note.icon} />
                      <span>
                        {note.text}
                        {c.statusReason ? ` Reason: ${c.statusReason}` : ""}
                      </span>
                    </div>
                  ) : null}
                  <CertCopyActions certificateId={c.publicId} pdfHref={`/api/certificates/${c.id}/pdf`} />
                  <div>
                    <RenewButton
                      applicationId={c.applicationId}
                      primary={c.state === "expiring" || c.state === "expired"}
                    />
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      ) : (
        <Reveal className="panel clay empty">
          <FloatBob>
            <Bubble icon="medal" large tone="mint" />
          </FloatBob>
          <h3>No certificates yet</h3>
          <p>
            When a U.S.S.M.F. physician approves your application, your certificate appears here with its QR
            code.
          </p>
          <Link className="btn btn-primary" href="/dashboard">
            Check your applications <Icon name="arrow" className="arrow" />
          </Link>
        </Reveal>
      )}
    </>
  );
}
