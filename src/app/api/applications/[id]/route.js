import { handler } from "@/server/http/handler";
import { parseValue } from "@/server/http/validate";
import { badRequest } from "@/server/http/errors";
import { draftPatchSchema, respondSchema } from "@/lib/validators";
import { getMyApplication, respondToInfoRequest, updateDraft } from "@/server/services/applicationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(
  async ({ user, params }) => ({ application: await getMyApplication(user, params.id) }),
  {
    auth: ["athlete"],
    rateLimit: "read",
  },
);

// Autosave for drafts, or { response } to answer a physician's information request.
export const PATCH = handler(
  async ({ req, user, params, ip }) => {
    let body;
    try {
      body = await req.json();
    } catch {
      throw badRequest("The request body must be valid JSON.");
    }
    if (body && typeof body === "object" && "response" in body) {
      return respondToInfoRequest(user, params.id, parseValue(respondSchema, body), { ip });
    }
    return updateDraft(user, params.id, parseValue(draftPatchSchema, body ?? {}), { ip });
  },
  { auth: ["athlete"], rateLimit: "write" },
);
