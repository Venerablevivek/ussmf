import "server-only";
import { db } from "../db/knex";
import { env } from "../env";
import { notFound } from "../http/errors";
import { audit } from "./auditService";
import { sendTemplateSafely } from "./mailService";

export async function subscribe({ email }) {
  await db()("newsletter_subscribers").insert({ email }).onConflict("email").ignore();
  return { ok: true };
}

export async function createContactMessage({ name, email, topic, message }) {
  const [row] = await db()("contact_messages").insert({ name, email, topic, message }).returning(["id"]);
  await sendTemplateSafely("contactNotification", env.ADMIN_EMAIL, {
    name,
    email,
    topic,
    message,
    url: `${env.APP_URL}/admin/messages`,
  });
  return { id: row.id };
}

export async function listMessages({ filter = "", page = 1, pageSize = 20 }) {
  const k = db();
  const base = k("contact_messages");
  if (filter === "unread") base.whereNull("read_at");
  const [{ count }] = await base.clone().count({ count: "id" });
  const [{ unread }] = await k("contact_messages").whereNull("read_at").count({ unread: "id" });
  const rows = await base
    .clone()
    .orderBy("created_at", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .select("id", "name", "email", "topic", "message", "read_at", "created_at");
  return {
    items: rows.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      topic: m.topic,
      message: m.message,
      readAt: m.read_at,
      createdAt: m.created_at,
    })),
    page,
    pageSize,
    total: Number(count),
    unread: Number(unread),
  };
}

export async function setMessageRead(actor, id, read, { ip } = {}) {
  const k = db();
  const [row] = await k("contact_messages")
    .where({ id })
    .update({ read_at: read ? k.fn.now() : null })
    .returning(["id", "read_at"]);
  if (!row) throw notFound("We couldn’t find that message.");
  await audit({
    actorId: actor.id,
    action: read ? "message.read" : "message.unread",
    entityType: "contact_message",
    entityId: id,
    ip,
  });
  return { id: row.id, readAt: row.read_at };
}
