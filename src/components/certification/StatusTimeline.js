import StatusDot from "@/components/ui/StatusDot";

/** The design's clay stage timeline. `stages` come from buildTimeline() in src/lib/statuses.js. */
export default function StatusTimeline({ stages, style }) {
  return (
    <ol className="status-tl" style={style}>
      {stages.map((s) => (
        <li key={s.label} className={s.state || undefined}>
          <StatusDot icon={s.icon} />
          <div>
            <b>{s.label}</b>
            <span>{s.sub}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
