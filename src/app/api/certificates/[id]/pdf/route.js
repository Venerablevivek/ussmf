import { handler } from "@/server/http/handler";
import { getCertificateForPdf } from "@/server/services/certificateService";
import { renderCertificatePdf } from "@/server/services/pdfService";
import { audit } from "@/server/services/auditService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner, physicians and admins only. Rendered on request; every download is audited.
export const GET = handler(
  async ({ user, params, ip }) => {
    const cert = await getCertificateForPdf(user, params.id);
    const bytes = await renderCertificatePdf(cert);
    await audit({
      actorId: user.id,
      action: "certificate.downloaded",
      entityType: "certificate",
      entityId: cert.id,
      metadata: { publicId: cert.publicId, role: user.role },
      ip,
    });
    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.publicId}.pdf"`,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
      },
    });
  },
  { auth: true, rateLimit: "pdf" },
);
