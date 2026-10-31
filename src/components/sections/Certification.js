import { appUrl } from "@/server/env";
import Reveal from "@/components/motion/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import Journey from "@/components/certification/Journey";
import EligibilityCheck from "@/components/certification/EligibilityCheck";
import StatusTracker from "@/components/certification/StatusTracker";
import VerifyCertificate from "@/components/certification/VerifyCertificate";
import CertificatePaper from "@/components/certification/CertificatePaper";
import CertCopyActions from "@/components/certification/CertCopyActions";

const SAMPLE_ID = "USSMF-AS-2026-10482";

export default function Certification() {
  return (
    <section className="sec cert-sec" id="certification">
      <div
        className="blob"
        style={{ width: 520, height: 520, background: "var(--mint-t)", left: -200, top: 200 }}
      />
      <div className="wrap">
        <Reveal className="sec-head center">
          <Eyebrow tone="blue">Medical Fitness Certificate</Eyebrow>
          <h2 className="h2">
            Your path to <span className="grad">certified fitness.</span>
          </h2>
          <p className="sub">
            Apply online, share your medical records securely, and receive a digital certificate that event
            organizers and federations can verify in seconds.
          </p>
        </Reveal>

        <Journey />

        <div className="cert-tools">
          <Reveal className="tool clay" id="eligibility">
            <EligibilityCheck />
          </Reveal>
          <div className="cert-side">
            <Reveal className="tool clay" id="status" delay={0.06}>
              <StatusTracker />
            </Reveal>
            <Reveal className="tool clay" id="verify" delay={0.12}>
              <VerifyCertificate />
            </Reveal>
          </div>
        </div>

        <div className="cert-show">
          <Reveal className="paper-wrap">
            <CertificatePaper
              id="paper"
              publicId={SAMPLE_ID}
              athleteName="Alex Rivera"
              disciplineName="Paragliding"
              certificateClass="Class 2 · Sport"
              issuedAt="2026-10-14"
              expiresAt="2027-10-13"
              verifyUrl={`${appUrl()}/verify/${SAMPLE_ID}`}
            />
          </Reveal>
          <Reveal className="cert-copy" delay={0.08}>
            <Eyebrow tone="mint" style={{ justifySelf: "start" }}>
              Your certificate
            </Eyebrow>
            <h2 className="h2" style={{ fontSize: "clamp(30px,3.6vw,44px)" }}>
              A credential built to be trusted.
            </h2>
            <ul className="checklist">
              <li>
                <Bubble icon="check" tone="mint" />
                <span>
                  <b>QR verification.</b> Organizers scan and confirm validity on the spot.
                </span>
              </li>
              <li>
                <Bubble icon="lock" tone="blue" />
                <span>
                  <b>Security pattern.</b> Guilloche linework and a holographic layer that shifts as you move.
                </span>
              </li>
              <li>
                <Bubble icon="cal" tone="lav" />
                <span>
                  <b>Clear validity.</b> Issue and expiry dates with renewal reminders.
                </span>
              </li>
            </ul>
            <CertCopyActions certificateId={SAMPLE_ID} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
