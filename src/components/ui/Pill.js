import { cx } from "@/lib/format";

/** White clay pill with the pulsing live dot, as in the hero. */
export default function Pill({ children, dot = true, className, ...props }) {
  return (
    <span className={cx("pill", className)} {...props}>
      {dot ? <i className="dot" /> : null} {children}
    </span>
  );
}
