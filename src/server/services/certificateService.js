import "server-only";
import { db } from "../db/knex";
import { env } from "../env";
import { conflict, forbidden, notFound } from "../http/errors";
import { disciplineName } from "@/lib/disciplines";
import { formatDate } from "@/lib/format";
import { newCertificatePublicId, withUniqueRetry } from "./ids";
import { audit } from "./auditService";
import { sendTemplateSafely } from "./mailService";
import { presignDownload } from "./storageService";

const isStaff = (user) => user.role === "physician" || user.role === "admin";
const EXPIRING_DAYS = 30;

export function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Validity runs through the day before the same date `months` later (Oct 14, 2026 → Oct 13, 2027). */
export function expiryFor(issuedIso, months) {
  const [y, m, d] = issuedIso.split("-").map(Number);
  const end = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  end.setUTCDate(Math.min(d, lastDay));
  end.setUTCDate(end.getUTCDate() - 1);
  return end.toISOString().slice(0, 10);
}

/**
 * Public state. Suspension and revocation override dates; "expired" is derived from expires_at.
 * Returns valid | expiring | expired | suspended | revoked ("expiring" is still valid).
 */
export function certificateState(cert, today = todayUtc()) {
  if (cert.status === "revoked") return "revoked";
  if (cert.status === "suspended") return "suspended";
  if (cert.expires_at < today) return "expired";
  if (cert.expires_at <= addDaysIso(today, EXPIRING_DAYS)) return "expiring";
  return "valid";
}

export function verifyUrl(publicId) {
  return `${env.APP_URL}/verify/${publicId}`;
}

/** Creates the certificate inside the approval transaction (with a public ID uniqueness retry). */
export async function issueCertificate(trx, { application, physicianId, certificateClass, validityMonths }) {
  const profile = await trx("athlete_profiles")
    .where({ user_id: application.athlete_id })
    .first("legal_name", "photo_key");
  const user = await trx("users").where({ id: application.athlete_id }).first("first_name", "last_name");
  const issued = todayUtc();
  return withUniqueRetry(
    () =>
      trx.transaction(async (sp) => {
        const [row] = await sp("certificates")
          .insert({
            public_id: newCertificatePublicId(),
            application_id: application.id,
            athlete_id: application.athlete_id,
            athlete_name: profile?.legal_name || `${user.first_name} ${user.last_name}`,
            photo_key: profile?.photo_key || null,
            discipline: application.discipline,
            class: certificateClass,
            issued_at: issued,
            expires_at: expiryFor(issued, validityMonths),
            status: "active",
            physician_id: physicianId,
          })
          .returning("*");
        return row;
      }),
    { constraint: "certificates_public_id_unique" },
  );
}

function toDto(row, today = todayUtc()) {
  return {
    id: row.id,
    publicId: row.public_id,
    applicationId: row.application_id,
    athleteName: row.athlete_name,
    discipline: row.discipline,
    disciplineName: disciplineName(row.discipline),
    certificateClass: row.class,
    issuedAt: row.issued_at,
    expiresAt: row.expires_at,
    status: row.status,
    statusReason: row.status_reason,
    state: certificateState(row, today),
    verifyUrl: verifyUrl(row.public_id),
  };
}

export async function listMyCertificates(user) {
  const rows = await db()("certificates").where({ athlete_id: user.id }).orderBy("issued_at", "desc");
  return rows.map((r) => toDto(r));
}

/** The certificate row plus what the PDF needs, if `user` may download it. */
export async function getCertificateForPdf(user, id) {
  const k = db();
  const cert = await k("certificates").where({ id }).first();
  if (!cert) throw notFound("We couldn’t find that certificate.");
  if (!isStaff(user) && cert.athlete_id !== user.id) throw notFound("We couldn’t find that certificate.");
  const physician = cert.physician_id
    ? await k("users").where({ id: cert.physician_id }).first("first_name", "last_name")
    : null;
  return {
    ...toDto(cert),
    photoKey: cert.photo_key,
    physicianName: physician ? `Dr. ${physician.first_name} ${physician.last_name}` : null,
  };
}

const RESULT_TITLES = {
  valid: "Valid certificate",
  expired: "Expired certificate",
  suspended: "Suspended certificate",
  revoked: "Revoked certificate",
};

/** Public verification: identity and validity only, never medical information. */
export async function verifyCertificate(publicId) {
  const cert = await db()("certificates").where({ public_id: publicId }).first();
  if (!cert) return { result: "not_found", certificateId: publicId };
  const state = certificateState(cert);
  const result = state === "expiring" ? "valid" : state;
  let dateLine = `Valid until ${formatDate(cert.expires_at)}`;
  if (result === "expired") dateLine = `Expired ${formatDate(cert.expires_at)}`;
  if (result === "suspended")
    dateLine = `Suspended · valid dates ${formatDate(cert.issued_at)} – ${formatDate(cert.expires_at)}`;
  if (result === "revoked") dateLine = `Revoked · originally valid until ${formatDate(cert.expires_at)}`;
  return {
    result,
    title: RESULT_TITLES[result],
    certificateId: cert.public_id,
    athleteName: cert.athlete_name,
    discipline: disciplineName(cert.discipline),
    certificateClass: cert.class,
    issuedAt: cert.issued_at,
    expiresAt: cert.expires_at,
    dateLine,
    photoUrl: cert.photo_key ? await presignDownload(cert.photo_key, { expiresIn: 120, inline: true }) : null,
  };
}

