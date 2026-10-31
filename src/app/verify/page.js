import Reveal from "@/components/motion/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import VerifyCertificate from "@/components/certification/VerifyCertificate";

export const metadata = {
  title: "Verify a certificate",
  description:
    "Check whether a U.S.S.M.F. Air Sports Medical Fitness Certificate is valid. Enter the ID printed under the QR code.",
};

export default function VerifyPage() {
  return (
    <div className="app-main cert-sec">
      <div className="wrap">
        <Reveal className="sec-head center">
          <Eyebrow tone="lav" icon="qr">
            Certificate verification
          </Eyebrow>
          <h1 className="h2">
            Verify a <span className="grad">certificate.</span>
          </h1>
          <p className="sub">
            For event organizers, clubs and federations. Enter the ID printed under the QR code.
          </p>
        </Reveal>
        <Reveal className="tool clay verify-page-card" delay={0.06}>
          <VerifyCertificate initialId="" showHead={false} />
        </Reveal>
      </div>
    </div>
  );
}
