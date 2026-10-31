/** Group of toggle chips (checkboxes styled as clay pills). */
export default function ChipCheck({ name, options, value = [], onToggle, describedBy }) {
  return (
    <div className="chips-check" role="group" aria-describedby={describedBy}>
      {options.map((option, i) => (
        <label key={option}>
          <input
            type="checkbox"
            id={`${name}${i}`}
            name={name}
            value={option}
            checked={value.includes(option)}
            onChange={(e) => onToggle(option, e.target.checked)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}
