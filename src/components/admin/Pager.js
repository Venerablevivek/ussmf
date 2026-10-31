import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/** Previous / next pagination that keeps the current filters in the query string. */
export default function Pager({ page, pageSize, total, basePath, query = {} }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p) => {
    const params = new URLSearchParams(
      Object.entries({ ...query, page: String(p) }).filter(([, v]) => v !== "" && v != null),
    );
    return `${basePath}?${params.toString()}`;
  };
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className="pager" aria-label="Pagination">
      <span>
        {from}–{to} of {total}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        {page > 1 ? (
          <Link className="btn btn-glass btn-sm" href={href(page - 1)}>
            <Icon name="arrow" style={{ transform: "scaleX(-1)" }} /> Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link className="btn btn-glass btn-sm" href={href(page + 1)}>
            Next <Icon name="arrow" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
