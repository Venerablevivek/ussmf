# U.S.S.M.F. — Air Sports Medical Fitness Certificate platform

The United States Sports Medicine Federation's web platform for air sports: athletes apply for a
**Medical Fitness Certificate** and upload their medical records; a U.S.S.M.F. physician reviews the
file and approves it, asks for more information or rejects it; approved athletes get a digital
certificate (PDF + QR code) that anyone can verify online.

One Next.js app (App Router, JavaScript only) deployed on Vercel. The backend is Next.js Route
Handlers on the Node.js runtime, PostgreSQL through Knex, and a private S3-compatible bucket that the
browser uploads to directly with presigned URLs.

| Layer     | Choice                                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19                                                                    |
| Styling   | Tailwind CSS 4 (`@theme` tokens) + the design's clay classes in `@layer components`                             |
| Motion    | Framer Motion (`motion/react`) for entrances, reveals, springs, tabs, carousel; CSS keyframes for ambient loops |
| Database  | PostgreSQL via Knex + `pg` (pooled connection, `globalThis`-cached instance)                                    |
| Files     | S3-compatible private bucket (R2 / S3 / Supabase Storage) via `@aws-sdk/client-s3` presigned URLs               |
| Auth      | Email + password (bcryptjs, cost 12), HS256 JWT (`jose`) in an httpOnly, Secure, SameSite=Lax cookie            |
| Other     | zod (shared validation), `@upstash/ratelimit`, `file-type`, `pdf-lib`, `qrcode`, `nodemailer`, `date-fns`       |

---

## 1. Local setup

**Requirements:** Node.js 22 LTS or newer, a PostgreSQL 13+ database, an S3-compatible bucket.

