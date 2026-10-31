import { cx } from "@/lib/format";

/** Gentle infinite float (the design's CSS `bob` keyframes; stops with reduced motion). */
export default function FloatBob({ as: Tag = "div", duration = 6, delay = 0, className, style, children }) {
  return (
    <Tag
      className={cx(className)}
      style={{ ...style, animation: `bob ${duration}s ease-in-out infinite`, animationDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}
