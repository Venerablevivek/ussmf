import { formatDate } from "@/lib/format";
import Tilt from "@/components/motion/Tilt";
import LogoSlot from "@/components/ui/LogoSlot";
import QrCode from "@/components/ui/QrCode";
import { Icon } from "@/components/ui/Icon";
import Guilloche from "./Guilloche";

/**
 * The full holographic certificate from the design (guilloche, sheen, gradient border).
 * Used for the homepage sample and for real certificates in the athlete dashboard.
 */
export default function CertificatePaper({
  publicId,
  athleteName,
  disciplineName,
  certificateClass,
  issuedAt,
  expiresAt,
  verifyUrl,
  physicianName,
  label = "Sample certificate",
  id,
}) {
  return (
    <Tilt as="article" className="paper" id={id} aria-label={label} maxX={8} maxY={10}>
      <Guilloche />
      <div className="holo2" />
      <div className="paper-border" />
      <div className="paper-in">
        <div className="p-top">
          <span className="brand">
            <LogoSlot size={56} />
            <span>
              U.S.S.M.F.<small>United States Sports Medicine Federation</small>
            </span>
          </span>
          <span className="p-id">ID {publicId}</span>
        </div>
        <div className="p-title">
          <small>Air Sports Division</small>
          <h3>Medical Fitness Certificate</h3>
          <p>
            This certifies that the athlete named below has been medically reviewed and found fit to
            participate in
          </p>
        </div>
        <div className="p-name">{athleteName}</div>
        <div className="p-grid">
          <div>
            <small>Discipline</small>
            <b>{disciplineName}</b>
          </div>
          <div>
            <small>Class</small>
            <b>{certificateClass}</b>
          </div>
          <div>
            <small>Issued</small>
            <b>{formatDate(issuedAt)}</b>
          </div>
          <div>
            <small>Expires</small>
            <b>{formatDate(expiresAt)}</b>
          </div>
        </div>
        <div className="p-foot">
          <div className="sig">
            <svg viewBox="0 0 160 44" aria-hidden="true">
              <path
                d="M6 30c10-14 18-22 22-18s-8 20-2 20 12-22 18-20-2 18 4 18 10-14 16-14 2 12 8 10 10-10 18-8 6 8 14 6 20-6 32-8"
                fill="none"
                stroke="#1E3A8A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>
              {physicianName ? `${physicianName} · ` : "Reviewing physician · "}U.S.S.M.F. Medical Board
            </span>
          </div>
          <span className="fit-badge" style={{ fontSize: 13, padding: "10px 16px" }}>
            <Icon name="check" />
            FIT TO FLY
          </span>
          <QrCode value={verifyUrl} label={`QR code linking to the verification page for ${publicId}`} />
        </div>
      </div>
    </Tilt>
  );
}
