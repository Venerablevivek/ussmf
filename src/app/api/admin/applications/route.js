import { handler } from "@/server/http/handler";
import { parseQuery } from "@/server/http/validate";
import { applicationsQuerySchema } from "@/lib/validators";
import { listApplications } from "@/server/services/applicationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ req }) => listApplications(parseQuery(req, applicationsQuerySchema)), {
  auth: ["physician", "admin"],
  rateLimit: "read",
});
