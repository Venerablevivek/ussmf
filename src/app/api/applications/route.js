import { handler, json } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { createApplicationSchema } from "@/lib/validators";
import { createDraft, listMyApplications } from "@/server/services/applicationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ user }) => ({ items: await listMyApplications(user) }), {
  auth: ["athlete"],
  rateLimit: "read",
});

export const POST = handler(
  async ({ req, user, ip }) => {
    const input = await parseJson(req, createApplicationSchema);
    const draft = await createDraft(user, input, { ip });
    return json({ application: draft }, draft.resumed ? 200 : 201);
  },
  { auth: ["athlete"], rateLimit: "write" },
);
