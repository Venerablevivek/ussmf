import "server-only";

export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

/**
 * Wraps email content in the federation's clay-style shell (inline styles only, email-client safe).
 * `paragraphs` are plain strings (escaped here); `cta` is { label, url }; `code` shows a monospace ID.
 */
export function renderEmail({ preheader = "", heading, paragraphs = [], cta, code, footnote }) {
  const body = paragraphs
    .map(
      (p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4B5878">${escapeHtml(p)}</p>`,
    )
    .join("");
  const codeBlock = code
    ? `<p style="margin:6px 0 18px"><span style="display:inline-block;font-family:Menlo,Consolas,monospace;font-size:16px;font-weight:600;color:#0F1B3D;background:#EAF3FF;padding:10px 14px;border-radius:12px">${escapeHtml(code)}</span></p>`
    : "";
  const button = cta
    ? `<p style="margin:22px 0 8px"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#3B82F6;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 24px;border-radius:999px">${escapeHtml(cta.label)}</a></p>`
    : "";
  const note = footnote
    ? `<p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#7A86A3">${escapeHtml(footnote)}</p>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F5F9FF">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F9FF;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:28px;padding:32px;box-shadow:18px 22px 44px rgba(52,92,170,.15);font-family:'Plus Jakarta Sans',Segoe UI,Roboto,Arial,sans-serif">
<tr><td>
<p style="margin:0 0 4px;font-weight:800;font-size:17px;color:#0F1B3D">U.S.S.M.F.</p>
<p style="margin:0 0 22px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#7A86A3">United States Sports Medicine Federation</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#0F1B3D">${escapeHtml(heading)}</h1>
${body}${codeBlock}${button}${note}
</td></tr></table>
<p style="margin:18px 0 0;font-size:12px;color:#7A86A3;font-family:Arial,sans-serif">© ${new Date().getFullYear()} United States Sports Medicine Federation</p>
</td></tr></table></body></html>`;
}

export function renderText({ heading, paragraphs = [], cta, code, footnote }) {
  return [
    heading,
    "",
    ...paragraphs,
    code ? `\n${code}` : "",
    cta ? `\n${cta.label}: ${cta.url}` : "",
    footnote ? `\n${footnote}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
