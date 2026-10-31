import "server-only";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "../db/knex";
import { env } from "../env";
import { conflict, unauthorized, validationError } from "../http/errors";
import { newToken } from "./ids";
import { audit } from "./auditService";
import { sendTemplateSafely } from "./mailService";

const BCRYPT_COST = 12;
const RESET_TTL_MS = 60 * 60 * 1000;
// Compared against when the email is unknown, so response time doesn't reveal which accounts exist.
let dummyHash;
const getDummyHash = () => (dummyHash ||= bcrypt.hash("ussmf-timing-equalizer", BCRYPT_COST));

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export async function registerAthlete({ firstName, lastName, email, password }, { ip } = {}) {
  const k = db();
  const existing = await k("users").where({ email }).first("id");
  if (existing) {
    throw conflict("An account with this email already exists. Sign in or reset your password instead.");
  }
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const user = await k.transaction(async (trx) => {
    const [row] = await trx("users")
      .insert({
        email,
        password_hash: passwordHash,
        role: "athlete",
        first_name: firstName,
        last_name: lastName,
      })
      .returning(["id", "email", "role", "first_name", "last_name", "session_version"]);
    await trx("athlete_profiles").insert({ user_id: row.id, legal_name: `${firstName} ${lastName}`.trim() });
    await audit(
      { actorId: row.id, action: "user.registered", entityType: "user", entityId: row.id, ip },
      trx,
    );
    return row;
  });
  return user;
}

export async function authenticate({ email, password }, { ip } = {}) {
  const user = await db()("users")
    .where({ email })
    .first([
      "id",
      "email",
      "role",
      "first_name",
      "last_name",
      "password_hash",
      "is_active",
      "session_version",
    ]);
  const ok = await bcrypt.compare(password, user?.password_hash || (await getDummyHash()));
  if (!user || !ok)
    throw unauthorized("That email and password don’t match. Check them or reset your password.");
  if (!user.is_active)
    throw unauthorized("This account has been deactivated. Contact info@ussmf.org for help.");
  await audit({ actorId: user.id, action: "user.login", entityType: "user", entityId: user.id, ip });
  delete user.password_hash;
  return user;
}

/** Always resolves the same way whether or not the email exists. */
export async function requestPasswordReset({ email }, { ip } = {}) {
  const k = db();
  const user = await k("users").where({ email, is_active: true }).first(["id", "first_name", "email"]);
  if (!user) return;
  const token = newToken();
  await k("password_resets").where({ user_id: user.id }).whereNull("used_at").update({ used_at: k.fn.now() });
  await k("password_resets").insert({
    user_id: user.id,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + RESET_TTL_MS),
  });
  await audit({
    actorId: user.id,
    action: "user.password_reset_requested",
    entityType: "user",
    entityId: user.id,
    ip,
  });
  await sendTemplateSafely("passwordReset", user.email, {
    firstName: user.first_name,
    url: `${env.APP_URL}/reset-password?token=${encodeURIComponent(token)}`,
  });
}

export async function resetPassword({ token, password }, { ip } = {}) {
  const k = db();
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  return k.transaction(async (trx) => {
    const reset = await trx("password_resets")
      .where({ token_hash: hashToken(token) })
      .whereNull("used_at")
      .where("expires_at", ">", trx.fn.now())
      .forUpdate()
      .first(["id", "user_id"]);
    if (!reset) {
      throw validationError("This reset link has expired or was already used. Request a new one.", {
        token: "This reset link has expired or was already used.",
      });
    }
    await trx("password_resets").where({ id: reset.id }).update({ used_at: trx.fn.now() });
    const [user] = await trx("users")
      .where({ id: reset.user_id })
      .update({
        password_hash: passwordHash,
        session_version: trx.raw("session_version + 1"),
        updated_at: trx.fn.now(),
      })
      .returning(["id", "email", "role", "first_name", "last_name", "session_version", "is_active"]);
    await audit(
      { actorId: user.id, action: "user.password_reset", entityType: "user", entityId: user.id, ip },
      trx,
    );
    return user;
  });
}
