'use client'

import React, { useState, useEffect } from 'react'
import { Plus, CaretLeft, CaretRight, ClipboardText } from '@phosphor-icons/react'
import { SkeletonTableRow } from '@/components/ui/Skeleton'
import TreatmentForm from '@/components/treatments/TreatmentForm'
import TreatmentCompletionForm from '@/components/treatments/TreatmentCompletionForm'
import { getTreatments } from './actions'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Badge } from '@/components/ui/Badge'

export default function TreatmentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [completionTarget, setCompletionTarget] = useState<any>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await getTreatments()
      setTreatments(data)
    } catch (e: any) {
      setFetchError(e?.message || '데이터 로드 실패')
    }
    setLoading(false)
  }

  const pending = treatments.filter(t => t.status === 'pending')
  const completed = treatments.filter(t => t.status !== 'pending')

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 md:sticky md:top-0 md:z-20 md:bg-background md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">시술 기록 관리</h1>
          <p className="text-muted-foreground">고객님의 시술 내역을 확인하고 새로운 기록을 등록하세요.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary shadow-lg shadow-primary/20 group">
          <Plus weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
          <span>신규 시술 등록</span>
        </button>
      </div>

      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          오류: {fetchError}
        </div>
      )}

      {/* 대기 중인 시술 */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            시술 대기 ({pending.length}건)
          </h2>
          <div className="flex flex-col gap-2">
            {pending.map(t => (
              <div key={t.id} className="bg-warning/5 border border-warning/20 rounded-xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">{t.customer?.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(t.treated_at), 'yyyy.MM.dd HH:mm', { locale: ko })} · {t.type?.name}
                    </span>
                  </div>
                  <Badge variant="warning" className="text-xs px-2.5 py-1">시술대기</Badge>
                </div>
                <button
                  onClick={() => setCompletionTarget(t)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
                >
                  <ClipboardText size={16} weight="fill" />
                  시술완료
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 완료된 시술 기록 */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
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
            {loading ? (
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

      {/* 신규 시술 등록 모달 */}
      {showForm && (
        <TreatmentForm
          onSuccess={() => { setShowForm(false); fetchTreatments() }}
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
          onSuccess={() => { setCompletionTarget(null); fetchTreatments() }}
        />
      )}
    </div>
  )
}
