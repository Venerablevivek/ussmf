import { handler, json } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { presignSchema } from "@/lib/validators";
import { presignDocument } from "@/server/services/documentService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ req, user, params, ip }) => {
    const input = await parseJson(req, presignSchema);
    return json(await presignDocument(user, params.id, input, { ip }), 201);
  },
  { auth: ["athlete"], rateLimit: "upload" },
);
