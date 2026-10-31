import { cx, toneClass } from "@/lib/format";

/** Clay surface. size "sm" uses the smaller clay recipe; tone sets t-blue / t-coral / t-mint / t-sun / t-lav. */
export default function ClayCard({ as: Tag = "div", tone, size, className, children, ...props }) {
  return (
    <Tag className={cx(size === "sm" ? "clay-sm" : "clay", toneClass(tone), className)} {...props}>
      {children}
    </Tag>
  );
}
