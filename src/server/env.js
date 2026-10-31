import "server-only";
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";
const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));
const requiredInProd = (schema) => (isProd ? schema : optional);

const schema = z.object({
  APP_URL: z
    .url("APP_URL must be a full URL such as https://ussmf.org")
    .transform((v) => v.replace(/\/+$/, "")),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (use the provider's pooled connection string)"),
  DATABASE_URL_UNPOOLED: optional,
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  S3_ENDPOINT: optional.pipe(z.url("S3_ENDPOINT must be a full URL").optional()),
  S3_REGION: z.string().min(1, "S3_REGION is required (use 'auto' for Cloudflare R2)"),
  S3_BUCKET: z.string().min(1, "S3_BUCKET is required"),
  S3_ACCESS_KEY_ID: z.string().min(1, "S3_ACCESS_KEY_ID is required"),
  S3_SECRET_ACCESS_KEY: z.string().min(1, "S3_SECRET_ACCESS_KEY is required"),
  UPSTASH_REDIS_REST_URL: requiredInProd(z.url("UPSTASH_REDIS_REST_URL is required in production")),
  UPSTASH_REDIS_REST_TOKEN: requiredInProd(
    z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required in production"),
  ),
  SMTP_HOST: requiredInProd(z.string().min(1, "SMTP_HOST is required in production")),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: optional,
  SMTP_PASS: optional,
  MAIL_FROM: z.string().min(3, 'MAIL_FROM is required, e.g. "U.S.S.M.F. <no-reply@ussmf.org>"'),
  ADMIN_EMAIL: z.email("ADMIN_EMAIL must be an email address"),
  CRON_SECRET: requiredInProd(z.string().min(16, "CRON_SECRET must be at least 16 characters")),
});

let cached;

function format(error) {
  return error.issues.map((i) => `  • ${i.path.join(".") || "env"}: ${i.message}`).join("\n");
}

/** Validates process.env once and returns the typed config. Throws a readable error listing every problem. */
export function getEnv() {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `\n✖ Invalid or missing environment variables:\n${format(result.error)}\n\nCopy .env.example to .env.local and fill these in (see README).\n`,
    );
  }
  cached = Object.freeze(result.data);
  return cached;
}

/**
 * Public site URL for metadata, sitemaps and QR codes on statically rendered pages.
 * Reads APP_URL without validating the rest of the config, so static pages can build on their own.
 */
export function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/** Lazily validated config object: `env.APP_URL` validates on first access. */
export const env = new Proxy(
  {},
  {
    get(_, key) {
      return getEnv()[key];
    },
  },
);
