import "server-only";
import { db } from "../db/knex";
import { env } from "../env";
import { conflict, forbidden, notFound, validationError } from "../http/errors";
import { fieldErrors, medicalSchema, personalSchema, sportSchema } from "@/lib/validators";
import { EDITABLE_STATUSES, REVIEW_ACTIONS, buildTimeline, canTransition } from "@/lib/statuses";
import { disciplineName } from "@/lib/disciplines";
import { ageOn, firstNameAndInitial, formatDate } from "@/lib/format";
import { newApplicationPublicId, withUniqueRetry } from "./ids";
import { audit } from "./auditService";
import { sendTemplateSafely } from "./mailService";
import { replaceProfilePhoto, presignPhotoView } from "./documentService";
import { issueCertificate } from "./certificateService";

const APP_FIELDS = {
  discipline: "discipline",
  level: "level",
  yearsExperience: "years_experience",
  conditions: "conditions",
  medications: "medications",
  injuries: "injuries",
  lastPhysicalDate: "last_physical_date",
};
const PROFILE_FIELDS = {
  legalName: "legal_name",
  dateOfBirth: "date_of_birth",
  phone: "phone",
  state: "state",
  federation: "federation",
  memberNumber: "member_number",
};

const ATHLETE_VISIBLE_MESSAGES = ["info_requested", "assessment_required", "rejected"];
const fullName = (row) => row.legal_name || `${row.first_name || ""} ${row.last_name || ""}`.trim();
const emptyToNull = (v) => (v === "" ? null : v);

/* ---------- Loading ---------- */

async function loadEvents(k, applicationId) {
  const rows = await k("application_events as e")
    .leftJoin("users as u", "u.id", "e.actor_id")
    .where("e.application_id", applicationId)
    .orderBy("e.created_at", "asc")
    .select(
      "e.id",
      "e.from_status",
      "e.to_status",
      "e.message",
      "e.created_at",
      "u.first_name",
      "u.last_name",
      "u.role",
    );
  return rows.map((r) => ({
    id: r.id,
    fromStatus: r.from_status,
    toStatus: r.to_status,
    message: r.message,
    createdAt: r.created_at,
    actorName: r.first_name ? `${r.first_name} ${r.last_name}` : null,
    actorRole: r.role || null,
  }));
}

async function loadDocuments(k, applicationId) {
  const rows = await k("documents")
    .where({ application_id: applicationId })
    .orderBy("created_at", "asc")
    .select("id", "original_name", "mime_type", "size_bytes", "status", "created_at");
  return rows.map((d) => ({
    id: d.id,
    name: d.original_name,
    mimeType: d.mime_type,
    size: d.size_bytes,
    status: d.status,
    createdAt: d.created_at,
  }));
}

async function loadOwned(k, user, id, { lock = false } = {}) {
  let q = k("applications").where({ id });
  if (lock) q = q.forUpdate();
  const app = await q.first();
  if (!app) throw notFound("We couldn’t find that application.");
  if (app.athlete_id !== user.id) throw notFound("We couldn’t find that application.");
  return app;
}

function wizardValues(app, profile, user) {
  return {
    legalName: profile?.legal_name || `${user.first_name} ${user.last_name}`.trim(),
    dateOfBirth: profile?.date_of_birth || "",
    email: user.email,
    phone: profile?.phone || "",
    state: profile?.state || "",
    discipline: app?.discipline || "",
    level: app?.level || "",
    federation: profile?.federation || "USASF",
    memberNumber: profile?.member_number || "",
    yearsExperience: app?.years_experience ?? 4,
    conditions: app?.conditions || [],
    medications: app?.medications || "",
    injuries: app?.injuries || "",
    lastPhysicalDate: app?.last_physical_date || "",
  };
}

/** Everything the /apply page needs: the open draft (if any) and the athlete's saved details. */
export async function getWizardState(user) {
  const k = db();
  const profile = await k("athlete_profiles").where({ user_id: user.id }).first();
  const draft = await k("applications")
    .where({ athlete_id: user.id, status: "draft" })
    .orderBy("updated_at", "desc")
    .first();
  const photoUrl = profile?.photo_key ? await presignPhotoView(profile.photo_key) : null;
  return {
    draft: draft ? { id: draft.id, publicId: draft.public_id } : null,
    values: wizardValues(draft, profile, user),
    documents: draft ? await loadDocuments(k, draft.id) : [],
    photoUrl,
    hasPhoto: !!profile?.photo_key,
  };
}

