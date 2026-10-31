import "server-only";
import {
  PDFDocument,
  StandardFonts,
  appendBezierCurve,
  clip,
  closePath,
  endPath,
  lineTo,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  degrees,
} from "pdf-lib";
import QRCode from "qrcode";
import { formatDate } from "@/lib/format";
import { readObject } from "./storageService";

// US Letter, landscape. Generated on request; nothing is stored.
const W = 792;
const H = 612;

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const C = {
  ink: hex("#0F1B3D"),
  ink2: hex("#4B5878"),
  ink3: hex("#7A86A3"),
  line: hex("#DCE6F7"),
  sky: hex("#F6F9FF"),
  sky2: hex("#EAF3FF"),
  blue: hex("#3B82F6"),
  blueD: hex("#2563EB"),
  navy: hex("#1E3A8A"),
  sealBlue: hex("#3366E0"),
  coral: hex("#FF7A6B"),
  coralD: hex("#E04E3C"),
  mint: hex("#1FB27F"),
  lavD: hex("#7C5CE0"),
  white: rgb(1, 1, 1),
};

/** Standard PDF fonts only cover WinAnsi; fold accents and replace anything else. */
function safeText(font, text) {
  let out = "";
  for (const ch of String(text ?? "")) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      const folded = ch.normalize("NFKD").replace(/[̀-ͯ]/g, "");
      try {
        font.encodeText(folded);
        out += folded;
      } catch {
        out += "?";
      }
    }
  }
  return out;
}

function roundedRectPath(x, y, w, h, r) {
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
}

// Clipping path ops (PDF coordinates, y up) for a rounded rectangle.
function roundedClipOps(x, y, w, h, r) {
  const k = 0.5523 * r;
  return [
    moveTo(x + r, y),
    lineTo(x + w - r, y),
    appendBezierCurve(x + w - r + k, y, x + w, y + r - k, x + w, y + r),
    lineTo(x + w, y + h - r),
    appendBezierCurve(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h),
    lineTo(x + r, y + h),
    appendBezierCurve(x + r - k, y + h, x, y + h - r + k, x, y + h - r),
    lineTo(x, y + r),
    appendBezierCurve(x, y + r - k, x + r - k, y, x + r, y),
    closePath(),
    clip(),
    endPath(),
  ];
}

function centered(page, text, { y, size, font, color, x = W / 2, charSpacing = 0 }) {
  const width = font.widthOfTextAtSize(text, size) + charSpacing * Math.max(0, text.length - 1);
  if (!charSpacing) return page.drawText(text, { x: x - width / 2, y, size, font, color });
  let cx = x - width / 2;
  for (const ch of text) {
    page.drawText(ch, { x: cx, y, size, font, color });
    cx += font.widthOfTextAtSize(ch, size) + charSpacing;
  }
}

/* ---------- Guilloche security pattern (same curves as the web certificate) ---------- */
function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

