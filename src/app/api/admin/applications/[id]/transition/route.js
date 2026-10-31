import { handler } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { transitionSchema } from "@/lib/validators";
import { transitionApplication } from "@/server/services/applicationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Illegal transitions are rejected with 409 by the service (rules in src/lib/statuses.js).
export const POST = handler(
  async ({ req, user, params, ip }) => {
    const input = await parseJson(req, transitionSchema);
    return transitionApplication(user, params.id, input, { ip });
  },
  { auth: ["physician", "admin"], rateLimit: "write" },
);
