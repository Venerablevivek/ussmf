import { handler, json } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { newsletterSchema } from "@/lib/validators";
import { subscribe } from "@/server/services/messageService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ req }) => {
    const input = await parseJson(req, newsletterSchema);
    return json(await subscribe(input), 201);
  },
  { rateLimit: "newsletter" },
);
