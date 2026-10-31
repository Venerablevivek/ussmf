import { cx } from "@/lib/format";

/**
 * Labelled clay field. Pass `error` to show the design's coral state and message;
 * the message is linked to the control with aria-describedby.
 */
export function Field({ id, label, hint, error, className, style, children, as: Tag = "div" }) {
  return (
    <Tag className={cx("field", className)} style={style}>
      {label ? (
        <label htmlFor={id} className={!id ? "flabel" : undefined}>
          {label}
        </label>
      ) : null}
      {children}
      {hint ? (
        <span className="hint" id={id ? `${id}-hint` : undefined}>
          {hint}
        </span>
      ) : null}
      <span className="err" id={id ? `${id}-err` : undefined} role={error ? "alert" : undefined}>
        {error || ""}
      </span>
    </Tag>
  );
}

function describedBy(id, error, hint) {
  return [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
}

export function Input({ id, error, hint, className, ...props }) {
  return (
    <input
      id={id}
      className={cx("inp", error && "bad", className)}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={id ? describedBy(id, error, hint) : undefined}
      {...props}
    />
  );
}

export function Select({ id, error, hint, className, children, ...props }) {
  return (
    <select
      id={id}
      className={cx("inp", error && "bad", className)}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={id ? describedBy(id, error, hint) : undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ id, error, hint, className, ...props }) {
  return (
    <textarea
      id={id}
      className={cx("inp", error && "bad", className)}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={id ? describedBy(id, error, hint) : undefined}
      {...props}
    />
  );
}

export default Input;
