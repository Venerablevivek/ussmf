export const NONE_CONDITION = "None";

export const CONDITIONS = [
  NONE_CONDITION,
  "Heart or blood pressure",
  "Asthma or respiratory",
  "Epilepsy or seizures",
  "Vision correction",
  "Hearing or inner ear",
  "Diabetes",
  "Back or spine",
  "Prior concussion",
  "Other",
];

// "None" is exclusive: picking it clears everything else, picking anything else clears "None".
export function toggleCondition(selected, value, checked) {
  if (!checked) return selected.filter((c) => c !== value);
  if (value === NONE_CONDITION) return [NONE_CONDITION];
  return [...selected.filter((c) => c !== NONE_CONDITION && c !== value), value];
}
