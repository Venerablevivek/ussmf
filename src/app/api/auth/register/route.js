import { handler, json } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { registerSchema } from "@/lib/validators";
import { registerAthlete } from "@/server/services/authService";
import { publicUser, setSessionCookie } from "@/server/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ req, ip }) => {
    const input = await parseJson(req, registerSchema);
    const user = await registerAthlete(input, { ip });
    await setSessionCookie(user);
    return json({ user: publicUser(user) }, 201);
  },
  { rateLimit: "register" },
);
