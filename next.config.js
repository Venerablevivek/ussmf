const isDev = process.env.NODE_ENV !== "production";

// Browsers upload to, and load signed previews from, the private bucket directly,
// so its origin has to be allowed for connect/img/frame in the CSP.
function storageOrigin() {
  try {
    if (process.env.S3_ENDPOINT) return new URL(process.env.S3_ENDPOINT).origin;
    if (process.env.S3_REGION) return `https://s3.${process.env.S3_REGION}.amazonaws.com`;
  } catch {
    // An invalid endpoint is reported by src/server/env.js at startup.
  }
  return "";
}

const storage = storageOrigin();

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${storage}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${storage}${isDev ? " ws: wss:" : ""}`.trim(),
  `frame-src 'self' blob: ${storage}`.trim(),
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["knex", "pg", "file-type", "pdf-lib", "qrcode", "nodemailer"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
