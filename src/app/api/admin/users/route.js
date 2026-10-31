import { handler } from "@/server/http/handler";
import { parseQuery } from "@/server/http/validate";
import { usersQuerySchema } from "@/lib/validators";
import { listUsers } from "@/server/services/userService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async ({ req }) => listUsers(parseQuery(req, usersQuerySchema)), {
  auth: ["admin"],
  rateLimit: "read",
});