/* ---------- Athlete: drafts ---------- */

async function insertDraft(trx, user, fields) {
  return withUniqueRetry(
    (attempt) =>
      // Savepoint, so a public_id collision doesn't abort the surrounding transaction.
      trx.transaction(async (sp) => {
        const [row] = await sp("applications")
          .insert({
            public_id: newApplicationPublicId(attempt),
            athlete_id: user.id,
            status: "draft",
            ...fields,
          })
          .returning("*");
        return row;
      }),
    { constraint: "applications_public_id_unique" },
  );
}

export async function createDraft(user, { renewFrom } = {}, { ip } = {}) {
  if (user.role !== "athlete") throw forbidden("Only athlete accounts can apply for a certificate.");
  const k = db();
  return k.transaction(async (trx) => {
    let copy = {};
    if (renewFrom) {
      const source = await loadOwned(trx, user, renewFrom);
      copy = {
        discipline: source.discipline,
        level: source.level,
        years_experience: source.years_experience,
        conditions: source.conditions,
        medications: source.medications,
        injuries: source.injuries,
      };
    }
    const existing = await trx("applications")
      .where({ athlete_id: user.id, status: "draft" })
      .orderBy("updated_at", "desc")
      .forUpdate()
      .first();
    if (existing) {
      // Resume the open draft; a renewal only fills in what is still empty.
      const fill = Object.fromEntries(
        Object.entries(copy).filter(
          ([col]) => existing[col] === null || (Array.isArray(existing[col]) && !existing[col].length),
        ),
      );
      if (Object.keys(fill).length) {
        await trx("applications")
          .where({ id: existing.id })
          .update({ ...fill, updated_at: trx.fn.now() });
      }
      return { id: existing.id, publicId: existing.public_id, resumed: true };
    }
    const app = await insertDraft(trx, user, copy);
    await trx("application_events").insert({
      application_id: app.id,
      from_status: null,
      to_status: "draft",
      actor_id: user.id,
    });
    await audit(
      {
        actorId: user.id,
        action: renewFrom ? "application.renewal_started" : "application.created",
        entityType: "application",
        entityId: app.id,
        metadata: { publicId: app.public_id },
        ip,
      },
      trx,
    );
    return { id: app.id, publicId: app.public_id, resumed: false };
  });
}

/** Autosave. Accepts partial, possibly incomplete values; completeness is checked on submit. */
export async function updateDraft(user, id, patch, { ip } = {}) {
  const k = db();
  const app = await loadOwned(k, user, id);
  if (app.status !== "draft") {
    throw conflict("This application has already been submitted, so it can no longer be edited.");
  }
  const appUpdate = {};
  const profileUpdate = {};
  for (const [key, col] of Object.entries(APP_FIELDS))
    if (key in patch) appUpdate[col] = emptyToNull(patch[key]);
  for (const [key, col] of Object.entries(PROFILE_FIELDS))
    if (key in patch) profileUpdate[col] = emptyToNull(patch[key]);
  if ("conditions" in patch) appUpdate.conditions = patch.conditions;

  if (patch.photoKey) {
    await replaceProfilePhoto(user, patch.photoKey, { ip });
  }

  await k.transaction(async (trx) => {
    if (Object.keys(profileUpdate).length) {
      await trx("athlete_profiles")
        .insert({ user_id: user.id, ...profileUpdate })
        .onConflict("user_id")
        .merge({ ...profileUpdate, updated_at: trx.fn.now() });
    }
    await trx("applications")
      .where({ id })
      .update({ ...appUpdate, updated_at: trx.fn.now() });
  });
  return { savedAt: new Date().toISOString() };
}

