import "server-only";
import { NextResponse } from "next/server";
import { env } from "../env";
import { HttpError, forbidden, notFound } from "./errors";
import { enforceRateLimit } from "../services/rateLimit";
import { requireRole, requireUser } from "../auth/guards";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const UUID_PARAMS = ["id", "docId"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function allowedOrigins() {
  const origins = [new URL(env.APP_URL).origin];
  // Vercel preview deployments are served from their own URL.
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL)
    origins.push(`https://${process.env.VERCEL_URL}`);
  return origins;
}

// CSRF protection (together with SameSite=Lax cookies): writes must come from our own pages.
function checkOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin || !allowedOrigins().includes(origin)) {
    throw forbidden("This request didn’t come from the U.S.S.M.F. site. Reload the page and try again.");
  }
}

export function json(data, status = 200, headers) {
  return NextResponse.json(data, { status, headers });
}

function errorResponse(err, label) {
  if (err instanceof HttpError) {
    const error = { code: err.code, message: err.message };
    if (err.fields && Object.keys(err.fields).length) error.fields = err.fields;
    return json({ error }, err.status);
  }
  if (err?.code === "23505") {
    return json({ error: { code: "conflict", message: "That already exists." } }, 409);
  }
  // Only the message and code are logged: never request bodies, medical fields or credentials.
  console.error(`[api] ${label} failed: ${err?.code ? `${err.code} ` : ""}${err?.message || err}`);
  return json(
    { error: { code: "server_error", message: "Something went wrong on our side. Please try again." } },
    500,
  );
}

/**
 * Wraps a route handler: Origin check on writes, auth, rate limiting, JSON responses and errors.
 * options.auth: true (any signed-in user) or an array of roles.
 * options.rateLimit: a preset name from services/rateLimit.js.
 */
export function handler(fn, options = {}) {
  return async function routeHandler(req, ctx) {
    const label = `${req.method} ${new URL(req.url).pathname}`;
    try {
      if (MUTATING.has(req.method)) checkOrigin(req);
      const ip = clientIp(req);
      let user = null;
      if (options.auth === true) user = await requireUser();
      else if (Array.isArray(options.auth)) user = await requireRole(...options.auth);
      if (options.rateLimit) await enforceRateLimit(options.rateLimit, user ? `u:${user.id}` : `ip:${ip}`);
      const params = ctx?.params ? await ctx.params : {};
      // Record IDs in the path are UUIDs; anything else can't exist.
      for (const key of UUID_PARAMS) if (key in params && !UUID_RE.test(params[key])) throw notFound();
      const result = await fn({ req, params, ip, user });
      const res =
        result instanceof Response
          ? result
          : result === undefined
            ? new Response(null, { status: 204 })
            : json(result);
      if (!res.headers.has("Cache-Control")) res.headers.set("Cache-Control", "no-store");
      return res;
    } catch (err) {
      const res = errorResponse(err, label);
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
  };
}
