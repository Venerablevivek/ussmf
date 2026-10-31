import "server-only";
import { randomBytes } from "node:crypto";
import { deflateSync } from "node:zlib";
import bcrypt from "bcryptjs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Development demo data. Idempotent: it only replaces the demo accounts and the sample IDs
// below, so it never touches real records. Logins are listed in the README.

const PASSWORDS = {
  admin: "Admin#2026-ussmf",
  physician: "Physician#2026-ussmf",
  athlete: "Athlete#2026-ussmf",
};

const USERS = [
  { key: "admin", email: "admin@ussmf.org", role: "admin", first: "Avery", last: "Collins" },
  { key: "physician", email: "physician@ussmf.org", role: "physician", first: "Elena", last: "Park" },
  {
    key: "jordan",
    email: "jordan.lee@example.com",
    role: "athlete",
    first: "Jordan",
    last: "Lee",
    profile: {
      date_of_birth: "1994-03-12",
      phone: "(303) 555-0142",
      state: "Colorado",
      federation: "USASF",
      member_number: "USASF-48213",
    },
  },
  {
    key: "morgan",
    email: "morgan.brooks@example.com",
    role: "athlete",
    first: "Morgan",
    last: "Brooks",
    profile: {
      date_of_birth: "1988-07-21",
      phone: "(512) 555-0187",
      state: "Texas",
      federation: "BOTH",
      member_number: "USASF-30977",
    },
  },
  {
    key: "alex",
    email: "alex.rivera@example.com",
    role: "athlete",
    first: "Alex",
    last: "Rivera",
    profile: {
      date_of_birth: "1991-05-09",
      phone: "(415) 555-0119",
      state: "California",
      federation: "USASF",
      member_number: "USASF-21456",
    },
  },
  {
    key: "sam",
    email: "sam.patel@example.com",
    role: "athlete",
    first: "Sam",
    last: "Patel",
    profile: {
      date_of_birth: "1979-11-02",
      phone: "(305) 555-0164",
      state: "Florida",
      federation: "WASF",
      member_number: "",
    },
  },
];

const at = (iso) => new Date(iso);

const APPLICATIONS = [
  {
    publicId: "USSMF-APP-2026-3381",
    athlete: "jordan",
    status: "under_review",
    discipline: "skydiving",
    level: "national",
    years: 9,
    conditions: ["None"],
    medications: "None",
    injuries: "Left ankle sprain in 2021, fully recovered.",
    lastPhysical: "2026-09-20",
    created: "2026-10-07T18:20:00Z",
    submitted: "2026-10-08T15:12:00Z",
    physician: true,
    events: [
      ["draft", "submitted", "athlete", "2026-10-08T15:12:00Z"],
      ["submitted", "records_verified", "physician", "2026-10-11T14:05:00Z"],
      ["records_verified", "under_review", "physician", "2026-10-11T14:06:00Z"],
    ],
    documents: ["Annual-physical-2026.pdf", "Resting-ECG-report.pdf", "Vision-test.pdf"],
  },
  {
    publicId: "USSMF-APP-2026-2207",
    athlete: "morgan",
    status: "info_requested",
    discipline: "aerobatics",
    level: "international",
    years: 12,
    conditions: ["Vision correction"],
    medications: "None",
    injuries: "None",
    lastPhysical: "2026-08-30",
    created: "2026-10-14T20:40:00Z",
    submitted: "2026-10-15T16:02:00Z",
    events: [
      ["draft", "submitted", "athlete", "2026-10-15T16:02:00Z"],
      [
        "submitted",
        "info_requested",
        "physician",
        "2026-10-17T13:30:00Z",
        "Upload a vision test dated within the last 12 months",
      ],
    ],
    documents: ["Annual-physical-2026.pdf", "Exercise-ECG-report.pdf"],
  },
  {
    publicId: "USSMF-APP-2026-1048",
    athlete: "alex",
    status: "approved",
    discipline: "paragliding",
    level: "club",
    years: 6,
    conditions: ["None"],
    medications: "None",
    injuries: "None",
    lastPhysical: "2026-09-02",
    created: "2026-10-01T17:00:00Z",
    submitted: "2026-10-02T09:45:00Z",
    decided: "2026-10-14T16:20:00Z",
    physician: true,
    events: [
      ["draft", "submitted", "athlete", "2026-10-02T09:45:00Z"],
      ["submitted", "records_verified", "physician", "2026-10-06T15:00:00Z"],
      ["records_verified", "under_review", "physician", "2026-10-06T15:01:00Z"],
      ["under_review", "approved", "physician", "2026-10-14T16:20:00Z", "Cleared for cross-country flying."],
    ],
    documents: ["Annual-physical-2026.pdf", "Resting-ECG-report.pdf"],
    certificate: {
      publicId: "USSMF-AS-2026-10482",
      class: "Class 2 · Sport",
      issued: "2026-10-14",
      expires: "2027-10-13",
    },
  },
  {
    publicId: "USSMF-APP-2025-0731",
    athlete: "sam",
    status: "approved",
    discipline: "skydiving",
    level: "international",
    years: 15,
    conditions: ["Back or spine"],
    medications: "Ibuprofen as needed after jump days.",
    injuries: "L4 disc irritation in 2019, resolved with physiotherapy.",
    lastPhysical: "2025-09-05",
    created: "2025-09-17T12:00:00Z",
    submitted: "2025-09-18T10:30:00Z",
    decided: "2025-10-01T15:10:00Z",
    physician: true,
    events: [
      ["draft", "submitted", "athlete", "2025-09-18T10:30:00Z"],
      ["submitted", "records_verified", "physician", "2025-09-22T14:00:00Z"],
      ["records_verified", "under_review", "physician", "2025-09-22T14:01:00Z"],
      [
        "under_review",
        "assessment_required",
        "physician",
        "2025-09-25T11:00:00Z",
        "Exercise ECG required for Class 1 competition jumping.",
      ],
      ["assessment_required", "approved", "physician", "2025-10-01T15:10:00Z", "Exercise ECG normal."],
    ],
    documents: ["Annual-physical-2025.pdf", "Exercise-ECG-report.pdf", "Spine-specialist-report.pdf"],
    certificate: {
      publicId: "USSMF-AS-2025-00731",
      class: "Class 1 · Elite",
      issued: "2025-10-01",
      expires: "2026-09-30",
    },
  },
];

