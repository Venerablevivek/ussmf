import Link from "next/link";
import { requirePageRole } from "@/server/auth/guards";
import { listCertificates } from "@/server/services/certificateService";
import { certificatesQuerySchema } from "@/lib/validators";
import { formatDate } from "@/lib/format";
import Eyebrow from "@/components/ui/Eyebrow";
import { CertificateStateBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import CertificateActions from "@/components/admin/CertificateActions";
import Pager from "@/components/admin/Pager";

export const metadata = { title: "Certificates" };

export default async function AdminCertificatesPage({ searchParams }) {
  const user = await requirePageRole(["physician", "admin"], "/admin/certificates");
  const query = certificatesQuerySchema.parse(await searchParams);
  const result = await listCertificates(query);

  return (
    <>
      <div className="page-head">
        <div>
          <Eyebrow tone="mint">Certificates</Eyebrow>
          <h1 style={{ marginTop: 12 }}>Issued certificates</h1>
          <p>
            {user.role === "admin"
              ? "Search, download, and suspend, reinstate or revoke with a reason."
              : "Search and download. Status changes are made by administrators."}
          </p>
        </div>
      </div>
      <div className="stack">
        <form className="filters panel clay" method="get" role="search">
          <div className="field" style={{ flex: "2 1 240px" }}>
            <label htmlFor="q">Search</label>
            <input
              className="inp"
              id="q"
              name="q"
              defaultValue={query.q}
              placeholder="Certificate ID, athlete name or email"
            />
          </div>
          <div className="field">
            <label htmlFor="state">Status</label>
            <select className="inp" id="state" name="state" defaultValue={query.state}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm" type="submit">
            <Icon name="search" /> Apply
          </button>
        </form>

        {result.items.length ? (
          <div className="ctable-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th scope="col">Certificate</th>
                  <th scope="col">Athlete</th>
                  <th scope="col">Discipline · class</th>
                  <th scope="col">Valid</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/verify/${c.publicId}`} target="_blank">
                        <code>{c.publicId}</code>
                      </Link>
                    </td>
                    <td>
                      <b>{c.athleteName}</b>
                      <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{c.email}</div>
                    </td>
                    <td>
                      {c.disciplineName}
                      <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{c.certificateClass}</div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {formatDate(c.issuedAt)} –<br />
                      {formatDate(c.expiresAt)}
                    </td>
                    <td>
                      <CertificateStateBadge state={c.state} />
                      {c.statusReason ? (
                        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, maxWidth: 220 }}>
                          {c.statusReason}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <a
                          className="btn btn-glass btn-sm"
                          href={`/api/certificates/${c.id}/pdf`}
                          download
                          aria-label={`Download PDF for ${c.publicId}`}
                        >
                          <Icon name="download" /> PDF
                        </a>
                        <CertificateActions
                          certificateId={c.id}
                          publicId={c.publicId}
                          status={c.status}
                          canManage={user.role === "admin"}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel clay empty">
            <span className="bubble lg t-mint">
              <Icon name="medal" />
            </span>
            <h3>No certificates found</h3>
            <p>Try a different search or status.</p>
          </div>
        )}
        <Pager
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/admin/certificates"
          query={{ q: query.q, state: query.state }}
        />
      </div>
    </>
  );
}
