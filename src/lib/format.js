import { format, isValid, parseISO } from "date-fns";

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

// Only same-site paths are allowed as post-login destinations.
export function safeNext(next, fallback) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function toneClass(tone) {
  return tone ? `t-${tone}` : "";
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const d =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
}

// "Oct 13, 2027"
export function formatDate(value, fallback = "—") {
  const d = toDate(value);
  return d ? format(d, "MMM d, yyyy") : fallback;
}

// "Oct 08" (status timeline)
export function formatShortDate(value, fallback = "") {
  const d = toDate(value);
  return d ? format(d, "MMM dd") : fallback;
}

// "Oct 2027" (hero certificate)
export function formatMonthYear(value, fallback = "—") {
  const d = toDate(value);
  return d ? format(d, "MMM yyyy") : fallback;
}

export function formatDateTime(value, fallback = "—") {
  const d = toDate(value);
  return d ? format(d, "MMM d, yyyy · h:mm a") : fallback;
}

export function formatBytes(size) {
  if (!size && size !== 0) return "";
  return size / 1024 > 1024
    ? `${(size / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`;
}

export function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

// "Jordan L." — what the public status tracker may show.
export function firstNameAndInitial(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Applicant";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export function pluralize(count, word, plural = `${word}s`) {
  return `${count} ${count === 1 ? word : plural}`;
}

export function ageOn(dateOfBirth, on = new Date()) {
  const dob = toDate(dateOfBirth);
  if (!dob) return null;
  let age = on.getFullYear() - dob.getFullYear();
  const m = on.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < dob.getDate())) age -= 1;
  return age;
}
