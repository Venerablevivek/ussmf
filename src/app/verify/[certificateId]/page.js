import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { certificateIdSchema } from "@/lib/validators";
import { formatDate, initials } from "@/lib/format";
import { verifyCertificate } from "@/server/services/certificateService";
import { enforceRateLimit } from "@/server/services/rateLimit";
import { HttpError } from "@/server/http/errors";
import Entrance from "@/components/motion/Entrance";
import Eyebrow from "@/components/ui/Eyebrow";
import LogoSlot from "@/components/ui/LogoSlot";
import { Icon } from "@/components/ui/Icon";
import VerifyResult from "@/components/certification/VerifyResult";

// The QR code target. Rendered on every request so suspensions and revocations show immediately.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { certificateId } = await params;
  return {
    title: `Verify ${decodeURIComponent(certificateId).toUpperCase()}`,
    robots: { index: false, follow: false },
  };
}

async function lookup(rawId) {
  const parsed = certificateIdSchema.safeParse(decodeURIComponent(rawId));
  if (!parsed.success) return { result: "not_found", certificateId: decodeURIComponent(rawId).slice(0, 40) };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  try {
    await enforceRateLimit("verify", `ip:${ip}`);
  } catch (err) {
    if (err instanceof HttpError)
      return { result: "rate_limited", message: err.message, certificateId: parsed.data };
    throw err;
  }
  return verifyCertificate(parsed.data);
}

export default async function VerifyCertificatePage({ params }) {
  const { certificateId } = await params;
  const result = await lookup(certificateId);
  const found = result.result !== "not_found" && result.result !== "rate_limited";

  return (
    <div className="app-main cert-sec">
      <div className="wrap">
        <Entrance variant="slidein" className="clay verify-page-card">
          <div className="p-top">
            <span className="brand">
              <LogoSlot size={48} />
              <span>
                U.S.S.M.F.<small>Certificate verification</small>
              </span>
            </span>
            <Eyebrow tone="lav" icon="qr">
              Live check
            </Eyebrow>
          </div>

          {result.result === "rate_limited" ? (
            <div className="notice t-sun" role="alert">
              <Icon name="clock" />
              <span>{result.message}</span>
            </div>
          ) : (
            <VerifyResult result={{ ...result, photoUrl: null }} />
          )}

          {found ? (
            <>
              <div className="verify-person">
                <span className="avatar">
                  {initials(result.athleteName)}
                  {result.photoUrl ? (
                    <Image
                      src={result.photoUrl}
                      alt={`Photo of ${result.athleteName}`}
                      fill
                      sizes="84px"
                      unoptimized
                    />
                  ) : null}
                </span>
                <div>
                  <div className="p-name" style={{ textAlign: "left", fontSize: "clamp(24px,3.2vw,34px)" }}>
                    {result.athleteName}
                  </div>
                  <p style={{ color: "var(--ink-2)", fontSize: 14 }}>
                    Compare the photo and name with the athlete’s ID.
                  </p>
                </div>
              </div>
              <div className="p-grid">
                <div>
                  <small>Discipline</small>
                  <b>{result.discipline}</b>
                </div>
                <div>
                  <small>Class</small>
                  <b>{result.certificateClass}</b>
                </div>
                <div>
                  <small>Issued</small>
                  <b>{formatDate(result.issuedAt)}</b>
                </div>
                <div>
                  <small>Expires</small>
                  <b>{formatDate(result.expiresAt)}</b>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
                Certificate <code style={{ fontFamily: "var(--f-mono)" }}>{result.certificateId}</code> ·
                checked {formatDate(new Date())}. This page shows identity and validity only; medical
                information is never disclosed.
              </p>
            </>
          ) : null}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-glass btn-sm" href="/verify">
              <Icon name="search" /> Verify another certificate
            </Link>
            <Link className="link-btn" href="/">
              About U.S.S.M.F. <Icon name="arrow" />
            </Link>
          </div>
        </Entrance>
      </div>
    </div>
  );
}
