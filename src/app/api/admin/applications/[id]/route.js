import { handler } from "@/server/http/handler";
import { getApplicationForReview } from "@/server/services/applicationService";
import { auditTrailForApplication } from "@/server/services/auditService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(
  async ({ params }) => {
    const [application, audit] = await Promise.all([
      getApplicationForReview(params.id),
      auditTrailForApplication(params.id),
    ]);
    return { application, audit };
  },
  { auth: ["physician", "admin"], rateLimit: "read" },
);
