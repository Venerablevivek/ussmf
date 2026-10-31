import "server-only";
import knexFactory from "knex";
import pg from "pg";
import { env } from "../env";

// DATE columns stay "YYYY-MM-DD" strings so they never shift across time zones.
pg.types.setTypeParser(1082, (value) => value);
// BIGINT counts come back as numbers (row counts never approach 2^53).
pg.types.setTypeParser(20, (value) => Number(value));

function create() {
  return knexFactory({
    client: "pg",
    connection: { connectionString: env.DATABASE_URL },
    // Serverless-friendly: no idle connections held open, and a small ceiling per instance.
    pool: { min: 0, max: 5, idleTimeoutMillis: 10_000 },
    acquireConnectionTimeout: 10_000,
  });
}

// One instance per server process, reused across hot reloads in development.
export function db() {
  if (!globalThis.__ussmfKnex) globalThis.__ussmfKnex = create();
  return globalThis.__ussmfKnex;
}
