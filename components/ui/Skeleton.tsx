import { cn } from '@/lib/utils'

// ── Primitive ─────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-container',
        className
      )}
    />
  )
}

// ── KPI 카드 스켈레톤 ─────────────────────────────────────
export function SkeletonKpi() {
  return (
    <div className="bg-card p-4 md:p-8 rounded-xl border border-border card-shadow overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      </div>
      <Skeleton className="h-7 w-32 mt-3" />
    </div>
  )
}

// ── 테이블 행 스켈레톤 ────────────────────────────────────
export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  const widths = ['w-16', 'w-28', 'w-20', 'w-24', 'w-16', 'w-20']
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-5 px-2 first:pl-2">
          <Skeleton className={cn('h-4', widths[i % widths.length])} />
        </td>
      ))}
    </tr>
  )
}

// ── 일반 카드 스켈레톤 ────────────────────────────────────
export function SkeletonCard({ className, rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div className={cn('bg-card rounded-xl border border-border p-5 md:p-8 card-shadow', className)}>
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className={cn('h-14 rounded-xl', i % 2 === 1 && 'opacity-60')} />
        ))}
      </div>
    </div>
  )
}

// ── 대시보드 전체 스켈레톤 ────────────────────────────────
export function SkeletonDashboard() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* KPI 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKpi key={i} />
        ))}
      </div>
      {/* 본문 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <SkeletonCard rows={4} />
          <SkeletonCard rows={3} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-8">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={2} />
        </div>
      </div>
    </div>
  )
}

// ── 매출 페이지 스켈레톤 ──────────────────────────────────
export function SkeletonSales() {
  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      <div className="pb-6">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKpi key={i} />
        ))}
      </div>
      <SkeletonCard rows={6} />
      <SkeletonCard rows={4} />
    </div>
  )
}

// ── 시술 페이지 스켈레톤 ──────────────────────────────────
export function SkeletonTreatments() {
  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      <div className="pb-6 flex justify-between items-start">
        <div>
          <Skeleton className="h-8 w-44 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <SkeletonCard rows={3} />
      <SkeletonCard rows={4} />
    </div>
  )
}
