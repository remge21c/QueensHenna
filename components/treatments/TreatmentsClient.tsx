'use client'

import React, { useState, useTransition } from 'react'
import { Plus, ClipboardText, CaretRight } from '@phosphor-icons/react'
import { SkeletonTableRow } from '@/components/ui/Skeleton'
import TreatmentForm from '@/components/treatments/TreatmentForm'
import TreatmentCompletionForm from '@/components/treatments/TreatmentCompletionForm'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Badge } from '@/components/ui/Badge'
import { useRouter } from 'next/navigation'

interface Props {
  treatments: any[]
}

export default function TreatmentsClient({ treatments }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [completionTarget, setCompletionTarget] = useState<any>(null)

  const refresh = () => startTransition(() => router.refresh())

  const pending = treatments.filter(t => t.status === 'pending')
  const completed = treatments.filter(t => t.status !== 'pending')

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 pb-6 md:sticky md:top-0 md:z-20 md:bg-background md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">시술 기록 관리</h1>
          <p className="hidden sm:block text-muted-foreground">고객님의 시술 내역을 확인하고 새로운 기록을 등록하세요.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary shadow-lg shadow-primary/20 group shrink-0">
          <Plus weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">신규 시술 등록</span>
          <span className="sm:hidden">등록</span>
        </button>
      </div>

      {/* 대기 중인 시술 */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            시술 대기 ({pending.length}건)
          </h2>
          <div className="flex flex-col gap-2">
            {pending.map(t => (
              <div key={t.id} className="bg-warning/5 border border-warning/20 rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">{t.customer?.name}</span>
                      <Badge variant="warning" className="text-xs px-2.5 py-1 shrink-0">시술대기</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5 truncate">
                      {format(new Date(t.treated_at), 'yyyy.MM.dd HH:mm', { locale: ko })} · {t.type?.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCompletionTarget(t)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shrink-0 min-h-[44px] w-full sm:w-auto"
                >
                  <ClipboardText size={16} weight="fill" />
                  시술완료 처리
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 완료된 시술 기록 */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">

        {/* 모바일: 카드 리스트 */}
        <div className="md:hidden divide-y divide-border/50">
          {isPending ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : completed.length > 0 ? (
            completed.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                {/* 좌측: 날짜 + 내용 */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* 날짜 */}
                  <div className="w-[4.5rem] shrink-0">
                    <div className="text-xs font-black text-primary leading-tight">
                      {format(new Date(t.treated_at), 'yyyy.MM.dd')}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(t.treated_at), 'a hh:mm', { locale: ko })}
                    </div>
                  </div>
                  {/* 고객·시술 정보 */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-foreground text-sm">{t.customer?.name}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary whitespace-nowrap">
                        {t.type?.name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                      {t.total_price?.toLocaleString()}원 · {t.payment_method}
                    </div>
                  </div>
                </div>
                {/* 우측: 상태 뱃지 */}
                <Badge variant="success" className="shrink-0">완료</Badge>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-muted-foreground">완료된 시술 기록이 없습니다.</div>
          )}
        </div>

        {/* 데스크탑: 테이블 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <th className="px-8 py-4">시술 일시</th>
                <th className="px-6 py-4">고객명</th>
                <th className="px-6 py-4">시술 종류</th>
                <th className="px-6 py-4">결제 금액</th>
                <th className="px-6 py-4">결제 수단</th>
                <th className="px-8 py-4 text-right">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isPending ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
              ) : completed.length > 0 ? (
                completed.map(t => (
                  <tr key={t.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-foreground">
                        {format(new Date(t.treated_at), 'yyyy.MM.dd', { locale: ko })}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {format(new Date(t.treated_at), 'a hh:mm', { locale: ko })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-foreground">{t.customer?.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{t.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {t.type?.name}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-foreground">{t.total_price?.toLocaleString()}원</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs text-muted-foreground">{t.payment_method}</div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Badge variant="success">완료</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-muted-foreground">완료된 시술 기록이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 신규 시술 등록 모달 */}
      {showForm && (
        <TreatmentForm
          onSuccess={() => { setShowForm(false); refresh() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* 시술 완료 처리 모달 */}
      {completionTarget && (
        <TreatmentCompletionForm
          treatmentId={completionTarget.id}
          reservationId={completionTarget.reservation_id}
          customerId={completionTarget.customer_id}
          customerName={completionTarget.customer?.name}
          treatmentTypeName={completionTarget.type?.name}
          basePrice={completionTarget.type?.base_price ?? 0}
          reservedAt={completionTarget.treated_at}
          onClose={() => setCompletionTarget(null)}
          onSuccess={() => { setCompletionTarget(null); refresh() }}
        />
      )}
    </div>
  )
}
