import { handler } from "@/server/http/handler";
import { getCurrentUser, publicUser } from "@/server/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => ({ user: publicUser(await getCurrentUser()) }), { rateLimit: "read" });
