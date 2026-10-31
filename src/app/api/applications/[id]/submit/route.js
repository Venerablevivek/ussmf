import { handler } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { consentSchema } from "@/lib/validators";
import { submitApplication } from "@/server/services/applicationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ req, user, params, ip }) => {
    const input = await parseJson(req, consentSchema);
    return { application: await submitApplication(user, params.id, input, { ip }) };
  },
  { auth: ["athlete"], rateLimit: "write" },
);
