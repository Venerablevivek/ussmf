import { handler } from "@/server/http/handler";
import { parseJson } from "@/server/http/validate";
import { forgotPasswordSchema } from "@/lib/validators";
import { requestPasswordReset } from "@/server/services/authService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async ({ req, ip }) => {
    const input = await parseJson(req, forgotPasswordSchema);
    await requestPasswordReset(input, { ip });
    // Same answer whether or not the account exists.
    return {
      ok: true,
      message: "If an account uses that email, a reset link is on its way. It expires in 1 hour.",
    };
  },
  { rateLimit: "forgotPassword" },
);
