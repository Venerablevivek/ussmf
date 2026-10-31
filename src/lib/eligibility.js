// Eligibility rules from the design. Runs in the browser only; nothing is saved or sent.
import { getDiscipline } from "./disciplines";

export const AGE_OPTIONS = [
  { id: "u16", label: "Under 16" },
  { id: "16", label: "16–17" },
  { id: "adult", label: "18–59" },
  { id: "60", label: "60+" },
];

export const LEVEL_OPTIONS = [
  { id: "rec", label: "Recreational" },
  { id: "club", label: "Club" },
  { id: "nat", label: "National" },
  { id: "intl", label: "International" },
];

export const CONDITION_OPTIONS = [
  { id: "no", label: "No" },
  { id: "yes", label: "Yes" },
  { id: "unsure", label: "Not sure" },
];

export const DEFAULT_ANSWERS = { disc: "paragliding", age: "adult", level: "club", cond: "no" };

const LEVEL_CODES = { recreational: "rec", club: "club", national: "nat", international: "intl" };

export function certificateClassFor(disciplineId, level) {
  if (level === "intl" || level === "nat" || disciplineId === "aerobatics") return "Class 1 · Elite";
  if (level === "club") return "Class 2 · Sport";
  return "Class 3 · Recreational";
}

// Default class a physician starts from when approving an application.
export function suggestedClassForApplication(disciplineId, level) {
  const cls = certificateClassFor(disciplineId, LEVEL_CODES[level] || level);
  if (cls === "Class 2 · Sport" && disciplineId === "ballooning") return "Class 2 · Pilot";
  return cls;
}

export function evaluateEligibility({ disc, age, level, cond }) {
  const discipline = getDiscipline(disc);
  const cls = certificateClassFor(disc, level);
  let tone = "mint";
  let title = "You look eligible to apply";
  const docs = ["Physical exam from the last 12 months", "Vision test", "Resting ECG"];
  if (cond === "yes") {
    tone = "sun";
    title = "Eligible, with specialist review";
    docs.push("Specialist report for your condition");
  }
  if (cond === "unsure") {
    tone = "blue";
    title = "Eligible to apply";
    docs.push("Any records you have, our physicians will advise");
  }
  const notes = [];
  if (age === "u16" || age === "16") notes.push("Youth pathway: a parent or guardian signs the consent.");
  if (age === "60") notes.push("Annual renewal recommended for athletes 60 and over.");
  if (cls.indexOf("Class 1") === 0) notes.push("Class 1 includes an exercise ECG.");
  return { tone, title, cls, docs, notes, disciplineName: discipline?.name || "" };
}
