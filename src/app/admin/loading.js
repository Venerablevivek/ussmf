import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="stack" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="stat-tiles">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="stat-tile clay">
            <SkeletonBlock height={34} width="50%" />
            <SkeletonBlock height={14} width="80%" />
          </div>
        ))}
      </div>
      {Array.from({ length: 5 }, (_, i) => (
        <SkeletonBlock key={i} height={58} style={{ borderRadius: 16 }} />
      ))}
    </div>
  );
}
