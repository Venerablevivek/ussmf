import { handler } from "@/server/http/handler";
import { documentViewUrl } from "@/server/services/documentService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ user, params, ip }) => documentViewUrl(user, params.docId, { ip }), {
  auth: true,
  rateLimit: "documentView",
});
