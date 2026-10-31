import Link from "next/link";
import { formatDate } from "@/lib/format";
import { levelName } from "@/lib/disciplines";
import { StatusBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

/** Clay table of applications for physicians and admins. */
export default function ReviewQueue({ items, empty = "No applications match these filters." }) {
  if (!items.length) {
    return (
      <div className="panel clay empty">
        <span className="bubble lg t-mint">
          <Icon name="check" />
        </span>
        <h3>All clear</h3>
        <p>{empty}</p>
      </div>
    );
  }
  return (
    <div className="ctable-wrap">
      <table className="ctable">
        <thead>
          <tr>
            <th scope="col">Application</th>
            <th scope="col">Athlete</th>
            <th scope="col">Discipline</th>
            <th scope="col">Level</th>
            <th scope="col">Submitted</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>
                <code>{a.publicId}</code>
              </td>
              <td>
                <b>{a.athleteName}</b>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{a.email}</div>
              </td>
              <td>{a.disciplineName}</td>
              <td>{levelName(a.level)}</td>
              <td style={{ whiteSpace: "nowrap" }}>{formatDate(a.submittedAt)}</td>
              <td>
                <StatusBadge status={a.status} />
                {a.physician ? (
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{a.physician}</div>
                ) : null}
              </td>
              <td>
                <Link
                  className="btn btn-glass btn-sm"
                  href={`/admin/applications/${a.id}`}
                  aria-label={`Review ${a.publicId}`}
                >
                  Review <Icon name="arrow" className="arrow" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
