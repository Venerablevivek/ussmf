import { handler } from "@/server/http/handler";
import { deleteDocument } from "@/server/services/documentService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DELETE = handler(
  async ({ user, params, ip }) => {
    await deleteDocument(user, params.id, params.docId, { ip });
  },
  { auth: ["athlete"], rateLimit: "write" },
);
