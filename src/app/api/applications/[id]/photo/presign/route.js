import { handler } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { photoPresignSchema } from "@/lib/validators";
import { presignPhoto } from "@/server/services/documentService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ req, user, params, ip }) => {
    const input = await parseJson(req, photoPresignSchema);
    return presignPhoto(user, params.id, input, { ip });
  },
  { auth: ["athlete"], rateLimit: "upload" },
);