function checkComplete(profile, app) {
  const values = {
    legalName: profile?.legal_name || "",
    dateOfBirth: profile?.date_of_birth || "",
    phone: profile?.phone || "",
    state: profile?.state || "",
    discipline: app.discipline || "",
    level: app.level || "",
    federation: profile?.federation || "USASF",
    memberNumber: profile?.member_number || "",
    yearsExperience: app.years_experience ?? 0,
    conditions: app.conditions || [],
    medications: app.medications || "",
    injuries: app.injuries || "",
    lastPhysicalDate: app.last_physical_date || "",
  };
  const fields = {};
  for (const schema of [personalSchema, sportSchema, medicalSchema]) {
    const result = schema.safeParse(values);
    if (!result.success) Object.assign(fields, fieldErrors(result.error));
  }
  if (Object.keys(fields).length) {
    throw validationError("Some details are missing. Go back and complete the highlighted steps.", fields);
  }
}

function isPng(dataUrl) {
  const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  return (
    bytes.length > 64 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  );
}

export async function submitApplication(user, id, { consents, signature }, { ip } = {}) {
  if (!isPng(signature)) throw validationError("Add your signature.", { signature: "Add your signature." });
  const k = db();
  const result = await k.transaction(async (trx) => {
    const app = await loadOwned(trx, user, id, { lock: true });
    if (app.status !== "draft") throw conflict("This application has already been submitted.");
    const profile = await trx("athlete_profiles").where({ user_id: user.id }).first();
    checkComplete(profile, app);
    const docs = await trx("documents").where({ application_id: id }).select("status");
    if (!docs.length)
      throw validationError("Upload at least one medical record.", {
        documents: "Upload at least one medical record.",
      });
    if (docs.some((d) => d.status !== "verified")) {
      throw validationError("Wait for uploads to finish.", { documents: "Wait for uploads to finish." });
    }
    await trx("applications")
      .where({ id })
      .update({
        status: "submitted",
        consents: JSON.stringify({ ...consents, acceptedAt: new Date().toISOString() }),
        signature_data: signature,
        submitted_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      });
    await trx("application_events").insert({
      application_id: id,
      from_status: "draft",
      to_status: "submitted",
      actor_id: user.id,
    });
    await audit(
      {
        actorId: user.id,
        action: "application.submitted",
        entityType: "application",
        entityId: id,
        metadata: { publicId: app.public_id, documents: docs.length },
        ip,
      },
      trx,
    );
    return { publicId: app.public_id, firstName: (profile?.legal_name || user.first_name).split(/\s+/)[0] };
  });
  await sendTemplateSafely("applicationSubmitted", user.email, {
    firstName: result.firstName,
    publicId: result.publicId,
    url: `${env.APP_URL}/dashboard/applications/${id}`,
  });
  return { id, publicId: result.publicId };
}

/** Athlete answers an info request: their reply is recorded and the file returns to review. */
export async function respondToInfoRequest(user, id, { response }, { ip } = {}) {
  const k = db();
  await k.transaction(async (trx) => {
    const app = await loadOwned(trx, user, id, { lock: true });
    if (app.status !== "info_requested")
      throw conflict("This application isn’t waiting for information from you.");
    const pending = await trx("documents").where({ application_id: id, status: "pending" }).first("id");
    if (pending)
      throw validationError("Wait for uploads to finish.", { documents: "Wait for uploads to finish." });
    await trx("applications").where({ id }).update({ status: "under_review", updated_at: trx.fn.now() });
    await trx("application_events").insert({
      application_id: id,
      from_status: "info_requested",
      to_status: "under_review",
      actor_id: user.id,
      message: response,
    });
    await audit(
      {
        actorId: user.id,
        action: "application.info_provided",
        entityType: "application",
        entityId: id,
        metadata: { publicId: app.public_id },
        ip,
      },
      trx,
    );
  });
  return { ok: true };
}

/* ---------- Athlete: reading ---------- */

function summarize(app, events) {
  return {
    id: app.id,
    publicId: app.public_id,
    status: app.status,
    discipline: app.discipline,
    disciplineName: disciplineName(app.discipline),
    level: app.level,
    submittedAt: app.submitted_at,
    decidedAt: app.decided_at,
    createdAt: app.created_at,
    updatedAt: app.updated_at,
    timeline: buildTimeline({ status: app.status, submittedAt: app.submitted_at, events }, { detail: true }),
  };
}

