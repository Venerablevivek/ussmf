/** Clay range slider with the value read out on the right. */
export default function Range({ id, value, min = 0, max = 30, onChange, format = (v) => v }) {
  return (
    <div className="range-row">
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={String(format(value))}
      />
      <output htmlFor={id}>{format(value)}</output>
    </div>
  );
}