/* ---------- Tiny PNG encoder for demo signatures ---------- */
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function signaturePng(seed) {
  const w = 320;
  const h = 90;
  const px = Buffer.alloc(w * h * 4);
  const ink = [0x1e, 0x3a, 0x8a];
  for (let t = 0; t <= 1; t += 0.0004) {
    const x = 14 + 286 * t + 9 * Math.sin(14 * Math.PI * t + seed);
    const y = 46 + 20 * Math.sin(9 * Math.PI * t + seed / 2) * (1 - 0.45 * t);
    for (let dx = -1.4; dx <= 1.4; dx += 0.7) {
      for (let dy = -1.4; dy <= 1.4; dy += 0.7) {
        const ix = Math.round(x + dx);
        const iy = Math.round(y + dy);
        if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;
        const i = (iy * w + ix) * 4;
        px[i] = ink[0];
        px[i + 1] = ink[1];
        px[i + 2] = ink[2];
        px[i + 3] = 255;
      }
    }
  }
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

/* ---------- Sample medical records (clearly marked demo PDFs) ---------- */
async function samplePdf(title, athleteName) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("SAMPLE RECORD · DEMO DATA", {
    x: 56,
    y: 720,
    size: 11,
    font: bold,
    color: rgb(0.72, 0.47, 0.12),
  });
  page.drawText(title.replace(/[-_]/g, " ").replace(/\.pdf$/i, ""), {
    x: 56,
    y: 690,
    size: 22,
    font: bold,
    color: rgb(0.06, 0.11, 0.24),
  });
  page.drawText(`Patient: ${athleteName}`, { x: 56, y: 660, size: 12, font, color: rgb(0.29, 0.35, 0.47) });
  page.drawText("Generated by the U.S.S.M.F. development seed. Not a real medical document.", {
    x: 56,
    y: 636,
    size: 10,
    font,
    color: rgb(0.48, 0.53, 0.64),
  });
  return Buffer.from(await pdf.save());
}

function storage() {
  const { S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
  if (!S3_BUCKET || !S3_REGION || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return null;
  const client = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT || undefined,
    forcePathStyle: true,
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return {
    put: (key, body, contentType) =>
      client.send(
        new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: body, ContentType: contentType }),
      ),
  };
}