export async function listMyApplications(user) {
  const k = db();
  const apps = await k("applications").where({ athlete_id: user.id }).orderBy("created_at", "desc");
  const events = apps.length
    ? await k("application_events")
        .whereIn(
          "application_id",
          apps.map((a) => a.id),
        )
        .orderBy("created_at", "asc")
    : [];
  return apps.map((app) =>
    summarize(
      app,
      events
        .filter((e) => e.application_id === app.id)
        .map((e) => ({
          fromStatus: e.from_status,
          toStatus: e.to_status,
          createdAt: e.created_at,
          message: e.message,
        })),
    ),
  );
}

export async function getMyApplication(user, id) {
  const k = db();
  const app = await loadOwned(k, user, id);
  const [events, documents, profile, certificate] = await Promise.all([
    loadEvents(k, id),
    loadDocuments(k, id),
    k("athlete_profiles").where({ user_id: user.id }).first(),
    k("certificates").where({ application_id: id }).first("id", "public_id", "status", "expires_at"),
  ]);
  const infoRequest =
    app.status === "info_requested"
      ? [...events].reverse().find((e) => e.toStatus === "info_requested")
      : null;
  return {
    ...summarize(app, events),
    values: wizardValues(app, profile, user),
    documents,
    editable: EDITABLE_STATUSES.includes(app.status),
    infoRequest: infoRequest ? { message: infoRequest.message, createdAt: infoRequest.createdAt } : null,
    // Physician notes on verification, review start and approval stay internal; requests,
    // assessment notes, rejection reasons and the athlete's own replies are shown.
    events: events
      .filter((e) => e.toStatus !== "draft")
      .map((e) => {
        const byAthlete = e.actorRole === "athlete";
        const visible = byAthlete || ATHLETE_VISIBLE_MESSAGES.includes(e.toStatus);
        return {
          id: e.id,
          toStatus: e.toStatus,
          createdAt: e.createdAt,
          message: visible ? e.message : null,
          byAthlete,
        };
      }),
    certificate: certificate ? { id: certificate.id, publicId: certificate.public_id } : null,
  };
}

/* ---------- Public tracker ---------- */

export async function publicStatus({ applicationId, email }) {
  const k = db();
  const app = await k("applications as a")
    .join("users as u", "u.id", "a.athlete_id")
    .leftJoin("athlete_profiles as p", "p.user_id", "a.athlete_id")
    .where("a.public_id", applicationId)
    .where("u.email", email)
    .first(
      "a.id",
      "a.public_id",
      "a.status",
      "a.discipline",
      "a.submitted_at",
      "p.legal_name",
      "u.first_name",
      "u.last_name",
    );
  if (!app) return { found: false };
  const events = (
    await k("application_events").where({ application_id: app.id }).orderBy("created_at", "asc")
  ).map((e) => ({
    fromStatus: e.from_status,
    toStatus: e.to_status,
    createdAt: e.created_at,
  }));
  return {
    found: true,
    publicId: app.public_id,
    name: firstNameAndInitial(fullName(app)),
    discipline: app.discipline ? disciplineName(app.discipline) : "Discipline not chosen yet",
    timeline: buildTimeline({ status: app.status, submittedAt: app.submitted_at, events }, { detail: false }),
  };
}

/* ---------- Physician / admin ---------- */

const SORTS = {
  submitted_desc: [{ column: "a.submitted_at", order: "desc", nulls: "last" }],
  submitted_asc: [{ column: "a.submitted_at", order: "asc", nulls: "last" }],
  updated_desc: [{ column: "a.updated_at", order: "desc" }],
};

