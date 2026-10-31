import { DISCIPLINES, LEVELS } from "@/lib/disciplines";
import { STATUS_META } from "@/lib/statuses";
import { Icon } from "@/components/ui/Icon";

const STATUS_OPTIONS = [
  ["", "All (submitted)"],
  ["open", "Open for review"],
  ...Object.entries(STATUS_META)
    .filter(([s]) => s !== "draft")
    .map(([s, m]) => [s, m.label]),
];

/** Filter / search / sort form. Plain GET so filters live in the URL and the server renders results. */
export default function QueueFilters({ query }) {
  return (
    <form className="filters panel clay" method="get" action="/admin/applications" role="search">
      <div className="field" style={{ flex: "2 1 220px" }}>
        <label htmlFor="q">Search</label>
        <input
          className="inp"
          id="q"
          name="q"
          defaultValue={query.q}
          placeholder="Name, application ID or email"
        />
      </div>
      <div className="field">
        <label htmlFor="status">Status</label>
        <select className="inp" id="status" name="status" defaultValue={query.status}>
          {STATUS_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="discipline">Discipline</label>
        <select className="inp" id="discipline" name="discipline" defaultValue={query.discipline}>
          <option value="">All disciplines</option>
          {DISCIPLINES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="level">Level</label>
        <select className="inp" id="level" name="level" defaultValue={query.level}>
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="sort">Sort</label>
        <select className="inp" id="sort" name="sort" defaultValue={query.sort}>
          <option value="submitted_desc">Newest submitted</option>
          <option value="submitted_asc">Oldest submitted</option>
          <option value="updated_desc">Recently updated</option>
        </select>
      </div>
      <button className="btn btn-primary btn-sm" type="submit">
        <Icon name="search" /> Apply
      </button>
    </form>
  );
}