function guilloche(page) {
  const scale = Math.max(W / 800, H / 520);
  const offX = (W - 800 * scale) / 2;
  const offY = (H - 520 * scale) / 2;
  const colors = ["#93C5FD", "#C4B5FD", "#FDBA9F", "#86EFAC"];
  for (let k = 0; k < 4; k++) {
    const R = 170 + k * 24;
    const rr = 26 + k * 7;
    const dd = 58 + k * 5;
    const tm = Math.PI * 2 * Math.min(rr / gcd(R, rr), 9);
    let d = "";
    for (let t = 0; t <= tm + 0.01; t += 0.04) {
      const x = 400 + (R - rr) * Math.cos(t) + dd * Math.cos(((R - rr) / rr) * t);
      const y = 260 + ((R - rr) * Math.sin(t) - dd * Math.sin(((R - rr) / rr) * t)) * 0.62;
      d += `${d ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    page.drawSvgPath(d, {
      x: offX,
      y: H - offY,
      scale,
      borderColor: hex(colors[k]),
      borderWidth: 0.6,
      borderOpacity: 0.32,
    });
  }
  for (let j = 0; j < 14; j++) {
    let d = `M-10 ${20 + j * 36}`;
    for (let x = 0; x <= 820; x += 20) d += ` L${x} ${(20 + j * 36 + Math.sin(x / 38 + j) * 9).toFixed(1)}`;
    page.drawSvgPath(d, {
      x: offX,
      y: H - offY,
      scale,
      borderColor: C.line,
      borderWidth: 0.6,
      borderOpacity: 0.5,
    });
  }
}

/* ---------- U.S.S.M.F. seal (from the design's SVG symbol, 100×100 units) ---------- */
function drawSeal(page, fonts, cx, cy, size) {
  const k = size / 100;
  const left = cx - size / 2;
  const top = cy + size / 2;
  const svg = (d, opts) => page.drawSvgPath(d, { x: left, y: top, scale: k, ...opts });

  page.drawCircle({ x: cx, y: cy, size: 49 * k, color: C.navy });
  page.drawCircle({ x: cx - 3 * k, y: cy + 3 * k, size: 45 * k, color: C.sealBlue, opacity: 0.9 });
  page.drawCircle({
    x: cx,
    y: cy,
    size: 44 * k,
    borderColor: C.white,
    borderWidth: 0.7 * k,
    borderOpacity: 0.45,
  });

  // Ring text along a radius-37 arc, starting on the left and running clockwise over the top.
  const ring = "UNITED STATES SPORTS MEDICINE FEDERATION • AIR SPORTS •";
  const fs = 5.6 * k;
  const r = 37 * k;
  const widths = [...ring].map((ch) => fonts.bold.widthOfTextAtSize(ch, fs));
  const spread = (226 * k) / widths.reduce((a, b) => a + b, 0);
  let dist = 0;
  [...ring].forEach((ch, i) => {
    const w = widths[i] * spread;
    const theta = Math.PI - (dist + w / 2) / r;
    const rot = theta - Math.PI / 2;
    const px = cx + r * Math.cos(theta) - (widths[i] / 2) * Math.cos(rot);
    const py = cy + r * Math.sin(theta) - (widths[i] / 2) * Math.sin(rot);
    page.drawText(ch, {
      x: px,
      y: py,
      size: fs,
      font: fonts.bold,
      color: C.white,
      rotate: degrees((rot * 180) / Math.PI),
    });
    dist += w;
  });

  page.drawCircle({ x: cx, y: cy, size: 29 * k, color: C.white });
  page.drawCircle({
    x: cx,
    y: cy,
    size: 26.5 * k,
    color: hex("#F5F9FF"),
    borderColor: C.line,
    borderWidth: 0.8 * k,
  });
  svg("M45 53c-6.5.5-12.5-2-16-7 4.2 1.3 8.4 1.4 11.6.4-3.2-.4-6.4-2.4-7.6-4.8 4.4 1.6 8.8 1.8 12 1.6z", {
    color: C.blue,
  });
  svg("M55 53c6.5.5 12.5-2 16-7-4.2 1.3-8.4 1.4-11.6.4 3.2-.4 6.4-2.4 7.6-4.8-4.4 1.6-8.8 1.8-12 1.6z", {
    color: C.blue,
  });
  svg(roundedRectPath(46.2, 35, 7.6, 23, 2.4), { color: C.coral });
  svg(roundedRectPath(39, 42.7, 22, 7.6, 2.4), { color: C.coral });
  centered(page, "USSMF", { x: cx, y: cy - 18.5 * k, size: 6.2 * k, font: fonts.bold, color: C.ink });
}

async function embedPhoto(pdf, key) {
  if (!key) return null;
  const bytes = await readObject(key).catch(() => null);
  if (!bytes) return null;
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return pdf.embedPng(bytes);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return pdf.embedJpg(bytes);
  return null;
}

/**
 * Renders the certificate PDF to bytes. `cert` comes from certificateService.getCertificateForPdf.
 */
export async function renderCertificatePdf(cert) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`U.S.S.M.F. Medical Fitness Certificate ${cert.publicId}`);
  pdf.setAuthor("United States Sports Medicine Federation");
  pdf.setSubject("Air Sports Medical Fitness Certificate");
  pdf.setCreator("U.S.S.M.F.");
  const page = pdf.addPage([W, H]);
  const fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    mono: await pdf.embedFont(StandardFonts.CourierBold),
  };

  // Paper, security pattern, border
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.sky });
  guilloche(page);
  page.drawSvgPath(roundedRectPath(18, 18, W - 36, H - 36, 22), {
    x: 0,
    y: H,
    borderColor: C.blue,
    borderWidth: 1.6,
    borderOpacity: 0.45,
  });
  page.drawSvgPath(roundedRectPath(26, 26, W - 52, H - 52, 16), {
    x: 0,
    y: H,
    borderColor: C.coral,
    borderWidth: 0.8,
    borderOpacity: 0.4,
    borderDashArray: [3, 5],
  });

  // Header: seal + brand, certificate ID pill
  drawSeal(page, fonts, 78, H - 78, 64);
  page.drawText("U.S.S.M.F.", { x: 120, y: H - 76, size: 19, font: fonts.bold, color: C.ink });
  page.drawText("United States Sports Medicine Federation", {
    x: 120,
    y: H - 92,
    size: 9.5,
    font: fonts.regular,
    color: C.ink3,
  });
  const idText = `ID ${cert.publicId}`;
  const idWidth = fonts.mono.widthOfTextAtSize(idText, 10) + 22;
  page.drawSvgPath(roundedRectPath(W - 52 - idWidth, 66, idWidth, 26, 8), { x: 0, y: H, color: C.sky2 });
  page.drawText(idText, { x: W - 52 - idWidth + 11, y: H - 83, size: 10, font: fonts.mono, color: C.ink2 });

  // Title block
  centered(page, "AIR SPORTS DIVISION", {
    y: H - 150,
    size: 9.5,
    font: fonts.bold,
    color: C.ink3,
    charSpacing: 2.2,
  });
  centered(page, "Medical Fitness Certificate", { y: H - 184, size: 30, font: fonts.bold, color: C.ink });
  centered(
    page,
    "This certifies that the athlete named below has been medically reviewed and found fit to participate in",
    {
      y: H - 206,
      size: 10.5,
      font: fonts.regular,
      color: C.ink2,
    },
  );

  // Photo + name
  const photo = await embedPhoto(pdf, cert.photoKey);
  const name = safeText(fonts.bold, cert.athleteName);
  let nameSize = 32;
  while (fonts.bold.widthOfTextAtSize(name, nameSize) > 520 && nameSize > 18) nameSize -= 1;
  centered(page, name, { y: H - 258, size: nameSize, font: fonts.bold, color: C.blueD });

  const gridTop = H - 300;
  let gridX = 62;
  if (photo) {
    const box = { x: 62, y: gridTop - 112, w: 104, h: 112 };
    page.drawSvgPath(roundedRectPath(box.x - 4, H - box.y - box.h - 4, box.w + 8, box.h + 8, 22), {
      x: 0,
      y: H,
      color: C.white,
      borderColor: C.line,
      borderWidth: 1,
    });
    const s = Math.max(box.w / photo.width, box.h / photo.height);
    page.pushOperators(pushGraphicsState(), ...roundedClipOps(box.x, box.y, box.w, box.h, 18));
    page.drawImage(photo, {
      x: box.x + (box.w - photo.width * s) / 2,
      y: box.y + (box.h - photo.height * s) / 2,
      width: photo.width * s,
      height: photo.height * s,
    });
    page.pushOperators(popGraphicsState());
    gridX = 186;
  }

  // Detail grid
  const cells = [
    ["DISCIPLINE", cert.disciplineName],
    ["CLASS", cert.certificateClass],
    ["ISSUED", formatDate(cert.issuedAt)],
    ["EXPIRES", formatDate(cert.expiresAt)],
  ];
  const gap = 10;
  const cellW = (W - 62 - gridX - gap * 3) / 4;
  cells.forEach(([label, value], i) => {
    const x = gridX + i * (cellW + gap);
    page.drawSvgPath(roundedRectPath(x, H - gridTop, cellW, 56, 14), {
      x: 0,
      y: H,
      color: C.white,
      opacity: 0.85,
      borderColor: C.line,
      borderWidth: 1,
    });
    page.drawText(label, { x: x + 14, y: gridTop - 21, size: 8, font: fonts.bold, color: C.ink3 });
    let size = 12.5;
    const v = safeText(fonts.bold, value);
    while (fonts.bold.widthOfTextAtSize(v, size) > cellW - 26 && size > 8) size -= 0.5;
    page.drawText(v, { x: x + 14, y: gridTop - 41, size, font: fonts.bold, color: C.ink });
  });

  // Footer: physician signature, FIT TO FLY, QR
  const footY = 70;
  page.drawSvgPath(
    "M6 30c10-14 18-22 22-18s-8 20-2 20 12-22 18-20-2 18 4 18 10-14 16-14 2 12 8 10 10-10 18-8 6 8 14 6 20-6 32-8",
    { x: 58, y: footY + 96, scale: 1.25, borderColor: C.navy, borderWidth: 2 },
  );
  page.drawLine({
    start: { x: 62, y: footY + 38 },
    end: { x: 300, y: footY + 38 },
    thickness: 1.2,
    color: C.ink3,
  });
  page.drawText(safeText(fonts.bold, cert.physicianName || "Reviewing physician"), {
    x: 62,
    y: footY + 22,
    size: 10.5,
    font: fonts.bold,
    color: C.ink,
  });
  page.drawText("Reviewing physician · U.S.S.M.F. Medical Board", {
    x: 62,
    y: footY + 8,
    size: 9,
    font: fonts.regular,
    color: C.ink2,
  });

  const badgeW = 132;
  const badgeX = W / 2 - badgeW / 2 + 20;
  page.drawSvgPath(roundedRectPath(badgeX, H - footY - 66, badgeW, 34, 17), { x: 0, y: H, color: C.mint });
  centered(page, "FIT TO FLY", {
    x: badgeX + badgeW / 2 + 8,
    y: footY + 44,
    size: 12,
    font: fonts.bold,
    color: C.white,
    charSpacing: 1,
  });
  page.drawSvgPath("M5 12.5l4.5 4.5L19 7", {
    x: badgeX + 14,
    y: footY + 58,
    scale: 0.75,
    borderColor: C.white,
    borderWidth: 2.4,
  });

  const qrPng = await QRCode.toBuffer(cert.verifyUrl, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 360,
    color: { dark: "#0F1B3D", light: "#FFFFFF" },
  });
  const qr = await pdf.embedPng(qrPng);
  const qrSize = 96;
  const qrX = W - 62 - qrSize;
  page.drawSvgPath(roundedRectPath(qrX - 6, H - footY - qrSize - 18, qrSize + 12, qrSize + 12, 12), {
    x: 0,
    y: H,
    color: C.white,
    borderColor: C.line,
    borderWidth: 1,
  });
  page.drawImage(qr, { x: qrX, y: footY + 12, width: qrSize, height: qrSize });
  centered(page, cert.publicId, {
    x: qrX + qrSize / 2,
    y: footY - 6,
    size: 8,
    font: fonts.mono,
    color: C.ink2,
  });
  centered(page, "Scan to verify", {
    x: qrX + qrSize / 2,
    y: footY - 18,
    size: 7.5,
    font: fonts.regular,
    color: C.ink3,
  });

  // A downloaded copy of a certificate that is no longer valid says so on its face.
  const stamp = { expired: "EXPIRED", suspended: "SUSPENDED", revoked: "REVOKED" }[cert.state];
  if (stamp) {
    const size = 92;
    const width = fonts.bold.widthOfTextAtSize(stamp, size);
    page.drawText(stamp, {
      x: W / 2 - (width / 2) * Math.cos(Math.PI / 9.5),
      y: H / 2 - 40 - (width / 2) * Math.sin(Math.PI / 9.5),
      size,
      font: fonts.bold,
      color: C.coralD,
      opacity: 0.18,
      rotate: degrees(19),
    });
  }

  return pdf.save();
}