/* ---------- Admin ---------- */

export async function listCertificates({ q = "", state = "", page = 1, pageSize = 20 }) {
  const k = db();
  const base = k("certificates as c").join("users as u", "u.id", "c.athlete_id");
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
    base.where((w) =>
      w.whereILike("c.public_id", like).orWhereILike("c.athlete_name", like).orWhereILike("u.email", like),
    );
  }
  if (state === "suspended" || state === "revoked") base.where("c.status", state);
  if (state === "active") base.where("c.status", "active").where("c.expires_at", ">=", k.raw("current_date"));
  if (state === "expired") base.where("c.status", "active").where("c.expires_at", "<", k.raw("current_date"));
  const [{ count }] = await base.clone().count({ count: "c.id" });
  const rows = await base
    .clone()
    .orderBy("c.created_at", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .select("c.*", "u.email");
  return { items: rows.map((r) => ({ ...toDto(r), email: r.email })), page, pageSize, total: Number(count) };
}

const STATUS_CHANGES = {
  suspend: { from: ["active"], to: "suspended" },
  reinstate: { from: ["suspended"], to: "active" },
  revoke: { from: ["active", "suspended"], to: "revoked" },
};

export async function changeCertificateStatus(actor, id, { action, reason }, { ip } = {}) {
  if (actor.role !== "admin") throw forbidden("Only administrators can change a certificate’s status.");
  const change = STATUS_CHANGES[action];
  const k = db();
  const { cert, updated } = await k.transaction(async (trx) => {
    const cert = await trx("certificates").where({ id }).forUpdate().first();
    if (!cert) throw notFound("We couldn’t find that certificate.");
    if (!change.from.includes(cert.status)) {
      throw conflict(
        `This certificate is ${cert.status}, so it can’t be ${change.to === "active" ? "reinstated" : change.to}.`,
      );
    }
    const [updated] = await trx("certificates")
      .where({ id })
      .update({ status: change.to, status_reason: reason, updated_at: trx.fn.now() })
      .returning("*");
    await audit(
      {
        actorId: actor.id,
        action: `certificate.${action}`,
        entityType: "certificate",
        entityId: id,
        metadata: { publicId: cert.public_id, from: cert.status, to: change.to },
        ip,
      },
      trx,
    );
    return { cert, updated };
  });
  const athlete = await k("users").where({ id: cert.athlete_id }).first("email", "first_name");
  await sendTemplateSafely("certificateStatusChanged", athlete.email, {
    firstName: athlete.first_name,
    certificateId: cert.public_id,
    status: change.to,
    reason,
    url: `${env.APP_URL}/dashboard/certificates`,
  });
  return toDto(updated);
}

/* ---------- Cron ---------- */

/**
 * Emails 30-day and 7-day expiry reminders. Rows are claimed with an UPDATE … RETURNING before
 * sending, so concurrent runs never double-send; a failed send releases the claim for the next run.
 */
export async function sendExpiryReminders() {
  const k = db();
  const sent = { days30: 0, days7: 0 };
  const plans = [
    { days: 7, column: "reminder_7_sent_at", key: "days7", window: [0, 7] },
    { days: 30, column: "reminder_30_sent_at", key: "days30", window: [8, 30] },
  ];
  for (const plan of plans) {
    const claimed = await k("certificates")
      .whereIn(
        "id",
        k("certificates")
          .select("id")
          .where({ status: "active" })
          .whereNull(plan.column)
          .whereRaw("expires_at BETWEEN current_date + ?::int AND current_date + ?::int", plan.window)
          .limit(200),
      )
      .whereNull(plan.column)
      .update({
        [plan.column]: k.fn.now(),
        ...(plan.days === 7 ? { reminder_30_sent_at: k.raw("coalesce(reminder_30_sent_at, now())") } : {}),
      })
      .returning(["id", "public_id", "athlete_id", "expires_at"]);
    for (const cert of claimed) {
      const user = await k("users").where({ id: cert.athlete_id }).first("email", "first_name", "is_active");
      if (!user?.is_active) continue;
      const result = await sendTemplateSafely("expiryReminder", user.email, {
        firstName: user.first_name,
        certificateId: cert.public_id,
        expiresOn: formatDate(cert.expires_at),
        days: plan.days,
        url: `${env.APP_URL}/dashboard/certificates`,
      });
      if (result.delivered === false && env.SMTP_HOST) {
        await k("certificates")
          .where({ id: cert.id })
          .update({ [plan.column]: null });
        continue;
      }
      await audit({
        action: `certificate.reminder_${plan.days}`,
        entityType: "certificate",
        entityId: cert.id,
        metadata: { publicId: cert.public_id },
      });
      sent[plan.key] += 1;
    }
  }
  return sent;
}
