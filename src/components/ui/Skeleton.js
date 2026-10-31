/** Clay loading placeholders shown while server components stream in. */
export function SkeletonBlock({ height = 18, width = "100%", style }) {
  return (
    <span className="skeleton" style={{ display: "block", height, width, ...style }} aria-hidden="true" />
  );
}

export default function PageSkeleton({ cards = 2 }) {
  return (
    <div className="app-main" aria-busy="true" aria-live="polite">
      <div className="wrap">
        <span className="sr-only">Loading…</span>
        <div className="page-head">
          <div style={{ display: "grid", gap: 12, width: "min(420px, 100%)" }}>
            <SkeletonBlock height={28} width={160} />
            <SkeletonBlock height={40} />
            <SkeletonBlock height={16} width="80%" />
          </div>
        </div>
        <div className="grid-2">
          <div className="stack">
            {Array.from({ length: cards }, (_, i) => (
              <div key={i} className="panel clay">
                <SkeletonBlock height={22} width="40%" />
                <SkeletonBlock height={14} />
                <SkeletonBlock height={14} width="90%" />
                <SkeletonBlock height={14} width="70%" />
              </div>
            ))}
          </div>
          <div className="stack">
            <div className="panel clay">
              <SkeletonBlock height={22} width="50%" />
              <SkeletonBlock height={60} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
