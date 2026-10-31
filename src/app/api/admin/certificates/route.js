import { handler } from "@/server/http/handler";
import { parseQuery } from "@/server/http/validate";
import { certificatesQuerySchema } from "@/lib/validators";
import { listCertificates } from "@/server/services/certificateService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ req }) => listCertificates(parseQuery(req, certificatesQuerySchema)), {
  auth: ["physician", "admin"],
  rateLimit: "read",
});
