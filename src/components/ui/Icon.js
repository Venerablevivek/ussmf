import { cx } from "@/lib/format";

/** <Icon name="arrow"/> renders a symbol from the design's sprite (see IconSprite). */
export function Icon({ name, className, style, title }) {
  return (
    <svg
      className={cx("ico", className)}
      style={style}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <use href={`#i-${name}`} />
    </svg>
  );
}

/** The U.S.S.M.F. seal symbol. */
export function Seal({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <use href="#seal" />
    </svg>
  );
}

export default Icon;
