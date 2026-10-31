import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "../env";
import { tooMany } from "../http/errors";

// [requests, window] per identifier. Stricter on public and credential endpoints.
const PRESETS = {
  login: [10, "10 m"],
  register: [5, "60 m"],
  forgotPassword: [5, "60 m"],
  resetPassword: [10, "60 m"],
  status: [20, "1 m"],
  verify: [30, "1 m"],
  contact: [5, "10 m"],
  newsletter: [5, "10 m"],
  upload: [60, "10 m"],
  documentView: [120, "10 m"],
  pdf: [30, "10 m"],
  write: [120, "1 m"],
  read: [300, "1 m"],
};

const UNIT_MS = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

function windowMs(window) {
  const [, n, unit] = /^(\d+)\s*(ms|s|m|h|d)$/.exec(window);
  return Number(n) * UNIT_MS[unit];
}

/* ---------- In-memory fallback (development only) ---------- */
const memory = globalThis.__ussmfRateMemory || (globalThis.__ussmfRateMemory = new Map());

function memoryLimit(key, limit, window) {
  const now = Date.now();
  const span = windowMs(window);
  const hits = (memory.get(key) || []).filter((t) => now - t < span);
  const success = hits.length < limit;
  if (success) hits.push(now);
  memory.set(key, hits);
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (!v.length || now - v[v.length - 1] > span) memory.delete(k);
  }
  return { success, reset: (hits[0] || now) + span };
}

/* ---------- Upstash (shared across serverless instances) ---------- */
const limiters = new Map();

function upstash(name) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!limiters.has(name)) {
    const [limit, window] = PRESETS[name];
    limiters.set(
      name,
      new Ratelimit({
        redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }),
        limiter: Ratelimit.slidingWindow(limit, window),
        prefix: `ussmf:rl:${name}`,
      }),
    );
  }
  return limiters.get(name);
}

function retryMessage(reset) {
  const seconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  if (seconds < 90) return `Too many attempts. Try again in ${seconds} seconds.`;
  return `Too many attempts. Try again in ${Math.ceil(seconds / 60)} minutes.`;
}

/** Throws a 429 HttpError when `identifier` has exceeded the named preset. */
export async function enforceRateLimit(name, identifier) {
  const preset = PRESETS[name];
  if (!preset) throw new Error(`Unknown rate limit preset "${name}"`);
  const limiter = upstash(name);
  let result;
  if (limiter) {
    try {
      result = await limiter.limit(identifier);
    } catch (err) {
      // Keep the site usable if Redis is briefly unreachable.
      console.warn(`[rate-limit] Upstash unavailable for "${name}": ${err.message}`);
      result = memoryLimit(`${name}:${identifier}`, ...preset);
    }
  } else {
    result = memoryLimit(`${name}:${identifier}`, ...preset);
  }
  if (!result.success) throw tooMany(retryMessage(result.reset));
}
