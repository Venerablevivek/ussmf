import "server-only";
import { fileTypeFromBuffer } from "file-type";
import { db } from "../db/knex";
import { conflict, forbidden, notFound, validationError } from "../http/errors";
import { EDITABLE_STATUSES } from "@/lib/statuses";
import { DOCUMENT_TYPES, MAX_DOCUMENTS, MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/validators";
import { newStorageKey } from "./ids";
import { audit } from "./auditService";
import { deleteObject, headObject, presignDownload, presignUpload, readObjectStart } from "./storageService";

const isStaff = (user) => user.role === "physician" || user.role === "admin";

function toDto(row) {
  return {
    id: row.id,
    name: row.original_name,
    mimeType: row.mime_type,
    size: row.size_bytes,
    status: row.status,
  };
}

// Keep a readable display name; strip paths and control characters.
function cleanFileName(name) {
  const base = [...name.split(/[\\/]/).pop()]
    .filter((ch) => ch.charCodeAt(0) > 31 && ch.charCodeAt(0) !== 127)
    .join("")
    .trim();
  return base.slice(0, 200) || "document";
}

async function loadEditableApplication(k, user, applicationId) {
  const app = await k("applications")
    .where({ id: applicationId })
    .first("id", "athlete_id", "status", "public_id");
  if (!app || app.athlete_id !== user.id) throw notFound("We couldn’t find that application.");
  if (!EDITABLE_STATUSES.includes(app.status)) {
    throw conflict(
      "Documents can only be changed while the application is a draft or when your physician asks for more.",
    );
  }
  return app;
}

/* ---------- Medical records ---------- */

export async function presignDocument(user, applicationId, { fileName, contentType, size }, { ip } = {}) {
  const k = db();
  const app = await loadEditableApplication(k, user, applicationId);
  const [{ count }] = await k("documents").where({ application_id: app.id }).count({ count: "*" });
  if (Number(count) >= MAX_DOCUMENTS) {
    throw validationError(`You can upload up to ${MAX_DOCUMENTS} files. Remove one to add another.`);
  }
  const key = newStorageKey("documents");
  const [row] = await k("documents")
    .insert({
      application_id: app.id,
      original_name: cleanFileName(fileName),
      storage_key: key,
      mime_type: contentType,
      size_bytes: size,
      status: "pending",
      uploaded_by: user.id,
    })
    .returning("*");
  const uploadUrl = await presignUpload(key, contentType, 300);
  await audit({
    actorId: user.id,
    action: "document.upload_started",
    entityType: "document",
    entityId: row.id,
    metadata: { applicationId: app.id },
    ip,
  });
  return { document: toDto(row), uploadUrl, headers: { "Content-Type": contentType } };
}

async function discard(k, row) {
  await deleteObject(row.storage_key);
  await k("documents").where({ id: row.id }).del();
}

/**
 * Confirms a direct upload: the object must exist, match the declared size, and really be a
 * PDF, JPG or PNG by its magic bytes. Anything else is deleted from storage and the database.
 */
export async function completeDocument(user, applicationId, docId, { ip } = {}) {
  const k = db();
  const app = await loadEditableApplication(k, user, applicationId);
  const row = await k("documents").where({ id: docId, application_id: app.id }).first();
  if (!row) throw notFound("We couldn’t find that upload. Try adding the file again.");
  if (row.status === "verified") return { document: toDto(row) };

  const head = await headObject(row.storage_key);
  if (!head) {
    await k("documents").where({ id: row.id }).del();
    throw validationError("We didn’t receive the file. Try uploading it again.");
  }
  if (head.size !== row.size_bytes) {
    await discard(k, row);
    throw validationError("The uploaded file doesn’t match what was selected. Try uploading it again.");
  }
  const detected = await fileTypeFromBuffer(await readObjectStart(row.storage_key, 4096));
  if (!detected || !DOCUMENT_TYPES.includes(detected.mime)) {
    await discard(k, row);
    throw validationError(
      `${row.original_name} isn’t a real PDF, JPG or PNG file. Export it again and retry.`,
    );
  }
  const [updated] = await k("documents")
    .where({ id: row.id })
    .update({ status: "verified", mime_type: detected.mime })
    .returning("*");
  await audit({
    actorId: user.id,
    action: "document.uploaded",
    entityType: "document",
    entityId: row.id,
    metadata: { applicationId: app.id, mimeType: detected.mime, size: row.size_bytes },
    ip,
  });
  return { document: toDto(updated) };
}

export async function deleteDocument(user, applicationId, docId, { ip } = {}) {
  const k = db();
  const app = await loadEditableApplication(k, user, applicationId);
  const row = await k("documents").where({ id: docId, application_id: app.id }).first();
  if (!row) throw notFound("That file was already removed.");
  // During an info request, records the physician already reviewed stay on file.
  if (
    app.status === "info_requested" &&
    row.status === "verified" &&
    row.created_at < (await lastInfoRequestAt(k, app.id))
  ) {
    throw conflict("Files your physician already reviewed can’t be removed. Upload a new version instead.");
  }
  await discard(k, row);
  await audit({
    actorId: user.id,
    action: "document.deleted",
    entityType: "document",
    entityId: row.id,
    metadata: { applicationId: app.id },
    ip,
  });
}

async function lastInfoRequestAt(k, applicationId) {
  const ev = await k("application_events")
    .where({ application_id: applicationId, to_status: "info_requested" })
    .orderBy("created_at", "desc")
    .first("created_at");
  return ev?.created_at || new Date(0);
}

/** A 60-second signed URL to view a record. Owners and staff only; every view is audited. */
export async function documentViewUrl(user, docId, { ip } = {}) {
  const k = db();
  const row = await k("documents as d")
    .join("applications as a", "a.id", "d.application_id")
    .where("d.id", docId)
    .first("d.*", "a.athlete_id");
  if (!row) throw notFound("We couldn’t find that document.");
  if (!isStaff(user) && row.athlete_id !== user.id) throw forbidden();
  if (row.status !== "verified") throw conflict("This file is still uploading.");
  const url = await presignDownload(row.storage_key, {
    expiresIn: 60,
    contentType: row.mime_type,
    fileName: row.original_name,
    inline: true,
  });
  await audit({
    actorId: user.id,
    action: "document.viewed",
    entityType: "document",
    entityId: row.id,
    metadata: { applicationId: row.application_id, role: user.role },
    ip,
  });
  return { url, mimeType: row.mime_type, name: row.original_name, expiresIn: 60 };
}

/* ---------- Certificate photo ---------- */

export async function presignPhoto(user, applicationId, { contentType }, { ip } = {}) {
  const k = db();
  const app = await loadEditableApplication(k, user, applicationId);
  if (app.status !== "draft")
    throw conflict("Your photo can only be changed while the application is a draft.");
  const key = newStorageKey(`photos/${user.id}`);
  const uploadUrl = await presignUpload(key, contentType, 300);
  await audit({
    actorId: user.id,
    action: "photo.upload_started",
    entityType: "user",
    entityId: user.id,
    ip,
  });
  return { key, uploadUrl, headers: { "Content-Type": contentType } };
}

/** Verifies an uploaded photo and makes it the athlete's certificate photo. */
export async function replaceProfilePhoto(user, key, { ip } = {}) {
  if (!key.startsWith(`photos/${user.id}/`) || !/^photos\/[0-9a-f-]+\/[0-9a-f]{40}$/.test(key)) {
    throw validationError("That photo upload isn’t valid. Choose the photo again.");
  }
  const head = await headObject(key);
  if (!head) throw validationError("We didn’t receive your photo. Try uploading it again.");
  if (head.size > MAX_PHOTO_BYTES) {
    await deleteObject(key);
    throw validationError("Photos must be 5 MB or smaller.");
  }
  const detected = await fileTypeFromBuffer(await readObjectStart(key, 4096));
  if (!detected || !PHOTO_TYPES.includes(detected.mime)) {
    await deleteObject(key);
    throw validationError("Choose a JPG or PNG image for your photo.");
  }
  const k = db();
  const profile = await k("athlete_profiles").where({ user_id: user.id }).first("photo_key");
  await k("athlete_profiles")
    .insert({ user_id: user.id, photo_key: key })
    .onConflict("user_id")
    .merge({ photo_key: key, updated_at: k.fn.now() });
  const previous = profile?.photo_key;
  if (previous && previous !== key) {
    const usedByCertificate = await k("certificates").where({ photo_key: previous }).first("id");
    if (!usedByCertificate) await deleteObject(previous);
  }
  await audit({ actorId: user.id, action: "photo.updated", entityType: "user", entityId: user.id, ip });
}

/** Short-lived URL for showing a stored photo (wizard preview, review portal, verify page). */
export function presignPhotoView(key, expiresIn = 300) {
  return presignDownload(key, { expiresIn, inline: true });
}

/* ---------- Maintenance (cron) ---------- */

export async function cleanupPendingUploads(olderThanHours = 24) {
  const k = db();
  const stale = await k("documents")
    .where({ status: "pending" })
    .where("created_at", "<", k.raw(`now() - (? * interval '1 hour')`, [olderThanHours]))
    .limit(500)
    .select("id", "storage_key");
  for (const row of stale) {
    await deleteObject(row.storage_key);
    await k("documents").where({ id: row.id }).del();
  }
  return stale.length;
}
