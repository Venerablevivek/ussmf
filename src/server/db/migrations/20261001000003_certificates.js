import "server-only";

export async function up(knex) {
  await knex.schema.createTable("certificates", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("public_id").notNullable();
    t.uuid("application_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("applications")
      .onDelete("RESTRICT");
    t.uuid("athlete_id").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    // Snapshots taken at approval so the credential never changes after issue.
    t.text("athlete_name").notNullable();
    t.text("photo_key");
    t.text("discipline").notNullable();
    t.text("class").notNullable();
    t.date("issued_at").notNullable();
    t.date("expires_at").notNullable();
    t.text("status").notNullable().defaultTo("active");
    t.text("status_reason");
    t.uuid("physician_id").references("id").inTable("users").onDelete("SET NULL");
    t.timestamp("reminder_30_sent_at", { useTz: true });
    t.timestamp("reminder_7_sent_at", { useTz: true });
    t.timestamps(true, true, false);
    t.unique(["public_id"], { indexName: "certificates_public_id_unique" });
    t.index(["athlete_id"]);
    t.index(["status"]);
    t.index(["expires_at"]);
    t.index(["created_at"]);
  });
  // "Expired" is derived from expires_at, never stored.
  await knex.raw(`
    ALTER TABLE certificates
      ADD CONSTRAINT certificates_status_check CHECK (status IN ('active', 'suspended', 'revoked')),
      ADD CONSTRAINT certificates_class_check
        CHECK (class IN ('Class 1 · Elite', 'Class 2 · Sport', 'Class 2 · Pilot', 'Class 3 · Recreational')),
      ADD CONSTRAINT certificates_dates_check CHECK (expires_at > issued_at),
      ADD CONSTRAINT certificates_public_id_format CHECK (public_id ~ '^USSMF-AS-[0-9]{4}-[0-9]{5}$')
  `);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("certificates");
}
