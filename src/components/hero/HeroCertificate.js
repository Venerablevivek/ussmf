import LogoSlot from "@/components/ui/LogoSlot";
import QrCode from "@/components/ui/QrCode";
import { Icon } from "@/components/ui/Icon";

/** The sample certificate card at the center of the hero scene (QR links to the live verify page). */
export default function HeroCertificate({ verifyUrl }) {
  return (
    <article className="hcert" id="hcert" aria-label="Sample U.S.S.M.F. Medical Fitness Certificate">
      <div className="holo" />
      <div className="hc-top">
        <LogoSlot size={44} />
        <div className="hc-org">
          U.S.S.M.F.<small>Air Sports Division</small>
        </div>
        <span className="demo-tag" style={{ marginLeft: "auto" }}>
          Sample
        </span>
      </div>
      <div className="hc-title">Medical Fitness Certificate</div>
      <div className="hc-body">
        <div className="avatar">AR</div>
        <div className="hc-meta">
          <b>Alex Rivera</b>
          <span>Paragliding · Class 2 · Sport</span>
          <span>Valid to Oct 2027</span>
        </div>
      </div>
      <div className="hc-foot">
        <span className="fit-badge">
          <Icon name="check" />
          FIT TO FLY
        </span>
        <QrCode value={verifyUrl} />
      </div>
    </article>
  );
}
