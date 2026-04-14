'use client'

import React, { useState } from 'react'
import { format, parseISO, isToday, addDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus, X } from '@phosphor-icons/react'
import { deleteReservation } from '@/app/reservations/actions'

interface WeeklyViewProps {
  weekData: Record<string, any[]>
  weekStart: Date
  onAdd?: (date: Date, time: string) => void
  onDayClick?: (date: Date) => void
  onRefresh?: () => void
}

export default function WeeklyView({ weekData, weekStart, onAdd, onDayClick, onRefresh }: WeeklyViewProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  async function handleDelete(id: string) {
    if (!confirm('예약을 삭제하시겠습니까?')) return
    setDeletingId(id)
    try {
      await deleteReservation(id)
      onRefresh?.()
    } catch (e: any) {
      alert('삭제 실패: ' + e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border card-shadow mt-6 overflow-hidden">
      {days.map((day, i) => {
        const dateKey = format(day, 'yyyy-MM-dd')
        const reservations = weekData[dateKey] || []
        const today = isToday(day)
        const isSat = i === 5
        const isSun = i === 6

        return (
          <div
            key={dateKey}
            className={`flex items-start border-b border-border last:border-0 ${today ? 'bg-primary/5' : 'hover:bg-muted/30'} transition-colors`}
          >
            {/* 날짜 영역 */}
            <div
              className="w-24 md:w-32 shrink-0 p-4 cursor-pointer flex flex-col items-center justify-center border-r border-border min-h-[80px]"
              onClick={() => onDayClick?.(day)}
            >
              <div className={`text-xs font-bold mb-1 ${isSun ? 'text-danger' : isSat ? 'text-blue-500' : 'text-muted-foreground'}`}>
                {format(day, 'EEEE', { locale: ko })}
              </div>
              <div className={`text-xl font-black w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                today ? 'bg-primary text-primary-foreground' : 'text-foreground'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{format(day, 'MM/dd')}</div>
            </div>

            {/* 예약 목록 영역 */}
            <div className="flex-1 p-3 flex flex-wrap gap-2 items-start min-h-[80px]">
              {reservations.length === 0 ? (
                <button
                  onClick={() => onAdd?.(day, '10:00')}
                  className="text-xs text-muted-foreground border border-dashed border-border rounded-lg px-3 py-2 hover:border-primary hover:text-primary transition-all flex items-center gap-1"
                >
                  <Plus size={12} weight="bold" />
                  예약 추가
                </button>
              ) : (
                <>
                  {reservations.map(res => {
                    const isCompleted = res.status === '시술완료'
                    return (
                      <div
                        key={res.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-l-4 text-sm ${
                          isCompleted
                            ? 'bg-muted/60 border-muted-foreground/30 opacity-60'
                            : 'bg-primary/5 border-primary hover:bg-primary/10 transition-colors'
                        }`}
                      >
                        <span className="font-black text-primary text-base">
                          {format(parseISO(res.reserved_at), 'HH:mm')}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground leading-tight">{res.customer?.name}</span>
                          {res.treatment_type && (
                            <span className="text-[11px] text-muted-foreground leading-tight">{res.treatment_type.name}</span>
                          )}
                        </div>
                        <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isCompleted ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          {res.status}
                        </span>
                        {!isCompleted && (
                          <button
                            onClick={() => handleDelete(res.id)}
                            disabled={deletingId === res.id}
                            className="ml-auto p-1 text-muted-foreground hover:text-danger transition-colors disabled:opacity-50"
                          >
                            <X size={14} weight="bold" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                  <button
                    onClick={() => onAdd?.(day, '10:00')}
                    className="text-xs text-muted-foreground border border-dashed border-border rounded-lg px-3 py-2 hover:border-primary hover:text-primary transition-all flex items-center gap-1"
                  >
                    <Plus size={12} weight="bold" />
                    추가
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
