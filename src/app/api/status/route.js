import { handler } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { statusLookupSchema } from "@/lib/validators";
import { publicStatus } from "@/server/services/applicationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST so the email never appears in a URL. Needs both the ID and the email used to apply,
// and returns only a first name + initial, the discipline and the stage timeline.
export const POST = handler(
  async ({ req }) => {
    const input = await parseJson(req, statusLookupSchema);
    return publicStatus(input);
  },
  { rateLimit: "status" },
);
