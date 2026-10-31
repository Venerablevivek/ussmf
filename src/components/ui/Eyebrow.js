import { cx, toneClass } from "@/lib/format";
import { Icon } from "./Icon";

export default function Eyebrow({ tone = "blue", icon, className, style, children }) {
  return (
    <span className={cx("eyebrow", toneClass(tone), className)} style={style}>
      {icon ? <Icon name={icon} style={{ width: 16, height: 16 }} /> : null}
      {children}
    </span>
  );
}

export function Tag({ tone = "blue", icon, className, style, children }) {
  return (
    <span className={cx("tag", toneClass(tone), className)} style={style}>
      {icon ? <Icon name={icon} style={{ width: 14, height: 14 }} /> : null}
      {children}
    </span>
  );
}
