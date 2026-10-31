import "server-only";

const STATUSES = [
  "draft",
  "submitted",
  "records_verified",
  "under_review",
  "assessment_required",
  "info_requested",
  "approved",
  "rejected",
];
const DISCIPLINES = [
  "skydiving",
  "paragliding",
  "hang",
  "gliding",
  "paramotor",
  "ballooning",
  "aerobatics",
  "drone",
];
const LEVELS = ["recreational", "club", "national", "international"];
const list = (values) => values.map((v) => `'${v}'`).join(", ");

export async function up(knex) {
  await knex.schema.createTable("athlete_profiles", (t) => {
    t.uuid("user_id").primary().references("id").inTable("users").onDelete("CASCADE");
    t.text("legal_name");
    t.date("date_of_birth");
    t.text("phone");
    t.text("state");
    t.text("photo_key");
    t.text("federation");
    t.text("member_number");
    t.timestamps(true, true, false);
  });
  await knex.raw(`
    ALTER TABLE athlete_profiles
      ADD CONSTRAINT athlete_profiles_federation_check
      CHECK (federation IS NULL OR federation IN ('USASF', 'WASF', 'BOTH', 'NONE'))
  `);

  await knex.schema.createTable("applications", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("public_id").notNullable();
    t.uuid("athlete_id").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    t.text("status").notNullable().defaultTo("draft");
    t.text("discipline");
    t.text("level");
    t.integer("years_experience");
    t.specificType("conditions", "text[]").notNullable().defaultTo(knex.raw("'{}'::text[]"));
    t.text("medications");
    t.text("injuries");
    t.date("last_physical_date");
    t.jsonb("consents");
    t.text("signature_data");
    t.timestamp("submitted_at", { useTz: true });
    t.timestamp("decided_at", { useTz: true });
    t.uuid("assigned_physician_id").references("id").inTable("users").onDelete("SET NULL");
    t.timestamps(true, true, false);
    t.unique(["public_id"], { indexName: "applications_public_id_unique" });
    t.index(["status"]);
    t.index(["athlete_id"]);
    t.index(["created_at"]);
    t.index(["submitted_at"]);
  });
  await knex.raw(`
    ALTER TABLE applications
      ADD CONSTRAINT applications_status_check CHECK (status IN (${list(STATUSES)})),
      ADD CONSTRAINT applications_discipline_check CHECK (discipline IS NULL OR discipline IN (${list(DISCIPLINES)})),
      ADD CONSTRAINT applications_level_check CHECK (level IS NULL OR level IN (${list(LEVELS)})),
      ADD CONSTRAINT applications_years_check CHECK (years_experience IS NULL OR years_experience BETWEEN 0 AND 30),
      ADD CONSTRAINT applications_public_id_format CHECK (public_id ~ '^USSMF-APP-[0-9]{4}-[0-9]{4,5}$')
  `);

  await knex.schema.createTable("documents", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("application_id").notNullable().references("id").inTable("applications").onDelete("CASCADE");
    t.text("original_name").notNullable();
    t.text("storage_key").notNullable().unique();
    t.text("mime_type").notNullable();
    t.integer("size_bytes").notNullable();
    t.text("status").notNullable().defaultTo("pending");
    t.uuid("uploaded_by").references("id").inTable("users").onDelete("SET NULL");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(["application_id"]);
    t.index(["status", "created_at"]);
  });
  await knex.raw(`
    ALTER TABLE documents
      ADD CONSTRAINT documents_status_check CHECK (status IN ('pending', 'verified')),
      ADD CONSTRAINT documents_mime_check CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png')),
      ADD CONSTRAINT documents_size_check CHECK (size_bytes > 0 AND size_bytes <= 10485760)
  `);

  await knex.schema.createTable("application_events", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("application_id").notNullable().references("id").inTable("applications").onDelete("CASCADE");
    t.text("from_status");
    t.text("to_status").notNullable();
    t.uuid("actor_id").references("id").inTable("users").onDelete("SET NULL");
    t.text("message");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(["application_id", "created_at"]);
  });
  await knex.raw(`
    ALTER TABLE application_events
      ADD CONSTRAINT application_events_to_check CHECK (to_status IN (${list(STATUSES)})),
      ADD CONSTRAINT application_events_from_check CHECK (from_status IS NULL OR from_status IN (${list(STATUSES)}))
  `);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("application_events");
  await knex.schema.dropTableIfExists("documents");
  await knex.schema.dropTableIfExists("applications");
  await knex.schema.dropTableIfExists("athlete_profiles");
}
