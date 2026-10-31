import Link from "next/link";
import FloatBob from "@/components/motion/FloatBob";
import Entrance from "@/components/motion/Entrance";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="app-main">
      <div className="wrap">
        <Entrance
          variant="slidein"
          className="panel clay empty"
          style={{ maxWidth: 640, marginInline: "auto" }}
        >
          <FloatBob>
            <span className="bubble lg t-blue">
              <Icon name="plane" />
            </span>
          </FloatBob>
          <span className="error-code" aria-hidden="true">
            404
          </span>
          <h1 style={{ fontSize: "clamp(26px,3vw,34px)", fontWeight: 800 }}>This page flew off course.</h1>
          <p>The link may be old or mistyped. Head back home, or verify a certificate by its ID.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn btn-primary" href="/">
              Back to home <Icon name="arrow" className="arrow" />
            </Link>
            <Link className="btn btn-glass" href="/verify">
              <Icon name="qr" /> Verify a certificate
            </Link>
          </div>
        </Entrance>
      </div>
    </div>
  );
}
