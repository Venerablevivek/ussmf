import "server-only";

export async function up(knex) {
  await knex.schema.createTable("audit_logs", (t) => {
    t.bigIncrements("id").primary();
    t.uuid("actor_id").references("id").inTable("users").onDelete("SET NULL");
    t.text("action").notNullable();
    t.text("entity_type").notNullable();
    t.text("entity_id");
    t.jsonb("metadata").notNullable().defaultTo(knex.raw("'{}'::jsonb"));
    t.text("ip");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(["entity_type", "entity_id"]);
    t.index(["actor_id"]);
    t.index(["created_at"]);
  });

  await knex.schema.createTable("newsletter_subscribers", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("email").notNullable().unique();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(["created_at"]);
  });

  await knex.schema.createTable("contact_messages", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("name").notNullable();
    t.text("email").notNullable();
    t.text("topic").notNullable();
    t.text("message").notNullable();
    t.timestamp("read_at", { useTz: true });
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(["created_at"]);
    t.index(["read_at"]);
  });
  await knex.raw(`
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_topic_check
        CHECK (topic IN ('Certification', 'Partnership', 'Insurance & claims', 'Media', 'Other'))
  `);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("contact_messages");
  await knex.schema.dropTableIfExists("newsletter_subscribers");
  await knex.schema.dropTableIfExists("audit_logs");
}
