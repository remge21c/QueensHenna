'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { format, parseISO } from 'date-fns'
import { Plus, X } from '@phosphor-icons/react'
import { deleteReservation } from '@/app/reservations/actions'

interface Reservation {
  id: string
  reserved_at: string
  status: string
  customer: { name: string }
  treatment_type?: { name: string } | null
  memo: string
}

interface ReservationTimelineProps {
  reservations: Reservation[]
  selectedDate: string
  onAdd?: (time: string) => void
  onRefresh?: () => void
}

export default function ReservationTimeline({ reservations, selectedDate, onAdd, onRefresh }: ReservationTimelineProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  async function handleCancel(id: string) {
    if (!confirm('예약을 삭제하시겠습니까?')) return
    setCancellingId(id)
    try {
      await deleteReservation(id)
      onRefresh?.()
    } catch (e: any) {
      alert('삭제 실패: ' + e.message)
    } finally {
      setCancellingId(null)
    }
  }

  const slots = Array.from({ length: 12 }, (_, i) => i + 9)

  const getReservationsForSlot = (hour: number) => {
    return reservations.filter(res => {
      const date = parseISO(res.reserved_at)
      return date.getHours() === hour && res.status !== '취소' && res.status !== '노쇼'
    })
  }

  return (
    <div className="bg-card rounded-xl p-6 card-shadow border border-border mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {slots.map(hour => {
              const slotReservations = getReservationsForSlot(hour)
              const timeLabel = `${hour.toString().padStart(2, '0')}:00`

              return (
                <tr key={hour} className="border-b border-surface-variant last:border-0 group/row">
                  <td className="py-4 md:py-6 pr-3 md:pr-6 font-semibold text-muted-foreground border-r border-surface-variant w-[60px] md:w-[100px] text-center align-top whitespace-nowrap text-sm md:text-base">
                    <div className="flex flex-col items-center gap-1">
                      <span>{timeLabel}</span>
                      {slotReservations.length >= 3 && (
                        <Badge variant="danger" className="text-[10px] px-1.5 py-0 animate-bounce">
                          겹침 주의
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pl-3 md:pl-6 align-top">
                    {slotReservations.length > 0 ? (
                      <div className="grid gap-3">
                        {slotReservations.map(res => {
                          const isCompleted = res.status === '시술완료'
                          const isCancelled = res.status === '취소' || res.status === '노쇼'
                          const cardClass = isCompleted
                            ? 'bg-muted/60 border-l-4 border-muted-foreground/30 p-4 rounded-xl flex justify-between items-start transition-colors opacity-70'
                            : isCancelled
                            ? 'bg-danger/5 border-l-4 border-danger/40 p-4 rounded-xl flex justify-between items-start transition-colors opacity-60'
                            : 'bg-primary/5 border-l-4 border-primary p-4 rounded-xl flex justify-between items-start hover:bg-primary/10 transition-colors cursor-pointer group/card'
                          return (
                          <div key={res.id} className={cardClass}>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-foreground text-lg">{res.customer.name}</span>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {format(parseISO(res.reserved_at), 'HH:mm')}
                                </span>
                                {res.treatment_type && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                    {res.treatment_type.name}
                                  </span>
                                )}
                              </div>
                              {res.memo && <p className="text-sm text-on-surface-variant leading-relaxed">{res.memo}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={isCompleted ? 'secondary' : isCancelled ? 'danger' : 'success'}
                                className="px-3 py-1 text-sm font-medium"
                              >
                                {res.status}
                              </Badge>
                              {res.status === '예약' && (
                                <button
                                  onClick={() => handleCancel(res.id)}
                                  disabled={cancellingId === res.id}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-bold hover:bg-danger/10 hover:text-danger transition-all disabled:opacity-50"
                                >
                                  <X size={14} weight="bold" />
                                  삭제
                                </button>
                              )}
                            </div>
                          </div>
                          )
                        })}
                      </div>
                    ) : (
                      <button
                        onClick={() => onAdd?.(timeLabel)}
                        className="w-full border border-dashed border-border text-outline-variant text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-muted hover:border-primary hover:text-primary transition-all group/btn"
                      >
                        <Plus weight="bold" className="group-hover/btn:scale-110 transition-transform" />
                        <span>예약 추가</span>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
