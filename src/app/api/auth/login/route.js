import { handler } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { loginSchema } from "@/lib/validators";
import { authenticate } from "@/server/services/authService";
import { publicUser, setSessionCookie } from "@/server/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ req, ip }) => {
    const input = await parseJson(req, loginSchema);
    const user = await authenticate(input, { ip });
    await setSessionCookie(user);
    return { user: publicUser(user) };
  },
  { rateLimit: "login" },
);