export async function listApplications({
  status = "",
  discipline = "",
  level = "",
  q = "",
  sort = "submitted_desc",
  page = 1,
  pageSize = 20,
}) {
  const k = db();
  const base = k("applications as a")
    .join("users as u", "u.id", "a.athlete_id")
    .leftJoin("athlete_profiles as p", "p.user_id", "a.athlete_id")
    .leftJoin("users as ph", "ph.id", "a.assigned_physician_id");
  if (status === "open")
    base.whereIn("a.status", ["submitted", "records_verified", "under_review", "assessment_required"]);
  else if (status) base.where("a.status", status);
  else base.whereNot("a.status", "draft");
  if (discipline) base.where("a.discipline", discipline);
  if (level) base.where("a.level", level);
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    base.where((w) =>
      w
        .whereILike("a.public_id", like)
        .orWhereILike("u.email", like)
        .orWhereILike("p.legal_name", like)
        .orWhereRaw("(u.first_name || ' ' || u.last_name) ILIKE ?", [like]),
    );
  }
  const [{ count }] = await base.clone().count({ count: "a.id" });
  const rows = await base
    .clone()
    .orderBy(SORTS[sort] || SORTS.submitted_desc)
    .orderBy("a.created_at", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .select(
      "a.id",
      "a.public_id",
      "a.status",
      "a.discipline",
      "a.level",
      "a.submitted_at",
      "a.updated_at",
      "u.email",
      "u.first_name",
      "u.last_name",
      "p.legal_name",
      "ph.first_name as physician_first",
      "ph.last_name as physician_last",
    );
  return {
    items: rows.map((r) => ({
      id: r.id,
      publicId: r.public_id,
      status: r.status,
      discipline: r.discipline,
      disciplineName: disciplineName(r.discipline),
      level: r.level,
      submittedAt: r.submitted_at,
      updatedAt: r.updated_at,
      athleteName: fullName(r),
      email: r.email,
      physician: r.physician_first ? `Dr. ${r.physician_first} ${r.physician_last}` : null,
    })),
    page,
    pageSize,
    total: Number(count),
  };
}

export async function getApplicationForReview(id) {
  const k = db();
  const app = await k("applications").where({ id }).first();
  if (!app || app.status === "draft") throw notFound("We couldn’t find that application.");
  const [user, profile, events, documents, history, certificates, physician] = await Promise.all([
    k("users")
      .where({ id: app.athlete_id })
      .first("id", "email", "first_name", "last_name", "is_active", "created_at"),
    k("athlete_profiles").where({ user_id: app.athlete_id }).first(),
    loadEvents(k, id),
    loadDocuments(k, id),
    k("applications")
      .where({ athlete_id: app.athlete_id })
      .whereNot({ id })
      .whereNot({ status: "draft" })
      .orderBy("created_at", "desc")
      .select("id", "public_id", "status", "discipline", "submitted_at", "decided_at"),
    k("certificates")
      .where({ athlete_id: app.athlete_id })
      .orderBy("issued_at", "desc")
      .select(
        "id",
        "public_id",
        "discipline",
        "class",
        "issued_at",
        "expires_at",
        "status",
        "application_id",
      ),
    app.assigned_physician_id
      ? k("users").where({ id: app.assigned_physician_id }).first("first_name", "last_name")
      : null,
  ]);
  const photoUrl = profile?.photo_key ? await presignPhotoView(profile.photo_key) : null;
  const age = ageOn(profile?.date_of_birth);
  return {
    id: app.id,
    publicId: app.public_id,
    status: app.status,
    discipline: app.discipline,
    disciplineName: disciplineName(app.discipline),
    level: app.level,
    yearsExperience: app.years_experience,
    conditions: app.conditions || [],
    medications: app.medications,
    injuries: app.injuries,
    lastPhysicalDate: app.last_physical_date,
    consents: app.consents,
    signature: app.signature_data,
    submittedAt: app.submitted_at,
    decidedAt: app.decided_at,
    physician: physician ? `Dr. ${physician.first_name} ${physician.last_name}` : null,
    athlete: {
      id: user.id,
      name: fullName({ ...profile, ...user, legal_name: profile?.legal_name }),
      email: user.email,
      dateOfBirth: profile?.date_of_birth,
      age,
      phone: profile?.phone,
      state: profile?.state,
      federation: profile?.federation,
      memberNumber: profile?.member_number,
      photoUrl,
      memberSince: user.created_at,
    },
    events,
    documents,
    history: history.map((h) => ({ ...h, disciplineName: disciplineName(h.discipline) })),
    certificates: certificates.map((c) => ({ ...c, disciplineName: disciplineName(c.discipline) })),
    defaultValidityMonths: age !== null && age >= 60 ? 6 : 12,
  };
}

