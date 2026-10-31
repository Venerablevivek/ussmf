import "server-only";
import { randomBytes, randomInt } from "node:crypto";

// USSMF-APP-{YEAR}-{4–5 digits}: four digits first, five once four-digit attempts keep colliding.
export function newApplicationPublicId(attempt = 0, year = new Date().getUTCFullYear()) {
  const digits = attempt < 3 ? 4 : 5;
  return `USSMF-APP-${year}-${randomInt(10 ** (digits - 1), 10 ** digits)}`;
}

// USSMF-AS-{YEAR}-{5 digits}
export function newCertificatePublicId(year = new Date().getUTCFullYear()) {
  return `USSMF-AS-${year}-${String(randomInt(0, 100_000)).padStart(5, "0")}`;
}

// Random, unguessable object keys. Original file names never appear in storage.
export function newStorageKey(prefix) {
  return `${prefix}/${randomBytes(20).toString("hex")}`;
}

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function isUniqueViolation(err, constraint) {
  return err?.code === "23505" && (!constraint || err.constraint === constraint);
}

/** Runs fn(attempt) again when it fails on the given unique constraint (public ID collisions). */
export async function withUniqueRetry(fn, { constraint, attempts = 8 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (!isUniqueViolation(err, constraint) || attempt >= attempts - 1) throw err;
    }
  }
}
