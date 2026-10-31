import { handler, json } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { contactSchema } from "@/lib/validators";
import { createContactMessage } from "@/server/services/messageService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ req }) => {
    const input = await parseJson(req, contactSchema);
    return json(await createContactMessage(input), 201);
  },
  { rateLimit: "contact" },
);
