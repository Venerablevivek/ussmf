import "server-only";

export async function up(knex) {
  await knex.schema.createTable("users", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("email").notNullable().unique();
    t.text("password_hash").notNullable();
    t.text("role").notNullable().defaultTo("athlete");
    t.text("first_name").notNullable();
    t.text("last_name").notNullable();
    t.boolean("is_active").notNullable().defaultTo(true);
    t.timestamp("email_verified_at", { useTz: true });
    // Bumped on password reset / deactivation to invalidate every existing session token.
    t.integer("session_version").notNullable().defaultTo(1);
    t.timestamps(true, true, false);
    t.index(["role"]);
    t.index(["created_at"]);
  });
  await knex.raw(`
    ALTER TABLE users
      ADD CONSTRAINT users_role_check CHECK (role IN ('athlete', 'physician', 'admin')),
      ADD CONSTRAINT users_email_lower_check CHECK (email = lower(email))
  `);

  await knex.schema.createTable("password_resets", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.text("token_hash").notNullable().unique();
    t.timestamp("expires_at", { useTz: true }).notNullable();
    t.timestamp("used_at", { useTz: true });
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(["user_id"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("password_resets");
  await knex.schema.dropTableIfExists("users");
}
