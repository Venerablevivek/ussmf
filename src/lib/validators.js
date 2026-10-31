// Zod schemas shared by the browser and the server. Messages are the design's: they say
// what is wrong and how to fix it.
import { z } from "zod";
import { CERTIFICATE_CLASSES, DISCIPLINE_IDS, FEDERATION_IDS, LEVEL_IDS } from "./disciplines";
import { CONDITIONS, NONE_CONDITION } from "./conditions";
import { STATES } from "./states";
import { STATUSES } from "./statuses";
import { ageOn } from "./format";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const APPLICATION_ID_RE = /^USSMF-APP-\d{4}-\d{4,5}$/;
export const CERTIFICATE_ID_RE = /^USSMF-AS-\d{4}-\d{5}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENTS = 10;
export const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const PHOTO_TYPES = ["image/jpeg", "image/png"];

const email = (message = "Enter a valid email address, like name@example.com.") =>
  z.string({ error: message }).trim().toLowerCase().max(254, message).regex(EMAIL_RE, message);

const password = z
  .string({ error: "Enter a password." })
  .min(10, "Use at least 10 characters for your password.")
  .max(128, "Use 128 characters or fewer for your password.");

const isoDate = (required) => z.string({ error: required }).trim().min(1, required).regex(DATE_RE, required);

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/* ---------- Accounts ---------- */
export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80, "Use 80 characters or fewer."),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80, "Use 80 characters or fewer."),
  email: email(),
  password,
});

export const loginSchema = z.object({
  email: email(),
  password: z.string().min(1, "Enter your password.").max(128),
});

export const forgotPasswordSchema = z.object({ email: email() });

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(20, "This reset link is invalid. Request a new one.").max(200),
  password,
});

/* ---------- Application wizard ---------- */
export const personalSchema = z.object({
  legalName: z.string().trim().min(3, "Enter your full legal name.").max(160, "Use 160 characters or fewer."),
  dateOfBirth: isoDate("Enter your date of birth.").refine((v) => {
    const age = ageOn(v);
    return age !== null && age >= 10 && age <= 100;
  }, "Applicants must be between 10 and 100 years old."),
  phone: z
    .string()
    .trim()
    .max(40, "Use 40 characters or fewer.")
    .refine((v) => v.replace(/\D/g, "").length >= 7, "Enter a phone number with at least 7 digits."),
  state: z.string().refine((v) => STATES.includes(v), "Select your state."),
});

export const sportSchema = z.object({
  discipline: z.string().refine((v) => DISCIPLINE_IDS.includes(v), "Select your primary discipline."),
  level: z.string().refine((v) => LEVEL_IDS.includes(v), "Select your level."),
  federation: z.enum(FEDERATION_IDS, { error: "Select your federation membership." }),
  memberNumber: z.string().trim().max(40, "Use 40 characters or fewer.").optional().default(""),
  yearsExperience: z.coerce.number().int().min(0).max(30),
});

export const medicalSchema = z.object({
  conditions: z
    .array(z.enum(CONDITIONS))
    .min(1, "Select at least one option, or “None”.")
    .refine(
      (c) => !(c.includes(NONE_CONDITION) && c.length > 1),
      "“None” can’t be combined with other conditions.",
    ),
  medications: z.string().trim().max(2000, "Use 2,000 characters or fewer.").optional().default(""),
  injuries: z.string().trim().max(2000, "Use 2,000 characters or fewer.").optional().default(""),
  lastPhysicalDate: isoDate("Enter the date of your last physical.").refine(
    (v) => v <= todayIso(),
    "This date is in the future.",
  ),
});

export const consentSchema = z.object({
  consents: z.object(
    {
      review: z.literal(true, { error: "Tick all three boxes to continue." }),
      accurate: z.literal(true, { error: "Tick all three boxes to continue." }),
      suspension: z.literal(true, { error: "Tick all three boxes to continue." }),
    },
    { error: "Tick all three boxes to continue." },
  ),
  signature: z
    .string({ error: "Add your signature." })
    .regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/, "Add your signature.")
    .max(400_000, "Your signature image is too large. Clear it and sign again."),
});

export const STEP_SCHEMAS = { 1: personalSchema, 2: sportSchema, 3: medicalSchema };

// Autosave accepts incomplete drafts: every field optional, only shapes and limits checked.
export const draftPatchSchema = z
  .object({
    legalName: z.string().trim().max(160),
    dateOfBirth: z.union([z.literal(""), z.string().regex(DATE_RE)]),
    phone: z.string().trim().max(40),
    state: z.union([z.literal(""), z.enum(STATES)]),
    discipline: z.union([z.literal(""), z.enum(DISCIPLINE_IDS)]),
    level: z.union([z.literal(""), z.enum(LEVEL_IDS)]),
    federation: z.enum(FEDERATION_IDS),
    memberNumber: z.string().trim().max(40),
    yearsExperience: z.coerce.number().int().min(0).max(30),
    conditions: z.array(z.enum(CONDITIONS)).max(CONDITIONS.length),
    medications: z.string().max(2000),
    injuries: z.string().max(2000),
    lastPhysicalDate: z.union([z.literal(""), z.string().regex(DATE_RE)]),
    photoKey: z.string().max(300),
  })
  .partial()
  .strict();

