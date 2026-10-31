import { handler } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { certificateStatusSchema } from "@/lib/validators";
import { changeCertificateStatus } from "@/server/services/certificateService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Suspend, reinstate or revoke. The public verify page reads live data, so it reflects this at once.
export const POST = handler(
  async ({ req, user, params, ip }) => {
    const input = await parseJson(req, certificateStatusSchema);
    return { certificate: await changeCertificateStatus(user, params.id, input, { ip }) };
  },
  { auth: ["admin"], rateLimit: "write" },
);
