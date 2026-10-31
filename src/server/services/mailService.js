import "server-only";
import nodemailer from "nodemailer";
import { env } from "../env";
import * as templates from "../templates/emails";

function transport() {
  if (!env.SMTP_HOST) return null;
  if (!globalThis.__ussmfMailer) {
    globalThis.__ussmfMailer = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return globalThis.__ussmfMailer;
}

export async function sendMail({ to, subject, text, html }) {
  const t = transport();
  if (!t) {
    // Development without SMTP: print the email instead of failing.
    console.info(`\n[mail:dev] To: ${to}\n[mail:dev] Subject: ${subject}\n${text}\n`);
    return { delivered: false };
  }
  await t.sendMail({ from: env.MAIL_FROM, to, subject, text, html });
  return { delivered: true };
}

/** Renders a template from templates/emails.js and sends it. */
export async function sendTemplate(name, to, data) {
  const render = templates[name];
  if (!render) throw new Error(`Unknown email template "${name}"`);
  return sendMail({ to, ...render(data) });
}

/** Like sendTemplate, but never throws: a mail outage must not undo a completed action. */
export async function sendTemplateSafely(name, to, data) {
  try {
    return await sendTemplate(name, to, data);
  } catch (err) {
    console.error(`[mail] "${name}" could not be sent: ${err.message}`);
    return { delivered: false };
  }
}
