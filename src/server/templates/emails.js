import "server-only";
import { renderEmail, renderText } from "./layout";

// Email templates. None of them include medical details: only names, IDs, statuses and
// the physician's own message where the athlete needs it to act.

function build(subject, content) {
  return { subject, html: renderEmail(content), text: renderText(content) };
}

export function applicationSubmitted({ firstName, publicId, url }) {
  return build(`Application received · ${publicId}`, {
    preheader: "A U.S.S.M.F. physician will review your records.",
    heading: `Thanks, ${firstName}. Your application is in.`,
    paragraphs: [
      "A U.S.S.M.F. physician will review your records. Records checks usually take 1–2 business days, and physician review 3–5 business days.",
      "Keep your application ID to track progress on the homepage tracker or in your dashboard.",
    ],
    code: publicId,
    cta: { label: "Track your application", url },
  });
}

export function infoRequested({ firstName, publicId, message, url }) {
  return build(`Action needed on your application · ${publicId}`, {
    preheader: "Your physician needs a little more information.",
    heading: "Your physician needs more information",
    paragraphs: [
      `Hi ${firstName}, the physician reviewing ${publicId} asked for the following:`,
      message,
      "Upload the requested records and send a reply from your dashboard. Your file goes straight back into review.",
    ],
    cta: { label: "Respond in your dashboard", url },
  });
}

export function assessmentRequired({ firstName, publicId, note, url }) {
  return build(`Fitness assessment required · ${publicId}`, {
    preheader: "One more step before your certificate.",
    heading: "A fitness assessment is the next step",
    paragraphs: [
      `Hi ${firstName}, your physician has asked for an in-person or tele-assessment for ${publicId}.`,
      note,
      "Your physician will contact you to schedule it.",
    ],
    cta: { label: "View your application", url },
  });
}

export function applicationApproved({
  firstName,
  publicId,
  certificateId,
  certificateClass,
  expiresOn,
  url,
}) {
  return build(`You’re certified · ${certificateId}`, {
    preheader: "Your U.S.S.M.F. Medical Fitness Certificate is ready.",
    heading: `Fit to fly, ${firstName}!`,
    paragraphs: [
      `Your application ${publicId} was approved. Your ${certificateClass} certificate is valid until ${expiresOn}.`,
      "Download the PDF from your dashboard. Organizers can scan its QR code to verify it in seconds.",
    ],
    code: certificateId,
    cta: { label: "Download your certificate", url },
  });
}

export function applicationRejected({ firstName, publicId, reason, url }) {
  return build(`Update on your application · ${publicId}`, {
    preheader: "Your application was not approved.",
    heading: "Your application was not approved",
    paragraphs: [
      `Hi ${firstName}, after review, ${publicId} was not approved. The reviewing physician wrote:`,
      reason,
      "You can contact info@ussmf.org with questions or apply again when your circumstances change.",
    ],
    cta: { label: "Open your dashboard", url },
  });
}

export function passwordReset({ firstName, url }) {
  return build("Reset your U.S.S.M.F. password", {
    preheader: "This link expires in 1 hour.",
    heading: "Reset your password",
    paragraphs: [
      `Hi ${firstName}, use the button below to choose a new password. The link works once and expires in 1 hour.`,
    ],
    cta: { label: "Choose a new password", url },
    footnote: "If you didn’t ask for this, you can ignore this email. Your password stays the same.",
  });
}

export function contactNotification({ name, email, topic, message, url }) {
  return build(`New contact message · ${topic}`, {
    preheader: `${name} wrote via the contact form.`,
    heading: "New message from the contact form",
    paragraphs: [`From: ${name} <${email}>`, `Topic: ${topic}`, message],
    cta: { label: "Open the inbox", url },
  });
}

export function expiryReminder({ firstName, certificateId, expiresOn, days, url }) {
  return build(`Your certificate expires in ${days} days · ${certificateId}`, {
    preheader: "Renew early to keep flying without a gap.",
    heading: `Your certificate expires in ${days} days`,
    paragraphs: [
      `Hi ${firstName}, certificate ${certificateId} is valid until ${expiresOn}.`,
      "Start a renewal from your dashboard. We pre-fill it from your last application.",
    ],
    cta: { label: "Renew now", url },
  });
}

export function certificateStatusChanged({ firstName, certificateId, status, reason, url }) {
  const verb = { suspended: "suspended", revoked: "revoked", active: "reinstated" }[status];
  return build(`Your certificate was ${verb} · ${certificateId}`, {
    preheader: `Certificate ${certificateId} was ${verb}.`,
    heading: `Your certificate was ${verb}`,
    paragraphs: [
      `Hi ${firstName}, certificate ${certificateId} was ${verb} by the U.S.S.M.F. Medical Board.`,
      reason ? `Reason: ${reason}` : "",
      "Contact info@ussmf.org if you have questions.",
    ].filter(Boolean),
    cta: { label: "View your certificates", url },
  });
}
