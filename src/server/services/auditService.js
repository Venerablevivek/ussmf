import "server-only";
import { db } from "../db/knex";

/**
 * Records who did what, to which entity, from where. Metadata must never contain medical
 * fields, signatures or credentials — only identifiers, statuses and short labels.
 */
export async function audit(
  { actorId = null, action, entityType, entityId = null, metadata = {}, ip = null },
  trx,
) {
  await (trx || db())("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    metadata: JSON.stringify(metadata),
    ip,
  });
}

/** Audit entries for an application, its documents and its certificate, newest first. */
export async function auditTrailForApplication(applicationId) {
  const k = db();
  const docIds = await k("documents").where({ application_id: applicationId }).pluck("id");
  const certIds = await k("certificates").where({ application_id: applicationId }).pluck("id");
  return k("audit_logs as a")
    .leftJoin("users as u", "u.id", "a.actor_id")
    .where((q) => {
      q.where({ "a.entity_type": "application", "a.entity_id": applicationId });
      if (docIds.length)
        q.orWhere((w) => w.where("a.entity_type", "document").whereIn("a.entity_id", docIds));
      if (certIds.length)
        q.orWhere((w) => w.where("a.entity_type", "certificate").whereIn("a.entity_id", certIds));
    })
    .orderBy("a.created_at", "desc")
    .limit(200)
    .select(
      "a.id",
      "a.action",
      "a.entity_type",
      "a.metadata",
      "a.ip",
      "a.created_at",
      "u.first_name",
      "u.last_name",
      "u.role",
    );
}
