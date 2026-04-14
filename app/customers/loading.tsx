import { SkeletonCard, SkeletonTableRow, Skeleton } from "@/components/ui/Skeleton"

export default function CustomersLoading() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* 헤더 */}
      <div className="flex justify-between items-center pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-7 w-28 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* 테이블 */}
      <div className="bg-card rounded-xl border border-border card-shadow p-6">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              {["고객명", "연락처", "최근 방문일", "누적 방문", "보유 염색약", "상태"].map((h) => (
                <th key={h} className="text-left py-3 px-4">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={6} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
