import { handler } from "@/server/http/handler";
import { parseJson, parseQuery } from "@/server/http/validate";
import { messageReadSchema, messagesQuerySchema } from "@/lib/validators";
import { listMessages, setMessageRead } from "@/server/services/messageService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ req }) => listMessages(parseQuery(req, messagesQuerySchema)), {
  auth: ["physician", "admin"],
  rateLimit: "read",
});

// Mark a contact message read or unread: { id, read }.
export const PATCH = handler(
  async ({ req, user, ip }) => {
    const { id, read } = await parseJson(req, messageReadSchema);
    return { message: await setMessageRead(user, id, read, { ip }) };
  },
  { auth: ["physician", "admin"], rateLimit: "write" },
);
