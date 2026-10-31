// Knex CLI config. Migrations and seeds use the direct (unpooled) connection;
// the app itself uses the pooled DATABASE_URL (see src/server/db/knex.js).
// TLS is controlled by the connection string (e.g. ?sslmode=require).
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL_UNPOOLED (or DATABASE_URL) is not set. Copy .env.example to .env.local and fill it in.",
  );
}

const shared = {
  client: "pg",
  connection: { connectionString },
  pool: { min: 0, max: 2 },
  migrations: {
    directory: "./src/server/db/migrations",
    tableName: "knex_migrations",
    loadExtensions: [".js"],
  },
  seeds: {
    directory: "./src/server/db/seeds",
    loadExtensions: [".js"],
  },
};

export default {
  development: shared,
  test: shared,
  production: shared,
};
