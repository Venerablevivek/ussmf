import { handler } from "@/server/http/handler";
import { clearSessionCookie } from "@/server/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async () => {
  await clearSessionCookie();
});
