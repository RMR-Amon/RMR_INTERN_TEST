import { Skeleton, SkeletonCard } from '@/components/ui'

/** Loading skeleton shown while a lazy route chunk loads. */
export function RouteFallback() {
  return (
    <div className="page" aria-busy="true">
      <Skeleton width={220} height={14} />
      <Skeleton width="min(480px, 80%)" height={34} />
      <div className="page-grid">
        <div className="stack">
          <SkeletonCard lines={4} height={220} />
          <SkeletonCard lines={3} />
        </div>
        <div className="stack">
          <SkeletonCard lines={2} />
        </div>
      </div>
    </div>
  )
}