export async function seed(knex) {
  const emails = USERS.map((u) => u.email);
  const appIds = APPLICATIONS.map((a) => a.publicId);
  const certIds = APPLICATIONS.filter((a) => a.certificate).map((a) => a.certificate.publicId);

  // Remove previous demo data (only the demo accounts and sample IDs).
  const demoUserIds = await knex("users").whereIn("email", emails).pluck("id");
  await knex("certificates").whereIn("public_id", certIds).orWhereIn("athlete_id", demoUserIds).del();
  await knex("applications").whereIn("public_id", appIds).orWhereIn("athlete_id", demoUserIds).del();
  await knex("users").whereIn("id", demoUserIds).del();
  await knex("contact_messages").where({ email: "riley.chen@example.com" }).del();

  const hashes = {
    admin: await bcrypt.hash(PASSWORDS.admin, 12),
    physician: await bcrypt.hash(PASSWORDS.physician, 12),
    athlete: await bcrypt.hash(PASSWORDS.athlete, 12),
  };

  const ids = {};
  for (const u of USERS) {
    const [row] = await knex("users")
      .insert({
        email: u.email,
        password_hash: hashes[u.role],
        role: u.role,
        first_name: u.first,
        last_name: u.last,
        email_verified_at: knex.fn.now(),
      })
      .returning("id");
    ids[u.key] = row.id;
    if (u.role === "athlete") {
      await knex("athlete_profiles").insert({
        user_id: row.id,
        legal_name: `${u.first} ${u.last}`,
        ...u.profile,
      });
    }
  }

  const s3 = storage();
  let uploads = !!s3;
  if (!s3) console.warn("[seed] S3 is not configured: sample documents are skipped.");

  for (const [index, a] of APPLICATIONS.entries()) {
    const athlete = USERS.find((u) => u.key === a.athlete);
    const athleteId = ids[a.athlete];
    const [app] = await knex("applications")
      .insert({
        public_id: a.publicId,
        athlete_id: athleteId,
        status: a.status,
        discipline: a.discipline,
        level: a.level,
        years_experience: a.years,
        conditions: a.conditions,
        medications: a.medications,
        injuries: a.injuries,
        last_physical_date: a.lastPhysical,
        consents: JSON.stringify({ review: true, accurate: true, suspension: true, acceptedAt: a.submitted }),
        signature_data: signaturePng(index + 1),
        submitted_at: at(a.submitted),
        decided_at: a.decided ? at(a.decided) : null,
        assigned_physician_id: a.physician ? ids.physician : null,
        created_at: at(a.created),
        updated_at: at(a.decided || a.events[a.events.length - 1][3]),
      })
      .returning("id");

    await knex("application_events").insert({
      application_id: app.id,
      from_status: null,
      to_status: "draft",
      actor_id: athleteId,
      created_at: at(a.created),
    });
    for (const [from, to, who, when, message] of a.events) {
      await knex("application_events").insert({
        application_id: app.id,
        from_status: from,
        to_status: to,
        actor_id: who === "athlete" ? athleteId : ids.physician,
        message: message || null,
        created_at: at(when),
      });
      await knex("audit_logs").insert({
        actor_id: who === "athlete" ? athleteId : ids.physician,
        action: to === "submitted" ? "application.submitted" : `application.status_${to}`,
        entity_type: "application",
        entity_id: app.id,
        metadata: JSON.stringify({ publicId: a.publicId, from, to, seed: true }),
        created_at: at(when),
      });
    }

    if (uploads) {
      for (const name of a.documents) {
        const key = `documents/${randomBytes(20).toString("hex")}`;
        const body = await samplePdf(name, `${athlete.first} ${athlete.last}`);
        try {
          await s3.put(key, body, "application/pdf");
        } catch (err) {
          console.warn(`[seed] Could not upload sample documents (${err.message}). Continuing without them.`);
          uploads = false;
          break;
        }
        await knex("documents").insert({
          application_id: app.id,
          original_name: name,
          storage_key: key,
          mime_type: "application/pdf",
          size_bytes: body.length,
          status: "verified",
          uploaded_by: athleteId,
          created_at: at(a.submitted),
        });
      }
    }

    if (a.certificate) {
      await knex("certificates").insert({
        public_id: a.certificate.publicId,
        application_id: app.id,
        athlete_id: athleteId,
        athlete_name: `${athlete.first} ${athlete.last}`,
        photo_key: null,
        discipline: a.discipline,
        class: a.certificate.class,
        issued_at: a.certificate.issued,
        expires_at: a.certificate.expires,
        status: "active",
        physician_id: ids.physician,
        reminder_30_sent_at: a.certificate.expires < "2026-10-30" ? at("2026-08-31T14:00:00Z") : null,
        reminder_7_sent_at: a.certificate.expires < "2026-10-30" ? at("2026-09-23T14:00:00Z") : null,
        created_at: at(a.decided),
        updated_at: at(a.decided),
      });
    }
  }

  await knex("contact_messages").insert({
    name: "Riley Chen",
    email: "riley.chen@example.com",
    topic: "Partnership",
    message:
      "Our paragliding club in Utah would like to host a certification day for members. Who should we talk to?",
  });

  console.info(
    `[seed] Demo data ready: ${USERS.length} accounts, ${APPLICATIONS.length} applications, ${certIds.length} certificates.`,
  );
}
