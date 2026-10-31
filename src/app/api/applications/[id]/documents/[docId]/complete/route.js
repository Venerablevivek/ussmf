import { handler } from "@/server/http/handler";
import { completeDocument } from "@/server/services/documentService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ user, params, ip }) => completeDocument(user, params.id, params.docId, { ip }),
  { auth: ["athlete"], rateLimit: "upload" },
);
