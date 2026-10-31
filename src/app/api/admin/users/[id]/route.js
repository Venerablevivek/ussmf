import { handler } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { userUpdateSchema } from "@/lib/validators";
import { updateUser } from "@/server/services/userService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = handler(
  async ({ req, user, params, ip }) => {
    const input = await parseJson(req, userUpdateSchema);
    return { user: await updateUser(user, params.id, input, { ip }) };
  },
  { auth: ["admin"], rateLimit: "write" },
);
