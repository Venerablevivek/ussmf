import { cx } from "@/lib/format";
import { Seal } from "./Icon";
import FallbackImage from "./FallbackImage";

/** Round federation logo: the official image when present, the SVG seal underneath as fallback. */
export default function LogoSlot({ className, size = 42, priority = false }) {
  return (
    <span className={cx("logo-slot", className)}>
      <Seal />
      <FallbackImage
        src="/assets/logo.jpg"
        alt=""
        fill
        sizes={`${Math.max(size, 56) * 2}px`}
        priority={priority}
      />
    </span>
  );
}
