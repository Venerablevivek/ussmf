import Link from "next/link";
import { cx } from "@/lib/format";
import { Icon } from "./Icon";

/**
 * Clay button from the design. variant: primary | glass | mint | coral | plain.
 * Renders a Link when `href` is set. `icon` goes before the label; `arrow` adds the sliding arrow.
 */
export default function Button({
  variant = "primary",
  size,
  href,
  icon,
  arrow = false,
  className,
  children,
  type = "button",
  ...props
}) {
  const classes = cx("btn", variant !== "plain" && `btn-${variant}`, size === "sm" && "btn-sm", className);
  const content = (
    <>
      {icon ? <Icon name={icon} /> : null}
      {children}
      {arrow ? <Icon name="arrow" className="arrow" /> : null}
    </>
  );
  if (href) {
    const external = /^https?:|^mailto:/.test(href) || href.startsWith("/api/");
    if (external) {
      return (
        <a href={href} className={classes} {...props}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  );
}

export function LinkButton({ href, children, className, icon = "arrow", ...props }) {
  const Tag = href?.startsWith("/") && !href.startsWith("/api/") ? Link : "a";
  return (
    <Tag href={href} className={cx("link-btn", className)} {...props}>
      {children} <Icon name={icon} />
    </Tag>
  );
}
