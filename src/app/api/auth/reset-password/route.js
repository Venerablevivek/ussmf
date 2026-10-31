import { handler } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { resetPasswordSchema } from "@/lib/validators";
import { resetPassword } from "@/server/services/authService";
import { publicUser, setSessionCookie } from "@/server/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ req, ip }) => {
    const input = await parseJson(req, resetPasswordSchema);
    const user = await resetPassword(input, { ip });
    if (user.is_active) await setSessionCookie(user);
    return { user: user.is_active ? publicUser(user) : null };
  },
  { rateLimit: "resetPassword" },
);
