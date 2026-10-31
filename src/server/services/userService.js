import "server-only";
import { db } from "../db/knex";
import { conflict, notFound } from "../http/errors";
import { audit } from "./auditService";

export async function listUsers({ q = "", role = "", page = 1, pageSize = 25 }) {
  const k = db();
  const base = k("users");
  if (role) base.where({ role });
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    base.where((w) =>
      w.whereILike("email", like).orWhereRaw("(first_name || ' ' || last_name) ILIKE ?", [like]),
    );
  }
  const [{ count }] = await base.clone().count({ count: "id" });
  const rows = await base
    .clone()
    .orderBy("created_at", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .select("id", "email", "role", "first_name", "last_name", "is_active", "created_at");
  return {
    items: rows.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: `${u.first_name} ${u.last_name}`,
      isActive: u.is_active,
      createdAt: u.created_at,
    })),
    page,
    pageSize,
    total: Number(count),
  };
}

export async function updateUser(actor, id, { role, isActive }, { ip } = {}) {
  if (id === actor.id && (role !== undefined || isActive === false)) {
    throw conflict("You can’t change your own role or deactivate your own account.");
  }
  const k = db();
  return k.transaction(async (trx) => {
    const user = await trx("users").where({ id }).forUpdate().first("id", "role", "is_active");
    if (!user) throw notFound("We couldn’t find that user.");
    const update = { updated_at: trx.fn.now() };
    if (role !== undefined && role !== user.role) update.role = role;
    if (isActive !== undefined && isActive !== user.is_active) {
      update.is_active = isActive;
      // Deactivation signs the user out everywhere.
      if (!isActive) update.session_version = trx.raw("session_version + 1");
    }
    const [row] = await trx("users")
      .where({ id })
      .update(update)
      .returning(["id", "email", "role", "first_name", "last_name", "is_active", "created_at"]);
    if (update.role === "athlete" || (role && role === "athlete")) {
      await trx("athlete_profiles").insert({ user_id: id }).onConflict("user_id").ignore();
    }
    await audit(
      {
        actorId: actor.id,
        action: "user.updated",
        entityType: "user",
        entityId: id,
        metadata: {
          from: { role: user.role, isActive: user.is_active },
          to: { role: row.role, isActive: row.is_active },
        },
        ip,
      },
      trx,
    );
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      name: `${row.first_name} ${row.last_name}`,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  });
}
