import { handler, json } from "@/server/http/handler";
import { db } from "@/server/db/knex";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  try {
    await db().raw("select 1");
    return { ok: true, database: "up", time: new Date().toISOString() };
  } catch {
    return json({ ok: false, database: "down" }, 503);
  }
});