export const respondSchema = z.object({
  response: z
    .string()
    .trim()
    .min(5, "Write a short reply for your physician, at least 5 characters.")
    .max(4000, "Use 4,000 characters or fewer."),
});

export const createApplicationSchema = z.object({
  renewFrom: z.uuid().optional(),
});

/* ---------- Uploads ---------- */
export const presignSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "The file needs a name.")
    .max(200, "Rename the file to under 200 characters."),
  contentType: z.enum(DOCUMENT_TYPES, { error: "Upload a PDF, JPG or PNG file." }),
  size: z
    .number()
    .int()
    .positive("This file is empty.")
    .max(MAX_UPLOAD_BYTES, "Files must be 10 MB or smaller."),
});

export const photoPresignSchema = z.object({
  contentType: z.enum(PHOTO_TYPES, { error: "Choose a JPG or PNG image for your photo." }),
  size: z
    .number()
    .int()
    .positive("This image is empty.")
    .max(MAX_PHOTO_BYTES, "Photos must be 5 MB or smaller."),
});

/* ---------- Public tools ---------- */
export const statusLookupSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(APPLICATION_ID_RE, "Application IDs look like USSMF-APP-2026-3381."),
  email: email("Enter the email you applied with."),
});

export const certificateIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(CERTIFICATE_ID_RE, "Certificate IDs look like USSMF-AS-2026-10482.");

export const CONTACT_TOPICS = ["Certification", "Partnership", "Insurance & claims", "Media", "Other"];

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120, "Use 120 characters or fewer."),
  email: email("Enter a valid email address."),
  topic: z.enum(CONTACT_TOPICS, { error: "Choose a topic." }),
  message: z
    .string()
    .trim()
    .min(10, "Write a short message, at least 10 characters.")
    .max(5000, "Use 5,000 characters or fewer."),
});

export const newsletterSchema = z.object({ email: email() });

/* ---------- Review portal ---------- */
export const transitionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify_records"), note: z.string().trim().max(2000).optional() }),
  z.object({ action: z.literal("start_review"), note: z.string().trim().max(2000).optional() }),
  z.object({
    action: z.literal("require_assessment"),
    note: z.string().trim().min(5, "Add a note for the athlete about the assessment.").max(2000),
  }),
  z.object({
    action: z.literal("request_info"),
    message: z.string().trim().min(5, "Tell the athlete what you need, at least 5 characters.").max(2000),
  }),
  z.object({
    action: z.literal("approve"),
    certificateClass: z.enum(CERTIFICATE_CLASSES, { error: "Choose a certificate class." }),
    validityMonths: z.coerce
      .number()
      .int()
      .refine((m) => [3, 6, 12, 24].includes(m), "Choose a validity period."),
    notes: z.string().trim().max(2000).optional(),
  }),
  z.object({
    action: z.literal("reject"),
    reason: z.string().trim().min(5, "Give the athlete a reason, at least 5 characters.").max(2000),
  }),
]);

export const certificateStatusSchema = z.object({
  action: z.enum(["suspend", "reinstate", "revoke"]),
  reason: z.string().trim().min(5, "Give a reason, at least 5 characters.").max(1000),
});

export const ROLES = ["athlete", "physician", "admin"];

export const userUpdateSchema = z
  .object({
    role: z.enum(ROLES),
    isActive: z.boolean(),
  })
  .partial()
  .refine((v) => v.role !== undefined || v.isActive !== undefined, "Nothing to update.");

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  pageSize: z.coerce.number().int().min(5).max(100).catch(20),
  q: z.string().trim().max(120).catch(""),
});

export const applicationsQuerySchema = listQuerySchema.extend({
  status: z.enum(["", "open", ...STATUSES.filter((s) => s !== "draft")]).catch(""),
  discipline: z.enum(["", ...DISCIPLINE_IDS]).catch(""),
  level: z.enum(["", ...LEVEL_IDS]).catch(""),
  sort: z.enum(["submitted_desc", "submitted_asc", "updated_desc"]).catch("submitted_desc"),
});

export const certificatesQuerySchema = listQuerySchema.extend({
  state: z.enum(["", "active", "expired", "suspended", "revoked"]).catch(""),
});

export const usersQuerySchema = listQuerySchema.extend({
  role: z.enum(["", ...ROLES]).catch(""),
});

export const messagesQuerySchema = listQuerySchema.extend({
  filter: z.enum(["", "unread"]).catch(""),
});

export const messageReadSchema = z.object({ id: z.uuid(), read: z.boolean() });

/* ---------- Helpers ---------- */
export function fieldErrors(zodError) {
  const out = {};
  for (const issue of zodError?.issues || []) {
    const key = issue.path?.length ? String(issue.path[0]) : "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function validateStep(step, values) {
  const schema = STEP_SCHEMAS[step];
  if (!schema) return { ok: true, errors: {} };
  const result = schema.safeParse(values);
  return result.success
    ? { ok: true, errors: {}, data: result.data }
    : { ok: false, errors: fieldErrors(result.error) };
}
