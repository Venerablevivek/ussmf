import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "../env";
import { db } from "../db/knex";

export const SESSION_COOKIE = "ussmf_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const ISSUER = "ussmf";
const AUDIENCE = "ussmf-web";

function secretKey() {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function signSession(user) {
  return new SignJWT({ role: user.role, sv: user.session_version })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user) {
  const token = await signSession(user);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.APP_URL.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: env.APP_URL.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

const USER_COLUMNS = [
  "id",
  "email",
  "role",
  "first_name",
  "last_name",
  "is_active",
  "session_version",
  "created_at",
];

/**
 * The signed-in user, freshly loaded from the database (so role changes and deactivation apply
 * immediately), or null. Tokens issued before a password reset are rejected via session_version.
 */
export async function getCurrentUser() {
  const jar = await cookies();
  const payload = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!payload?.sub) return null;
  const user = await db()("users").where({ id: payload.sub }).first(USER_COLUMNS);
  if (!user || !user.is_active || user.session_version !== payload.sv) return null;
  return user;
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
  };
}
