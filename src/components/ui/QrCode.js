import QRCode from "qrcode";
import { cx } from "@/lib/format";

/** Real, scannable QR code as inline SVG, drawn like the design's QR tiles. */
export default function QrCode({ value, className, label }) {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
  const n = modules.size;
  let d = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (modules.data[y * n + x]) d += `M${x} ${y}h1v1h-1z`;
  }
  return (
    <div
      className={cx("qr", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    >
      <svg viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
        <path fill="#0F1B3D" d={d} />
      </svg>
    </div>
  );
}
