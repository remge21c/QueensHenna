import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton"

export default function InventoryLoading() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* 헤더 */}
      <div className="flex justify-between items-center pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-7 w-32 mb-1" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* 테이블 카드 */}
      <SkeletonCard rows={6} />
    </div>
  )
}