1. **Postgres.** Use a local server, or a free [Neon](https://neon.tech) or Supabase project.
   Locally: `createdb ussmf` (or create it in pgAdmin).
2. **Bucket.** A free Cloudflare R2 bucket works well. Create a **private** bucket (e.g.
   `ussmf-medical`) and an API token with Object Read & Write. Then set the bucket **CORS** so the
   browser may upload directly, from your app's origin only:

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

   (R2: bucket → Settings → CORS policy. AWS S3: bucket → Permissions → CORS.) Viewing files uses
   short-lived signed GET links in `<img>`/`<iframe>`/new tabs, which don't need CORS.

3. **Environment.** Copy `.env.example` to `.env.local` and fill it in. Generate secrets with
   `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
   In development, Upstash, SMTP and `CRON_SECRET` are optional: rate limits fall back to memory
   and emails are printed to the terminal.
4. **Install, migrate, seed, run:**

```bash
npm install
```

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Open <http://localhost:3000>. The app validates every environment variable when the server starts
and stops with a list of anything missing.

### Federation images

Put the official files in `public/assets/`: `logo.jpg`, `sanaz.jpg`, `wasflogo.png`,
`usasflogo.jpg`. Until they exist the design's fallbacks show (the SVG seal, the "SD" monogram and
the WASF/USASF initials).

### Seed logins (development only)

| Role                    | Email                       | Password               |
| ----------------------- | --------------------------- | ---------------------- |
| Admin                   | `admin@ussmf.org`           | `Admin#2026-ussmf`     |
| Physician               | `physician@ussmf.org`       | `Physician#2026-ussmf` |
| Athlete (Jordan Lee)    | `jordan.lee@example.com`    | `Athlete#2026-ussmf`   |
| Athlete (Morgan Brooks) | `morgan.brooks@example.com` | `Athlete#2026-ussmf`   |
| Athlete (Alex Rivera)   | `alex.rivera@example.com`   | `Athlete#2026-ussmf`   |
| Athlete (Sam Patel)     | `sam.patel@example.com`     | `Athlete#2026-ussmf`   |

Seeded records match the IDs in the design, so the homepage tools work immediately:

| ID                    | What it is                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `USSMF-APP-2026-3381` | Jordan Lee, skydiving, at physician review (track with `jordan.lee@example.com`)                  |
| `USSMF-APP-2026-2207` | Morgan Brooks, aerobatics, info requested: "Upload a vision test dated within the last 12 months" |
| `USSMF-AS-2026-10482` | Alex Rivera, paragliding, Class 2 · Sport, valid until Oct 13, 2027                               |
| `USSMF-AS-2025-00731` | Sam Patel, skydiving, Class 1 · Elite, expired Sep 30, 2026                                       |

The seed is idempotent and only replaces these demo accounts and IDs. If the bucket is reachable it
also uploads clearly labelled sample PDFs as the applications' records.

### Scripts

| Script                                                        | Does                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `npm run dev` / `build` / `start`                             | Next.js                                                          |
| `npm run db:migrate` / `db:rollback` / `db:seed` / `db:reset` | Knex CLI with `knexfile.js` (uses `DATABASE_URL_UNPOOLED`)       |
| `npm run vercel-build`                                        | Runs migrations, then `next build` (used on every Vercel deploy) |
| `npm run lint` / `format`                                     | ESLint / Prettier                                                |

---

## 2. How it's organized

```
src/
├─ proxy.js            Redirects signed-out visitors away from /dashboard and /admin (not a security boundary)
├─ instrumentation.js  Validates env vars once at server start
├─ app/                Pages (server components by default) and the API
│  ├─ page.js          Homepage: every section of the design, in order
│  ├─ apply/           Five-step application wizard
│  ├─ verify/          Verification form, and /verify/[certificateId] (the QR target, rendered per request)
│  ├─ login/ register/ forgot-password/ reset-password/
│  ├─ dashboard/       Athlete area: applications, info-request replies, certificates
│  ├─ admin/           Physician + admin portal: overview, queue, review, certificates, messages, users
│  └─ api/**/route.js  BACKEND — thin route handlers (Node.js runtime, force-dynamic)
├─ components/         ui/, layout/, motion/, sections/, hero/, certification/, dashboard/, admin/, auth/
├─ hooks/              useAuth, useAutosave, useUpload, usePointerTilt, useFocusTrap
├─ lib/                Shared by browser and server, no secrets: zod schemas, statuses, disciplines,
│                      eligibility rules, formatting, fetch wrapper
└─ server/             Server-only (every file imports "server-only")
   ├─ env.js           zod-validated configuration
   ├─ db/              knex.js, migrations/, seeds/
   ├─ auth/            session.js (jose + cookie), guards.js (requireUser / requireRole)
   ├─ http/            handler.js (errors, JSON, Origin check, rate limit), errors.js, validate.js
   ├─ services/        application, document, certificate, storage, pdf, mail, audit, auth, user,
   │                   message, rateLimit, ids
   └─ templates/       Email templates
```

**Request flow.** A page or client component calls `/api/...` → the route handler is wrapped by
`server/http/handler.js` (Origin check on writes, auth + role, rate limit, zod parsing, uniform
`{ error: { code, message, fields } }` errors, `Cache-Control: no-store`) → it calls a service in
`server/services/` → the service talks to Postgres (Knex) and/or the bucket (S3 SDK). Data-heavy
pages (dashboard, admin, `/verify/[id]`) call the same services directly on the server instead of
fetching their own API.

**Uploads never pass through the API** (Vercel caps request bodies at 4.5 MB):
`POST …/documents/presign` (checks owner, editable status, type, ≤ 10 MB, ≤ 10 files, creates a
`pending` row with a random key) → browser `PUT`s to the bucket with `XMLHttpRequest` (real progress
rings) → `POST …/documents/[docId]/complete` (HEAD for size, ranged GET of the first 4 KB, magic-byte
check with `file-type`; mismatches are deleted from storage and the database). Pending uploads older
than 24 hours are removed by the daily cron.

**Status lifecycle** (rules in `src/lib/statuses.js`, enforced by the server with 409s):
`draft → submitted → records_verified → under_review → (assessment_required) → approved | rejected`,
with `info_requested` as a side state that returns to `under_review` when the athlete replies.
Every transition writes an `application_events` row and an `audit_logs` entry.

---

## 3. Deploying to Vercel

1. **Import the repository** in Vercel (framework preset: Next.js). `vercel.json` sets the build
   command to `npm run vercel-build`, which runs migrations before building.
2. **Add the environment variables** from `.env.example` for Production (and Preview if you use it).
   `APP_URL` must be the production origin, e.g. `https://ussmf.org`.
3. **Connect Postgres.** Add Neon from the Vercel Marketplace (it sets `DATABASE_URL` pooled and
   `DATABASE_URL_UNPOOLED` direct), or paste any provider's pooled URL into `DATABASE_URL` and its
   direct URL into `DATABASE_URL_UNPOOLED`. Both must be available at build time for migrations.
4. **Add Upstash Redis** from the Marketplace and make sure `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` are set.
5. **Set the bucket CORS** to the production domain (replace `http://localhost:3000` with your
   `APP_URL`; keep only origins you control).
6. **Confirm the cron job** appears under Project → Settings → Cron Jobs
   (`/api/cron/expiry-reminders`, daily). Set `CRON_SECRET`; Vercel sends it as a Bearer token.
7. **Seed only if you want demo data.** Run `npm run db:seed` locally against the production
   `DATABASE_URL_UNPOOLED` — or don't, and create the real admin by registering and promoting the
   account in SQL: `update users set role = 'admin' where email = '…';`

---

## 4. Security and privacy

- Medical records live in a **private** bucket under random keys; they're reachable only through
  60-second signed links issued after a role check, and every view and certificate download is
  written to `audit_logs` (who, what, when, IP).
- Athletes can only reach their own data; physicians and admins can reach applications. Checks are
  in the services, not just the UI. Public endpoints (`/api/status`, `/api/verify`) return no
  medical data and are rate-limited and never cached.
- CSRF: writes must carry an `Origin` matching `APP_URL`, on top of SameSite=Lax cookies.
- Sessions are invalidated on password reset and deactivation (`session_version`).
- Logs never include request bodies, medical fields, signatures or passwords.
- Security headers: CSP (bucket origin allowed for uploads, images and the PDF viewer only),
  HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.

**Before launch:** choose a database and storage provider with **encryption at rest and automated
backups** (Neon, Supabase, R2 and S3 all offer both), and get **legal advice on health-data rules**
such as HIPAA (and state privacy laws) — including whether you need Business Associate Agreements
with your hosting, database, storage and email providers.

---

## 5. Assumptions

Decisions made where the brief was ambiguous:

1. **Next.js 16.4** is the latest stable release, so the request interceptor is `src/proxy.js`.
2. **The email used to apply is the account email.** It's shown read-only in the wizard; the public
   tracker matches the application ID against it.
3. **Extra columns:** `athlete_profiles.legal_name` (the wizard's "Full legal name");
   `certificates.athlete_name` and `certificates.photo_key` (snapshots so an issued credential never
   changes); `users.session_version` (to revoke sessions).
4. **Seed has four athletes** — the design names four different people (Jordan, Morgan, Alex, Sam).
5. **"Start physician review"** is an explicit action between _records verified_ and _under
   review_; it assigns the physician. Approving, rejecting or requiring an assessment also assigns
   the acting physician if none is set.
6. **Public tracker privacy:** for `info_requested` and `rejected`, the tracker says to sign in
   instead of showing the physician's text (which can contain medical details). The dashboard shows
   the full message. Drafts show "Not submitted yet".
7. **Who sees which notes:** information requests, assessment notes and rejection reasons are shown
   to (and emailed to) the athlete; verification/review/approval notes stay internal.
8. **Validity:** physicians choose 3, 6, 12 or 24 months; the default is 12, or 6 for athletes 60+.
   A certificate runs through the day before the anniversary (issued Oct 14, 2026 → expires Oct 13,
   2027). Classes: Class 1 · Elite, Class 2 · Sport, Class 2 · Pilot, Class 3 · Recreational.
9. **One open draft per athlete.** Reopening `/apply` resumes it; **Renew** creates a draft from the
   certificate's application, or fills the empty fields of an open draft.
10. **Records a physician already reviewed** can't be deleted while answering an info request
    (new files can be added).
11. **Certificate photo** must be JPG or PNG (what `pdf-lib` can embed), up to 5 MB.
12. **Physicians can view and download** certificates; only **admins** suspend, reinstate or revoke.
13. **Design additions (beyond the email field):** a "Sign in / Dashboard / Portal" link styled like
    the existing "Verify" nav link (needed to reach accounts), and a "Start physician review" action.
    The homepage sample's "Download PDF" opens the athlete's certificates page.
14. **Demo sample buttons** under the tracker and verifier are kept (they now fill the seeded email
    too). Set `NEXT_PUBLIC_DEMO_SAMPLES=false` to hide them in production.
15. **Rendering fixes to the design's CSS** (visuals unchanged):
    - `body{overflow-x:hidden}` together with `html{overflow-x:clip}` turned `<body>` into a scroll
      container, which silently broke the sticky header; horizontal overflow is now clipped on
      `<html>` only.
    - In the original, `.rv.in{transform:none}` overrode the cards' hover lifts; the lifts now run
      as Framer Motion springs, as the brief asks.
    - The values marquee is duplicated so its `translateX(-50%)` loop is seamless.
    - Browser default margins the design relied on (the founder quote's) are kept; the default
      8px body margin is not (sections are meant to be full-bleed).
    - Animated widths (phase bar, wizard progress) use `scaleX` so only transform and opacity animate.
16. **Contrast:** the locked palette renders exactly as designed. Several of its tinted text pairs
    measure 3–4.4:1 (e.g. `--ink-3` on white 3.6:1). Visitors whose OS requests more contrast
    (`prefers-contrast: more`) get AA-passing (≥ 4.5:1) versions of the same hues. To make those the
    default for everyone, move the overrides in `globals.css` into `:root`.
17. **PDF fonts:** standard PDF fonts (no font files on disk) cover Latin text; other characters
    in names are transliterated where possible. The seal's ★ separators are drawn as •.
18. **Origin check** also accepts the deployment's own URL on Vercel **preview** deployments.
19. **Rate limits** (per IP, or per user when signed in): login 10/10 min, register 5/h, password
    emails 5/h, status 20/min, verify 30/min, contact and newsletter 5/10 min, uploads 60/10 min.
20. **Upstash, SMTP and `CRON_SECRET` are required in production** and optional in development.
21. **Migrations and seeds also import `server-only`.** The Knex CLI runs with
    `--conditions=react-server`, the condition under which that guard is a no-op.
22. **Linting** uses a plain-JS flat config (`@next/eslint-plugin-next`, React, hooks) because
    `eslint-config-next` pulls in TypeScript.
23. **Node.js 22+** is required (`file-type` 22).