export async function transitionApplication(actor, id, input, { ip } = {}) {
  const action = REVIEW_ACTIONS[input.action];
  const k = db();
  const outcome = await k.transaction(async (trx) => {
    const app = await trx("applications").where({ id }).forUpdate().first();
    if (!app || app.status === "draft") throw notFound("We couldn’t find that application.");
    if (!canTransition(app.status, action.to)) {
      throw conflict(
        `This application is “${app.status.replace(/_/g, " ")}”, so it can’t move to “${action.to.replace(/_/g, " ")}”.`,
      );
    }
    const message = input.note || input.message || input.reason || input.notes || null;
    const update = { status: action.to, updated_at: trx.fn.now() };
    if (
      ["start_review", "require_assessment", "approve", "reject"].includes(input.action) &&
      !app.assigned_physician_id
    ) {
      update.assigned_physician_id = actor.id;
    }
    if (action.to === "approved" || action.to === "rejected") update.decided_at = trx.fn.now();

    let certificate = null;
    if (input.action === "approve") {
      certificate = await issueCertificate(trx, {
        application: app,
        physicianId: actor.id,
        certificateClass: input.certificateClass,
        validityMonths: input.validityMonths,
      });
    }
    await trx("applications").where({ id }).update(update);
    await trx("application_events").insert({
      application_id: id,
      from_status: app.status,
      to_status: action.to,
      actor_id: actor.id,
      message,
    });
    await audit(
      {
        actorId: actor.id,
        action: `application.${input.action}`,
        entityType: "application",
        entityId: id,
        metadata: {
          publicId: app.public_id,
          from: app.status,
          to: action.to,
          ...(certificate ? { certificateId: certificate.public_id } : {}),
        },
        ip,
      },
      trx,
    );
    const athlete = await trx("users as u")
      .leftJoin("athlete_profiles as p", "p.user_id", "u.id")
      .where("u.id", app.athlete_id)
      .first("u.email", "u.first_name", "p.legal_name");
    return { app, certificate, message, athlete };
  });

  const { app, certificate, message, athlete } = outcome;
  const firstName = (athlete.legal_name || athlete.first_name).split(/\s+/)[0];
  const appUrl = `${env.APP_URL}/dashboard/applications/${id}`;
  if (input.action === "request_info") {
    await sendTemplateSafely("infoRequested", athlete.email, {
      firstName,
      publicId: app.public_id,
      message,
      url: appUrl,
    });
  } else if (input.action === "require_assessment") {
    await sendTemplateSafely("assessmentRequired", athlete.email, {
      firstName,
      publicId: app.public_id,
      note: message,
      url: appUrl,
    });
  } else if (input.action === "approve") {
    await sendTemplateSafely("applicationApproved", athlete.email, {
      firstName,
      publicId: app.public_id,
      certificateId: certificate.public_id,
      certificateClass: certificate.class,
      expiresOn: formatDate(certificate.expires_at),
      url: `${env.APP_URL}/dashboard/certificates`,
    });
  } else if (input.action === "reject") {
    await sendTemplateSafely("applicationRejected", athlete.email, {
      firstName,
      publicId: app.public_id,
      reason: message,
      url: appUrl,
    });
  }
  return { status: action.to, certificateId: certificate?.public_id || null };
}

export async function reviewStats() {
  const k = db();
  const counts = await k("applications")
    .whereNot({ status: "draft" })
    .groupBy("status")
    .select("status")
    .count({ n: "*" });
  const byStatus = Object.fromEntries(counts.map((r) => [r.status, Number(r.n)]));
  const [{ hours }] = await k("applications")
    .whereNotNull("decided_at")
    .whereNotNull("submitted_at")
    .where("decided_at", ">", k.raw("now() - interval '365 days'"))
    .select(k.raw("avg(extract(epoch from (decided_at - submitted_at)) / 3600) as hours"));
  const [{ active }] = await k("certificates")
    .where({ status: "active" })
    .where("expires_at", ">=", k.raw("current_date"))
    .count({ active: "*" });
  return {
    byStatus,
    averageReviewHours: hours === null ? null : Number(hours),
    activeCertificates: Number(active),
  };
}
