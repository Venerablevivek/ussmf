/** The design's clay checkbox with a label. */
export default function Checkbox({ id, checked, onChange, children, ...props }) {
  return (
    <label className="chk" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        {...props}
      />
      <span>{children}</span>
    </label>
  );
}
