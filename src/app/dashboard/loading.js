import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="grid-2" aria-busy="true">
      <span className="sr-only">Loading your dashboard…</span>
      <div className="stack">
        {[0, 1].map((i) => (
          <div key={i} className="panel clay">
            <SkeletonBlock height={48} />
            {[0, 1, 2, 3, 4].map((j) => (
              <SkeletonBlock key={j} height={30} width={`${90 - j * 8}%`} />
            ))}
          </div>
        ))}
      </div>
      <div className="stack">
        <div className="panel clay">
          <SkeletonBlock height={22} width="50%" />
          <SkeletonBlock height={80} />
        </div>
      </div>
    </div>
  );
}
