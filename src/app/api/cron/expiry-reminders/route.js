import { timingSafeEqual } from "node:crypto";
import { handler } from "@/server/http/handler";
import { unauthorized } from "@/server/http/errors";
import { env } from "@/server/env";
import { sendExpiryReminders } from "@/server/services/certificateService";
import { cleanupPendingUploads } from "@/server/services/documentService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req) {
  const secret = env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Called daily by Vercel Cron (see vercel.json) with "Authorization: Bearer ${CRON_SECRET}".
export const GET = handler(async ({ req }) => {
  if (!authorized(req)) throw unauthorized("Missing or invalid cron secret.");
  const reminders = await sendExpiryReminders();
  const removedPendingUploads = await cleanupPendingUploads(24);
  return { ok: true, reminders, removedPendingUploads };
});
