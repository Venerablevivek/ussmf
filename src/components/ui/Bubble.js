import { cx, toneClass } from "@/lib/format";
import { Icon } from "./Icon";

/** Inflated clay icon bubble. Inherits tone from a parent t-* class unless `tone` is given. */
export default function Bubble({ icon, tone, large = false, className, style }) {
  return (
    <span className={cx("bubble", large && "lg", toneClass(tone), className)} style={style}>
      <Icon name={icon} />
    </span>
  );
}
