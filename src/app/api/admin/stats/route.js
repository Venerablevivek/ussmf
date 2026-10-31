import { handler } from "@/server/http/handler";
import { reviewStats } from "@/server/services/applicationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => reviewStats(), { auth: ["physician", "admin"], rateLimit: "read" });
