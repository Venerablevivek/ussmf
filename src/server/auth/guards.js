import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import { forbidden, unauthorized } from "../http/errors";

export const STAFF_ROLES = ["physician", "admin"];

export function isStaff(user) {
  return !!user && STAFF_ROLES.includes(user.role);
}

export function homeFor(user) {
  return isStaff(user) ? "/admin" : "/dashboard";
}

/* ---------- API routes: throw HttpErrors ---------- */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

export async function requireRole(...roles) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw forbidden();
  return user;
}

/* ---------- Server pages: redirect ---------- */
export async function requirePageUser(next) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requirePageRole(roles, next) {
  const user = await requirePageUser(next);
  if (!roles.includes(user.role)) redirect(homeFor(user));
  return user;
}
