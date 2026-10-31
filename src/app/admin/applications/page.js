import { requirePageRole } from "@/server/auth/guards";
import { listApplications } from "@/server/services/applicationService";
import { applicationsQuerySchema } from "@/lib/validators";
import Eyebrow from "@/components/ui/Eyebrow";
import QueueFilters from "@/components/admin/QueueFilters";
import ReviewQueue from "@/components/admin/ReviewQueue";
import Pager from "@/components/admin/Pager";

export const metadata = { title: "Applications" };

export default async function AdminApplicationsPage({ searchParams }) {
  await requirePageRole(["physician", "admin"], "/admin/applications");
  const query = applicationsQuerySchema.parse(await searchParams);
  const result = await listApplications(query);
  return (
    <>
      <div className="page-head">
        <div>
          <Eyebrow tone="blue">Applications</Eyebrow>
          <h1 style={{ marginTop: 12 }}>Review queue</h1>
          <p>Filter by status, discipline and level, or search by name, ID or email.</p>
        </div>
      </div>
      <div className="stack">
        <QueueFilters query={query} />
        <ReviewQueue items={result.items} />
        <Pager
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/admin/applications"
          query={{
            q: query.q,
            status: query.status,
            discipline: query.discipline,
            level: query.level,
            sort: query.sort,
          }}
        />
      </div>
    </>
  );
}
