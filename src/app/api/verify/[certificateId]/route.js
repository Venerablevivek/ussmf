import { handler } from "@/server/http/handler";
import { parseValue } from "@/server/http/validate";
import { certificateIdSchema } from "@/lib/validators";
import { verifyCertificate } from "@/server/services/certificateService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Never cached: suspensions and revocations must show up immediately.
export const GET = handler(
  async ({ params }) =>
    verifyCertificate(parseValue(certificateIdSchema, decodeURIComponent(params.certificateId))),
  { rateLimit: "verify" },
);
