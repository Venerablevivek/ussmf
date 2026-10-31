import { handler } from "@/server/http/handler";
import { listMyCertificates } from "@/server/services/certificateService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ user }) => ({ items: await listMyCertificates(user) }), {
  auth: true,
  rateLimit: "read",
});
